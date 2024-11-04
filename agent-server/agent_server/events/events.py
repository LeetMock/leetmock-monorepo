import asyncio
import logging
from typing import Any

from agent_graph.code_mock_staged_v1.graph import AgentState
from agent_server.agent_streams import AgentStream
from agent_server.contexts.session import CodeSession, CodeSessionEventTypes
from agent_server.events import BaseEvent
from debouncer import debounce
from httpx import stream
from livekit.agents.voice_assistant import VoiceAssistant
from pydantic import BaseModel, Field, PrivateAttr

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

    def start(self):
        assistant = self.assistant

        @debounce(wait=self.delay)
        async def send_reminder():
            # Don't send a reminder if one was already sent and we're not repeating
            if self._no_human_input_after_reminder and not self.repeated:
                logger.info("Reminder already sent. Skipping.")
                return

            self.emit_event(Reminder())
            self._no_human_input_after_reminder = True

        def create_send_reminder_task(_: Any):
            asyncio.create_task(send_reminder())

        def create_send_reminder_task_and_reset(_: Any):
            self._no_human_input_after_reminder = False
            create_send_reminder_task(_)

        def cancel_send_reminder_task(_: Any):
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

    def start(self):
        session = self.session
        session.on(self.event_type, lambda event: self.emit_event(event))


class TestSubmissionEvent(BaseEvent[Any]):

    stream: AgentStream[AgentState]

    @property
    def event_name(self) -> str:
        return "test_submission"

    def start(self):
        # TODO: Implement
        pass
