import asyncio
import random
from ast import Call
from typing import Awaitable, Callable, Dict, List

from agent_graph.code_mock_staged_v1.prompts import SIMPLE_STEP_TRACKING_PROMPT
from agent_graph.code_mock_staged_v1.schemas import TrackStep
from agent_graph.state_merger import StateMerger
from agent_graph.types import EventMessageState, Step
from agent_graph.utils import wrap_xml
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import AIMessage, AnyMessage
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate
from langchain_core.runnables import RunnableLambda
from pydantic.v1 import BaseModel, Field, PrivateAttr

Emit = Callable[[], Awaitable[None]]
EmitSignal = Callable[[Emit], Awaitable[None]]


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

    signal_emitter: EmitSignal | List[EmitSignal] = Field(
        ..., description="Loop that emits track signal"
    )


class StepTracker(BaseModel):
    """Track the progression of a step"""

    tracker_config: StepTrackerConfig = Field(
        ..., description="Configuration for the step tracker"
    )

    _signal_queue: asyncio.Queue[bool] = PrivateAttr(default_factory=asyncio.Queue)

    _started: bool = PrivateAttr(default=False)

    def __init__(self, tracker_config: StepTrackerConfig):
        super().__init__(tracker_config=tracker_config)

    @classmethod
    def from_config(cls, config: StepTrackerConfig):
        return cls(tracker_config=config)

    async def _emit(self):
        await self._signal_queue.put(True)

    async def _main_task(self):
        await self.tracker_config.on_init()

        while True:
            await self._signal_queue.get()
            finished = await self.tracker_config.on_track()

            if finished:
                break

        await self.tracker_config.on_finish()

    async def _emit_track_signal_loop(self):
        if isinstance(self.tracker_config.signal_emitter, list):
            await asyncio.gather(
                *[
                    emit_signal(self._emit)
                    for emit_signal in self.tracker_config.signal_emitter
                ],
                return_exceptions=True,
            )
        else:
            await self.tracker_config.signal_emitter(self._emit)

    def start(self):
        if self._started:
            raise RuntimeError("Step tracker already started")

        self._started = True
        asyncio.gather(
            self._main_task(),
            self._emit_track_signal_loop(),
            return_exceptions=True,
        )


def create_llm_step_tracker(
    step: Step,
    state_merger: StateMerger[EventMessageState],
    llm: BaseChatModel,
    send_message: Callable[[AnyMessage], Awaitable[None]],
    mark_event_completion: Callable[[], None],
    signal_emitter: EmitSignal | List[EmitSignal],
    prompt: str = SIMPLE_STEP_TRACKING_PROMPT,
):
    sys_prompt = SystemMessagePromptTemplate.from_template(prompt)
    chat_prompt = ChatPromptTemplate.from_messages([sys_prompt])

    async def post_process(result: TrackStep):
        message = wrap_xml("thinking", result.thinking)
        await send_message(AIMessage(content=message))
        return result.completed

    chain = (
        chat_prompt
        | llm.with_structured_output(TrackStep)
        | RunnableLambda(post_process)
    ).with_config({"run_name": f"track_step_{step.name}"})

    async def on_init():
        message = wrap_xml("thinking", f"I'm started working on the step `{step.name}`")
        await send_message(AIMessage(content=message))

    async def on_track():
        state = await state_merger.get_state()
        return await chain.ainvoke({"step": step, "messages": state.messages})

    async def on_finish():
        message = wrap_xml(
            "thinking", f"I'm finished working on the step `{step.name}`"
        )
        await send_message(AIMessage(content=message))
        mark_event_completion()

    config = StepTrackerConfig(
        on_init=on_init,
        on_track=on_track,
        on_finish=on_finish,
        signal_emitter=signal_emitter,
    )

    return StepTracker.from_config(config)


# --------------------- Set of common built-in emitter constructs --------------------- #
def emit_interval_fixed(interval: float):
    """Emit a signal at a fixed interval"""

    async def emit_signal(emit: Emit):
        while True:
            await asyncio.sleep(interval)
            await emit()

    return emit_signal


def emit_interval_random(min_interval: float, max_interval: float):
    """Emit a signal at a random interval between min and max"""

    async def emit_signal(emit: Emit):
        while True:
            await asyncio.sleep(random.uniform(min_interval, max_interval))
            await emit()

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
            await emit()

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
            await emit()

            if 2**x * multiplier < max_interval:
                x += 1
                wait_time = min(max_interval, max(2**x * multiplier, min_interval))

    return emit_signal
