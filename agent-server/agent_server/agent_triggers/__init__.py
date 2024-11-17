"""Agent trigger system for managing event-driven agent interactions.

This module provides the core functionality for triggering agent actions based on various events.
It coordinates between the event system, agent streams, and manages the timing and execution
of agent responses.

Key Features:
- Event queue management for handling multiple event types
- Timestamp-based interruption handling
- Coordination between events and agent streams
- Automatic event handler attachment

Example:
    ```python
    agent_trigger = AgentTrigger(
        stream=agent_stream,
        events=[
            ReminderEvent(assistant=assistant),
            CodeSessionEvent(event_type="content_changed", session=session),
            UserMessageEvent(event_q=message_queue),
        ]
    )
    agent_trigger.start()
    await agent_trigger.trigger()
    ```
"""

import asyncio
import logging
from typing import Any, Dict, List, Tuple

from agent_server.agent_streams import AgentStream
from agent_server.events import BaseEvent
from agent_server.utils.profiler import get_profiler
from langchain_core.messages import AIMessage, AnyMessage, HumanMessage
from pydantic.v1 import BaseModel, Field, PrivateAttr

from libs.timestamp import Timestamp
from libs.types import MessageWrapper

logger = logging.getLogger(__name__)

pf = get_profiler()


class AgentTrigger(BaseModel):
    """Manages event-driven triggers for agent interactions.

    This class coordinates between events and agent streams, managing when and how
    the agent should respond to different types of events.

    Attributes:
        stream (AgentStream): The agent stream to trigger
        _events (List[BaseEvent]): List of events to monitor
        _timestamp (Timestamp): Timestamp for managing interruptions
        _event_q (asyncio.Queue): Queue for handling event processing
        _started (bool): Flag indicating if the trigger has been started
    """

    stream: AgentStream = Field(..., description="The agent stream to trigger")

    state_update_q: asyncio.Queue[Dict] = Field(
        ..., description="The queue for updating state snapshots"
    )

    _events: List[BaseEvent] = PrivateAttr()

    _timestamp: Timestamp = PrivateAttr()

    _event_q: asyncio.Queue[Tuple[str, Any]] = PrivateAttr()

    _started: bool = PrivateAttr(default=False)

    class Config:
        arbitrary_types_allowed = True

    def __init__(
        self,
        stream: AgentStream,
        events: List[BaseEvent],
        state_update_q: asyncio.Queue[Dict],
    ):
        super().__init__(stream=stream, state_update_q=state_update_q)

        self._events = events
        self._timestamp = Timestamp()
        self._event_q = asyncio.Queue()

        # Attach event handlers to all events
        self._attach_event_handlers()

    def interrupt(self):
        """Interrupts the current agent action by refreshing the timestamp."""
        self._timestamp.refresh()

    async def trigger(self):
        """Triggers the agent manually by adding a trigger event to the queue."""
        await self._event_q.put(("trigger", None))

    async def add_messages(self, messages: List[AnyMessage]):
        await self._event_q.put(("add_messages", MessageWrapper(messages=messages)))

    async def add_human_message(self, message: str):
        messages = [HumanMessage(content=message)]
        await self.add_messages(messages)  # type: ignore

    async def add_ai_message(self, message: str):
        messages = [AIMessage(content=message)]
        await self.add_messages(messages)  # type: ignore

    def _create_event_handler(self, event: BaseEvent):
        """Creates an event handler for a specific event type.
        Specifically, this method takes an event and returns an async function
        that puts the event and its data into the event queue.

        Args:
            event: The event to create a handler for

        Returns:
            An async function that handles the event
        """

        async def handler(data: Any):
            await self._event_q.put((event.event_name, data))

        return handler

    def _attach_event_handlers(self):
        """Attaches handlers to all registered events.
        This method iterates over all events and registers a handler to each one, which will be called at the time of event emission.
        The event handler is responsible for putting the event and its data into the event queue,
        which will be picked up by the main event processing loop by AgentTrigger.
        """
        for event in self._events:
            event.register_callback(self._create_event_handler(event))

    async def _trigger_task(self, is_user_message: bool):
        """Executes the agent trigger task.

        Args:
            is_user_message: Whether the trigger was caused by a user message
        """
        self.interrupt()
        logger.info(f"Triggering agent with timestamp: {self._timestamp}")
        await self.stream.trigger_agent(self._timestamp, is_user_message)

    async def _main_task(self):
        """Main event processing loop.

        Continuously processes events from the queue and determines whether
        to trigger the agent based on the event type and data.
        """

        while True:
            event, data = await self._event_q.get()
            pf.point(
                ["agent_trigger.main_task.event", f"agent_trigger.main_task.{event}"]
            )

            logger.info(f"Receiving event: {event} with data: {data}")

            with pf.interval(f"agent_trigger.main_task.notify_agent.{event}"):
                should_trigger = await self.stream.notify_agent(event, data)

            if should_trigger:
                is_user_message = event == "user_message"
                asyncio.create_task(self._trigger_task(is_user_message))
            else:
                logger.info(f"Failed to trigger agent for event: {event}")

    async def _process_state_snapshot(self):
        while True:
            state_snapshot = await self.state_update_q.get()
            logger.info(f"Processing state snapshot: {state_snapshot}")
            await self.stream.state_merger.merge_state(state_snapshot)

    def start(self):
        """Starts the agent trigger system.

        Initializes all events and starts the main event processing loop.
        Can only be called once.
        """
        if self._started:
            logger.warning("Agent trigger already started")
            return

        self._started = True

        for event in self._events:
            event.setup()

        asyncio.gather(
            self._main_task(),
            self._process_state_snapshot(),
            return_exceptions=True,
        )
