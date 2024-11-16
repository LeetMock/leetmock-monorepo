"""Event implementations for the agent server.

This module provides concrete implementations of various event types used in the agent server.
It includes events for handling reminders, code session changes, test submissions, and user messages.

Key Components:
- ReminderEvent: Manages timed reminders with debouncing
- CodeSessionEvent: Handles code session state changes
- TestSubmissionEvent: Manages test submission events
- UserMessageEvent: Processes user message events

Example:
    ```python
    # Create a reminder event
    reminder = ReminderEvent(
        assistant=voice_assistant,
        delay=30,  # 30 seconds
        repeated=True
    )
    reminder.start()

    # Create a code session event
    code_event = CodeSessionEvent(
        event_type="content_changed",
        session=code_session
    )
    code_event.start()
    ```
"""

import asyncio
import logging
from typing import Any, List
from unittest.mock import Base

from agent_graph.code_mock_staged_v1.graph import AgentState
from agent_server.agent_streams import AgentStream
from agent_server.contexts.session import CodeSession, CodeSessionEventTypes
from agent_server.events import BaseEvent
from debouncer import debounce
from langchain_core.messages import BaseMessage
from livekit.agents.voice_assistant import VoiceAssistant
from pydantic import StrictStr
from pydantic.v1 import BaseModel, Field, PrivateAttr

from libs.convex.convex_types import CodeSessionContentChangedEvent
from libs.types import MessageWrapper

logger = logging.getLogger(__name__)


class Reminder(BaseModel):
    """Empty model representing a reminder event."""

    pass


class ReminderEvent(BaseEvent[Reminder]):
    """Event that sends a reminder after a specified delay.

    This event monitors speech events from the voice assistant and manages
    reminder timing with debouncing. It can be configured to repeat reminders
    and tracks human input after reminders.

    Attributes:
        assistant: Voice assistant to monitor for speech events
        delay: Time in seconds to wait before sending reminder
        repeated: Whether to send multiple reminders
        _no_human_input_after_reminder: Tracks if there was human input after last reminder
    """

    assistant: VoiceAssistant

    delay: float = Field(
        default=24, description="The delay in seconds before sending the reminder."
    )

    repeated: bool = Field(
        default=False, description="Whether to repeat the reminder after the delay."
    )

    _no_human_input_after_reminder: bool = PrivateAttr(default=False)

    @property
    def event_name(self) -> str:
        return "reminder"

    def setup(self):
        assistant = self.assistant

        @debounce(wait=self.delay)
        async def send_reminder():
            # Don't send a reminder if one was already sent and we're not repeating
            if self._no_human_input_after_reminder and not self.repeated:
                logger.info("Reminder already sent. Skipping.")
                return

            self.emit(Reminder())
            self._no_human_input_after_reminder = True

        def create_send_reminder_task(_: Any = None):
            logger.info("Creating send reminder task")
            asyncio.create_task(send_reminder())

        def create_send_reminder_task_and_reset(_: Any = None):
            logger.info("Creating send reminder task and resetting")
            self._no_human_input_after_reminder = False
            create_send_reminder_task(_)

        def cancel_send_reminder_task(_: Any = None):
            logger.info("Cancelling send reminder task")
            send_reminder.cancel()

        # Create event when agent speech is committed or stopped
        assistant.on("agent_speech_committed", create_send_reminder_task)
        assistant.on("agent_stopped_speaking", create_send_reminder_task)

        # Create and reset event when user speech is committed or stopped
        assistant.on("user_speech_committed", create_send_reminder_task_and_reset)
        assistant.on("user_stopped_speaking", create_send_reminder_task_and_reset)

        # Cancel event when starts of speech or interruptions
        assistant.on("agent_started_speaking", cancel_send_reminder_task)
        assistant.on("user_started_speaking", cancel_send_reminder_task)
        assistant.on("agent_speech_interrupted", cancel_send_reminder_task)


class CodeSessionEvent(BaseEvent[Any]):
    """Event for monitoring code session changes.

    Forwards events from the code session to registered callbacks.

    Attributes:
        event_type: Type of code session event to monitor
        session: Code session to monitor
    """

    event_type: CodeSessionEventTypes

    session: CodeSession

    @property
    def event_name(self) -> str:
        return self.event_type

    def setup(self):
        session = self.session
        session.on(self.event_type, lambda event: self.emit(event))


class CodeEditorChangedEvent(BaseEvent[Any]):
    """Event that emits when the code editor content changes.

    Emits a debounced event with the before and after content for diffing.
    Event is emitted in following cases:
    1. User speech is committed
    2. User stopped typing (debounced)
    """

    session: CodeSession

    assistant: VoiceAssistant

    delay: float = Field(
        default=2.5,
        description="The delay in seconds before emitting the event.",
    )

    _before: StrictStr | None = PrivateAttr(default=None)

    _after: StrictStr | None = PrivateAttr(default=None)

    _prev_event: CodeSessionContentChangedEvent | None = PrivateAttr(default=None)

    @property
    def event_name(self) -> str:
        return "content_changed"

    def setup(self):

        @debounce(wait=self.delay)
        def publish_debounced():
            if self._before is None or self._after is None or self._prev_event is None:
                return

            self._prev_event.event.data.before = self._before
            self._prev_event.event.data.after = self._after
            self._before = self._after
            self._after = None
            self.emit(self._prev_event)

        def process_event(event: CodeSessionContentChangedEvent | None = None):
            if event is not None:
                self._prev_event = event
                if self._before is None:
                    self._before = event.event.data.before
                self._after = event.event.data.after

            asyncio.create_task(publish_debounced())

        session = self.session
        session.on("content_changed", process_event)
        # self.assistant.on("user_speech_committed", lambda _: process_event())

class TestcaseChangedEvent(BaseEvent[Any]):
    """Event for monitoring testcase changes.
    
    This event is triggered when testcases are modified in the code editor.
    It handles the synchronization of testcase states between different components.
    
    Attributes:
        session: Code session to monitor
        delay: Time in seconds to debounce the event (optional)
    """
    
    session: CodeSession
    
    delay: float = Field(
        default=1.0,
        description="The delay in seconds before emitting the event."
    )
    
    @property
    def event_name(self) -> str:
        return "testcase_changed"
        
    def setup(self):
        session = self.session
        
        async def emit_testcase_change(event: Any):
            self.emit(event)
            
        def handle_testcase_change(event: Any):
            asyncio.create_task(emit_testcase_change(event))
            
        session.on("testcase_changed", handle_testcase_change)


class UserTestcaseExecutedEvent(BaseEvent[Any]):
    """Event for monitoring test executions.

    Triggered when user-defined testcases are executed (via the test editor).
    """

    session: CodeSession

    @property
    def event_name(self) -> str:
        return "user_testcase_executed"

    def setup(self):
        session = self.session
        
        async def emit_test_execution(event: Any):
            self.emit(event)
            
        def handle_test_execution(event: Any):
            asyncio.create_task(emit_test_execution(event))
            
        session.on("user_testcase_executed", handle_test_execution)


class GroundTruthTestcaseExecutedEvent(BaseEvent[Any]):
    """Event for monitoring ground truth test executions.

    Triggered when ground truth testcases are executed. Tests results should be published.
    """

    session: CodeSession

    @property
    def event_name(self) -> str:
        return "ground_truth_testcase_executed"

    def setup(self):
        # TODO: Implement
        # USE LCEL: https://python.langchain.com/docs/introduction/
        # model.with_structured_outputs(BaseModel)
        # experiment with different LLMs openai gpt-4o gpt-o1-mini claude-35-sonnet (new)
        pass


class UserMessageEvent(BaseEvent[MessageWrapper]):
    """Event for handling user messages.

    Monitors a message queue and emits events when new messages arrive.

    Attributes:
        event_q: Queue containing incoming user messages
    """

    event_q: asyncio.Queue[MessageWrapper]

    delay: float = Field(
        default=0.2,
        description="The delay in seconds before emitting the event.",
    )

    @property
    def event_name(self) -> str:
        return "user_message"

    async def _observe_user_message_task(self):
        @debounce(wait=self.delay)
        def publish_debounced(event: MessageWrapper):
            self.emit(event)

        while True:
            user_message_event_data = await self.event_q.get()
            await publish_debounced(user_message_event_data)

    def setup(self):
        asyncio.create_task(self._observe_user_message_task())
