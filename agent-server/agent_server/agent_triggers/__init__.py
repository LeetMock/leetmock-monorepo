import asyncio
import logging
from typing import Any, List, Tuple

from agent_server.agent_streams import AgentStream
from agent_server.events import BaseEvent
from pydantic.v1 import BaseModel, Field, PrivateAttr

from libs.timestamp import Timestamp

logger = logging.getLogger(__name__)


class AgentTrigger(BaseModel):

    stream: AgentStream = Field(..., description="The agent stream to trigger")

    _events: List[BaseEvent] = PrivateAttr()

    _timestamp: Timestamp = PrivateAttr()

    _event_q: asyncio.Queue[Tuple[str, Any]] = PrivateAttr()

    _started: bool = PrivateAttr(default=False)

    class Config:
        arbitrary_types_allowed = True

    def __init__(self, stream: AgentStream, events: List[BaseEvent]):
        super().__init__(stream=stream)

        self._events = events
        self._timestamp = Timestamp()
        self._event_q = asyncio.Queue()

        # Attach event handlers
        self._attach_event_handlers()

    def interrupt(self):
        self._timestamp.refresh()

    async def trigger(self):
        await self._event_q.put(("trigger", None))

    def _create_event_handler(self, event: BaseEvent):
        async def handler(data: Any):
            logger.info(f"Receiving event: {event.event_name} with data: {data}")
            await self._event_q.put((event.event_name, data))

        return handler

    def _attach_event_handlers(self):
        for event in self._events:
            event.on_event(self._create_event_handler(event))

    async def _trigger_task(self, is_user_message: bool):
        self.interrupt()
        logger.info(f"Triggering agent with timestamp: {self._timestamp}")
        await self.stream.trigger_agent(self._timestamp, is_user_message)

    async def _main_task(self):
        while True:
            event, data = await self._event_q.get()
            logger.info(f"Sending event: {event} with data: {data}")

            should_trigger = await self.stream.notify_agent(event, data)
            if should_trigger:
                is_user_message = event == "user_message"
                asyncio.create_task(self._trigger_task(is_user_message))
            else:
                logger.info(f"Failed to trigger agent for event: {event}")

    def start(self):
        if self._started:
            return

        self._started = True

        for event in self._events:
            event.setup()

        asyncio.create_task(self._main_task())
