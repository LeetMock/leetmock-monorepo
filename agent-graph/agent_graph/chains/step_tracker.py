from __future__ import annotations

import asyncio
import random
from operator import itemgetter
from typing import Any, Awaitable, Callable, Coroutine, Dict, List, NoReturn, Optional

from agent_graph.code_mock_staged_v1.graph import AgentState
from agent_graph.code_mock_staged_v1.prompts import SIMPLE_STEP_TRACKING_PROMPT
from agent_graph.code_mock_staged_v1.schemas import TrackStep
from agent_graph.state_merger import StateMerger
from agent_graph.types import Step
from agent_graph.utils import wrap_xml
from agent_server.utils.logger import get_logger
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import AIMessage, AnyMessage
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate
from langchain_core.runnables import Runnable, RunnableLambda
from pydantic.v1 import BaseModel, Field, PrivateAttr

logger = get_logger(__name__)

Emit = Callable[[bool], None]
SignalEmitter = Callable[[Emit], Coroutine[Any, Any, NoReturn | None]]


class StepTrackerConfig(BaseModel):
    """Configuration for the step tracker"""

    on_init: Callable[[], Awaitable[None]] = Field(
        ..., description="Callback on first-time processing the step"
    )

    on_track: Callable[[], Awaitable[bool]] = Field(
        ..., description="Callback on monitoring the step progression"
    )

    on_finish: Callable[[], Awaitable[None]] = Field(
        ..., description="Callback on step completion"
    )

    signal_emitter: SignalEmitter | List[SignalEmitter] = Field(
        ..., description="Loop that emits track signal"
    )

    @classmethod
    def from_runnables(
        cls,
        on_init_chain: Runnable[None, None],
        on_track_chain: Runnable[None, bool],
        on_finish_chain: Runnable[None, None],
        signal_emitter: SignalEmitter | List[SignalEmitter],
    ):
        return cls(
            on_init=lambda: on_init_chain.ainvoke(input=None),
            on_track=lambda: on_track_chain.ainvoke(input=None),
            on_finish=lambda: on_finish_chain.ainvoke(input=None),
            signal_emitter=signal_emitter,
        )

    def to_tracker(self) -> StepTracker:
        return StepTracker.from_config(self)


class StepTracker(BaseModel):
    """Track the progression of a step"""

    tracker_config: StepTrackerConfig = Field(
        ..., description="Configuration for the step tracker"
    )

    _step_completion_fut: asyncio.Future[bool] = PrivateAttr(
        default_factory=asyncio.Future
    )

    _track_ack_event: asyncio.Event = PrivateAttr(default_factory=asyncio.Event)

    _lock: asyncio.Lock = PrivateAttr(default_factory=asyncio.Lock)

    @classmethod
    def from_config(cls, config: StepTrackerConfig):
        return cls(tracker_config=config)

    async def _track_step_completion(self):
        finished = await self.tracker_config.on_track()
        if finished and not self._step_completion_fut.done():
            self._step_completion_fut.set_result(True)

    def _emit(self, stop: bool):
        if self._step_completion_fut.done():
            logger.info("Step tracker already completed")
            return

        if stop:
            logger.info("Step tracker stopping")
            self._step_completion_fut.set_result(True)
            return

        asyncio.create_task(self._track_step_completion())

    async def _main_task(self):
        await self.tracker_config.on_init()
        await self._step_completion_fut
        await self.tracker_config.on_finish()

    async def _create_signal_emitter_task(self):
        if isinstance(self.tracker_config.signal_emitter, list):
            return asyncio.gather(
                *[
                    emit_signal(self._emit)
                    for emit_signal in self.tracker_config.signal_emitter
                ],
                return_exceptions=True,
            )
        else:
            return asyncio.create_task(self.tracker_config.signal_emitter(self._emit))

    async def _emit_track_signal_loop(self):
        task = await self._create_signal_emitter_task()
        await self._step_completion_fut
        task.cancel()

    async def wait(self):
        asyncio.create_task(self._emit_track_signal_loop())
        await self._main_task()


def create_llm_step_tracker(
    step: Step,
    state_merger: StateMerger[AgentState],
    llm: BaseChatModel,
    state_update_queue: asyncio.Queue[Dict],
    signal_emitter: SignalEmitter | List[SignalEmitter],
    prompt: str = SIMPLE_STEP_TRACKING_PROMPT,
):
    sys_prompt = SystemMessagePromptTemplate.from_template(
        prompt, template_format="jinja2"
    )
    chat_prompt = ChatPromptTemplate.from_messages([sys_prompt])

    step_start_message = wrap_xml(
        "thinking", f"I'm started working on the step `{step.name}`"
    )
    step_finish_message = wrap_xml(
        "thinking", f"I'm finished working on the step `{step.name}`"
    )

    async def get_state_fn(_: None):
        """Get the current state"""
        return await state_merger.get_state_dict()

    def send_message_fn(message: AnyMessage):
        """Send a message to the state update queue"""
        state_update_queue.put_nowait(dict(messages=[message]))

    def post_process_fn(result: TrackStep):
        """Post-process the step tracking result"""
        if result.completed:
            message = wrap_xml("thinking", result.thinking)
            send_message_fn(AIMessage(content=message))
        return result.completed

    on_init_chain = (
        # Format the step start message
        RunnableLambda(lambda _: AIMessage(content=step_start_message))
        # Send the message
        | RunnableLambda(send_message_fn)
    ).with_config({"run_name": f"track_step_{step.name}:on_init"})

    on_track_chain = (
        # Get the current state
        RunnableLambda(get_state_fn)
        # Prepare prompt input variables
        | {
            "step": lambda _: step,
            "messages": itemgetter("messages"),
        }
        # Format the prompt
        | chat_prompt
        # Generate the step tracking result from LLM with function calling
        | llm.with_structured_output(TrackStep)
        # Post-process the step tracking result
        | RunnableLambda(post_process_fn)
    ).with_config({"run_name": f"track_step_{step.name}:on_track"})

    on_finish_chain = (
        # Format the step finish message
        RunnableLambda(lambda _: AIMessage(content=step_finish_message))
        # Send the message
        | RunnableLambda(send_message_fn)
    ).with_config({"run_name": f"track_step_{step.name}:on_finish"})

    return StepTrackerConfig.from_runnables(
        on_init_chain,
        on_track_chain,
        on_finish_chain,
        signal_emitter,
    ).to_tracker()


# --------------------- Set of common built-in emitter constructs --------------------- #
def emit_interval_fixed(interval: float):
    """Emit a signal at a fixed interval"""

    logger.info(f"Step tracker emitting at interval: {interval}")

    async def emit_signal(emit: Emit):
        while True:
            logger.info("Step tracker sleeping")
            await asyncio.sleep(interval)
            logger.info("Step tracker emitting")
            emit(False)

    return emit_signal


def emit_interval_random(min_interval: float, max_interval: float):
    """Emit a signal at a random interval between min and max"""

    async def emit_signal(emit: Emit):
        while True:
            await asyncio.sleep(random.uniform(min_interval, max_interval))
            emit(False)

    return emit_signal


def emit_interval_linear(multiplier: float, min_interval: float, max_interval: float):
    """Emit a signal at interval of x * multiplier between each, starting from min, then up to max"""

    assert multiplier > 0, "Multiplier must be positive"
    assert min_interval > 0, "Min interval must be positive"
    assert max_interval > 0, "Max interval must be positive"
    assert min_interval < max_interval, "Min interval must be less than max interval"

    async def emit_signal(emit: Emit):
        x = 0
        wait_time = min(max_interval, max(x * multiplier, min_interval))

        while True:
            await asyncio.sleep(wait_time)
            emit(False)

            if x * multiplier < max_interval:
                x += 1
                wait_time = min(max_interval, max(x * multiplier, min_interval))

    return emit_signal


def emit_interval_exponential(
    multiplier: float, min_interval: float, max_interval: float
):
    """Emit a signal at interval of 2^x * multiplier between each, starting from min, then up to max"""

    assert multiplier > 0, "Multiplier must be positive"
    assert min_interval > 0, "Min interval must be positive"
    assert max_interval > 0, "Max interval must be positive"
    assert min_interval < max_interval, "Min interval must be less than max interval"

    async def emit_signal(emit: Emit):
        x = 0
        wait_time = min(max_interval, max(2**x * multiplier, min_interval))

        while True:
            await asyncio.sleep(wait_time)
            emit(False)

            if 2**x * multiplier < max_interval:
                x += 1
                wait_time = min(max_interval, max(2**x * multiplier, min_interval))

    return emit_signal


def emit_stop_after(duration: float):
    """Emit a signal after a given duration"""

    async def emit_signal(emit: Emit):
        await asyncio.sleep(duration)
        emit(True)

    return emit_signal
