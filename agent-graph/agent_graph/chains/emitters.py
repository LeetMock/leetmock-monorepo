from __future__ import annotations

import asyncio
import random
from enum import Enum
from typing import Any, Callable, Coroutine, NoReturn

from agent_server.utils.logger import get_logger

logger = get_logger(__name__)


class SignalType(Enum):
    TRACK = "track"
    STOP = "stop"
    REMIND = "remind"


EmitSignal = Callable[[SignalType], None]
SignalEmitter = Callable[[EmitSignal], Coroutine[Any, Any, NoReturn | None]]


def emit_interval_fixed(interval: float):
    """Emit a signal at a fixed interval"""

    logger.info(f"Step tracker emitting at interval: {interval}")

    async def emit_signal(emit: EmitSignal):
        while True:
            await asyncio.sleep(interval)
            emit(SignalType.TRACK)

    return emit_signal


def emit_interval_random(min_interval: float, max_interval: float):
    """Emit a signal at a random interval between min and max"""

    async def emit_signal(emit: EmitSignal):
        while True:
            await asyncio.sleep(random.uniform(min_interval, max_interval))
            emit(SignalType.TRACK)

    return emit_signal


def emit_interval_linear(multiplier: float, min_interval: float, max_interval: float):
    """Emit a signal at interval of x * multiplier between each, starting from min, then up to max"""

    assert multiplier > 0, "Multiplier must be positive"
    assert min_interval > 0, "Min interval must be positive"
    assert max_interval > 0, "Max interval must be positive"
    assert min_interval < max_interval, "Min interval must be less than max interval"

    async def emit_signal(emit: EmitSignal):
        x = 0
        wait_time = min(max_interval, max(x * multiplier, min_interval))

        while True:
            await asyncio.sleep(wait_time)
            emit(SignalType.TRACK)

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

    async def emit_signal(emit: EmitSignal):
        x = 0
        wait_time = min(max_interval, max(2**x * multiplier, min_interval))

        while True:
            await asyncio.sleep(wait_time)
            emit(SignalType.TRACK)

            if 2**x * multiplier < max_interval:
                x += 1
                wait_time = min(max_interval, max(2**x * multiplier, min_interval))

    return emit_signal


def emit_stop_after(duration: float):
    """Emit a signal after a given duration"""

    async def emit_signal(emit: EmitSignal):
        await asyncio.sleep(duration)
        emit(SignalType.STOP)

    return emit_signal
