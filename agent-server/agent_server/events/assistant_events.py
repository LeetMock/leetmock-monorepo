import asyncio
import logging
from typing import Any, override

from agent_server.events import AssistantEvent
from debouncer import debounce
from pydantic import BaseModel, PrivateAttr

logger = logging.getLogger(__name__)


class Reminder(BaseModel):
    pass


class ReminderEvent(AssistantEvent[Reminder]):
    """Reminder event that sends a reminder after a delay."""

    _no_human_input_after_reminder: bool = PrivateAttr(default=False)

    @override
    def start(self, delay: float = 24, repeated: bool = False):
        assistant = self.assistant

        @debounce(wait=delay)
        async def send_reminder():
            # Don't send a reminder if one was already sent and we're not repeating
            if self._no_human_input_after_reminder and not repeated:
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
