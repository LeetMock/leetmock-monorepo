import asyncio
import logging
from typing import Any, List

from agent_graph.code_mock_staged_v1.graph import AgentState
from agent_server.agent_streams import AgentStream
from agent_server.contexts.session import CodeSession, CodeSessionEventTypes
from agent_server.events import BaseEvent
from debouncer import debounce
from langchain_core.messages import BaseMessage
from livekit.agents.voice_assistant import VoiceAssistant
from pydantic.v1 import BaseModel, Field, PrivateAttr

logger = logging.getLogger(__name__)


class Reminder(BaseModel):
    pass


class ReminderEvent(BaseEvent[Reminder]):
    """Reminder event that sends a reminder after a delay."""

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

            self.emit_event(Reminder())
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

    event_type: CodeSessionEventTypes

    session: CodeSession

    @property
    def event_name(self) -> str:
        return self.event_type

    def setup(self):
        session = self.session
        session.on(self.event_type, lambda event: self.emit_event(event))


class TestSubmissionEvent(BaseEvent[Any]):

    stream: AgentStream[AgentState, Any]

    @property
    def event_name(self) -> str:
        return "test_submission"

    def setup(self):
        # TODO: Implement
        pass


class UserMessageEventData(BaseModel):
    messages: List[BaseMessage]

    @classmethod
    def from_messages(cls, messages: List[BaseMessage]):
        return cls(messages=messages)


class UserMessageEvent(BaseEvent[UserMessageEventData]):

    event_q: asyncio.Queue[UserMessageEventData]

    @property
    def event_name(self) -> str:
        return "user_message"

    async def _observe_user_message_task(self):
        while True:
            user_message_event_data = await self.event_q.get()
            last_message = (
                user_message_event_data.messages[-1].content
                if len(user_message_event_data.messages) > 0
                else "No messages"
            )
            logger.info(f"Last user message: {last_message}")
            self.emit_event(user_message_event_data)

    def setup(self):
        asyncio.create_task(self._observe_user_message_task())
