import asyncio
import random
from typing import Awaitable, Callable, List

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
