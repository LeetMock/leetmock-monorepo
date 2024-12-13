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
from typing import Any, Dict, List, Set

from agent_graph.chains.emitters import emit_interval_fixed, emit_stop_after
from agent_graph.chains.step_tracker import SignalEmitter, create_llm_step_tracker
from agent_graph.code_mock_staged_v1.constants import AgentConfig
from agent_graph.code_mock_staged_v1.graph import AgentState
from agent_graph.llms import get_model
from agent_graph.prompts import format_static_check_error, format_test_context
from agent_graph.state_merger import StateMerger
from agent_graph.types import Step
from agent_server.contexts.session import CodeSession, CodeSessionEventTypes
from agent_server.events import BaseEvent
from debouncer import debounce
from livekit.agents.voice_assistant import VoiceAssistant
from pydantic import StrictStr
from pydantic.v1 import BaseModel, Field, PrivateAttr

from libs.convex.api import ConvexApi
from libs.convex.convex_requests import create_test_code_correctness_request
from libs.convex.convex_types import (
    CodeSessionContentChangedEvent,
    CodeSessionState,
    SessionMetadata,
)
from libs.helpers import static_check_with_mypy
from libs.message_wrapper import MessageWrapper
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
        default=20, description="The delay in seconds before sending the reminder."
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
        default=1.0, description="The delay in seconds before emitting the event."
    )

    @property
    def event_name(self) -> str:
        return "testcase_changed"

    def setup(self):
        session = self.session
        session.on("testcase_changed", lambda e: self.emit(e))


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
        session.on("testcase_executed", lambda e: self.emit(e))


class GroundTruthTestcaseExecutedEvent(BaseEvent[Any]):
    """Event for monitoring ground truth test executions.

    Triggered when ground truth testcases are executed. Tests results should be published.
    """

    session: CodeSession

    convex_api: ConvexApi

    @property
    def event_name(self) -> str:
        return "ground_truth_testcase_executed"

    async def run_ground_truth_tests(self):

        print("Running ground truth tests")
        current_code = self.session.session_state.editor.content

        try:
            # Run static type checking first
            static_check_error = self._static_code_check(current_code)
            if static_check_error:
                print(f"Emitting static check error: {static_check_error}")
                # Emit formatted static check error and the graph should pick it up
                self.emit(format_static_check_error(static_check_error))
            else:
                logger.info("No static check error, running tests")
                # Get current testcases
                request = create_test_code_correctness_request(
                    language="python",
                    code=self.session.session_state.editor.content,
                    question_id=self.session.session_metadata.question_id,
                    session_id=self.session.session_metadata.session_id,
                )
                response = self.convex_api.action.api_run_actions_run_tests_post(
                    request
                )
                assert (
                    response.value is not None
                    and response.value.test_results is not None
                ), "No test results"
                testcase_results = response.value.test_results

                # Emit formatted test results and the graph should pick it up
                self.emit(format_test_context(testcase_results))
        except Exception as e:
            if isinstance(e, AssertionError) and "No test results" in str(e):
                logger.info("No test results, skipping emit")
            else:
                logger.error(f"Error running ground truth tests: {e}")

    def setup(self):
        """Set up the ground truth testcase execution event.

        This method:
        1. Sets up a task to run ground truth testcases when code changes
        2. Validates code with static type checking
        3. Emits results for agent processing
        """
        self.session.on(
            "content_changed",
            lambda _: asyncio.create_task(self.run_ground_truth_tests()),
        )

    def _static_code_check(self, code: str) -> str:
        return static_check_with_mypy(code)


class UserMessageEvent(BaseEvent[MessageWrapper]):
    """Event for handling user messages.

    Monitors a message queue and emits events when new messages arrive.

    Attributes:
        user_message_event_q: Queue containing incoming user messages
    """

    user_message_event_q: asyncio.Queue[MessageWrapper]

    delay: float = Field(
        default=0.2,
        description="The delay in seconds before emitting the event.",
    )

    @property
    def event_name(self) -> str:
        return "user_message"

    async def _observe_user_message_task(self):
        """
        This method is a task that continuously observes the user message event queue
        and emits events to the agent trigger.
        """

        @debounce(wait=self.delay)
        def publish_debounced(event: MessageWrapper):
            self.emit(event)

        while True:
            user_message_event_data = await self.user_message_event_q.get()
            await publish_debounced(user_message_event_data)

    def setup(self):
        asyncio.create_task(self._observe_user_message_task())


class StepTrackingEvent(BaseEvent[str]):
    """Event for monitoring step tracking."""

    state_merger: StateMerger[AgentState]

    agent_config: AgentConfig

    state_update_q: asyncio.Queue[Dict]

    _step_queue: asyncio.Queue[Step] = PrivateAttr(default_factory=asyncio.Queue)

    _seen_steps: Set[str] = PrivateAttr(default_factory=set)

    @property
    def event_name(self) -> str:
        return "step_tracking"

    def _get_llm_step_tracker(self, step: Step):
        signal_emitters: List[SignalEmitter] = [emit_interval_fixed(interval=4)]

        if not step.required:
            signal_emitters.append(emit_stop_after(duration=25))

        return create_llm_step_tracker(
            step=step,
            state_merger=self.state_merger,
            llm=get_model("gpt-4o", temperature=0.1),
            state_update_queue=self.state_update_q,
            signal_emitter=signal_emitters,
        )

    def _try_queue_next_steps(self, _: AgentState, state: AgentState):
        curr_stage = self.agent_config.stages[state.current_stage_idx]
        curr_steps = state.steps.get(curr_stage, [])

        for step in curr_steps:
            if step.name in state.completed_steps:
                continue

            if step.name in self._seen_steps:
                logger.info(f"Already seen step: {step.name}")
                return

            logger.info(f"Queueing step: {step.name}")
            self._seen_steps.add(step.name)
            self._step_queue.put_nowait(step)
            return

        logger.info("No steps to queue")

    async def _track_agent_steps_task(self):
        while True:
            step = await self._step_queue.get()
            tracker = self._get_llm_step_tracker(step)

            try:
                await tracker.wait()
                self.emit(step.name)
            except Exception as e:
                logger.error(f"Error tracking step: {e}")
                await asyncio.sleep(1)
                self._step_queue.put_nowait(step)

    def setup(self):
        self.state_merger.on("state_changed", self._try_queue_next_steps)
        asyncio.create_task(self._track_agent_steps_task())
