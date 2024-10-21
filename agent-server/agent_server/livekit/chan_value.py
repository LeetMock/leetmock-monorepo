import asyncio
import json
from inspect import iscoroutinefunction
from typing import Any, Callable, Coroutine, Dict, Generic, List, Self, TypeVar

from agent_server.utils.logger import get_logger
from livekit.agents import JobContext
from livekit.rtc import DataPacket
from pydantic import BaseModel, Field

logger = get_logger(__name__)

T = TypeVar("T")


class ChanConfig(BaseModel, Generic[T]):
    """The configuration for a request"""

    topic: str = Field(..., description="The topic to publish the request to")

    payload: Dict[str, Any] | str | bytes = Field(
        default="", description="The payload to send"
    )

    validator: Callable[[str], T] = Field(..., description="The validator to use")

    reliable: bool = Field(
        default=True, description="Whether the request should be sent reliably"
    )

    period: float = Field(
        default=1.0,
        description="The period at which to send the request",
        gt=0,
    )

    exit_on_receive: bool = Field(
        default=False,
        description="Whether to stop sending requests after receiving a response",
    )


class ChanValue(Generic[T]):

    def __init__(self, request_config: ChanConfig[T]):
        self._config = request_config.model_copy()
        self._receive_fut = asyncio.Future()

        self._result: T | None = None
        self._request_task: asyncio.Task | None = None
        self._serialized_payload: bytes | None = None
        self._connect_lock = asyncio.Lock()
        self._connected = False

        self._callbacks: List[Callable[[T], Coroutine[Any, Any, None]]] = []

    async def wait(self):
        await self._receive_fut

    async def result(self) -> T:
        await self.wait()

        if self._result is None:
            raise ValueError("Should not happen: Result is None")

        return self._result

    def _should_exit(self) -> bool:
        if self._config.exit_on_receive:
            return self._receive_fut.done()
        return False

    @property
    def serialized_payload(self) -> bytes:
        if self._serialized_payload is not None:
            return self._serialized_payload

        payload = self._config.payload
        if isinstance(payload, dict):
            self._serialized_payload = json.dumps(payload).encode("utf-8")
        elif isinstance(payload, str):
            self._serialized_payload = payload.encode("utf-8")
        elif isinstance(payload, bytes):
            self._serialized_payload = payload
        else:
            self._serialized_payload = str(payload).encode("utf-8")

        return self._serialized_payload

    async def _request_data_task(self, ctx: JobContext):
        while not self._should_exit():
            logger.info(
                f"Requesting data for topic {self._config.topic}: {self.serialized_payload}"
            )

            await ctx.room.local_participant.publish_data(
                topic=self._config.topic,
                payload=self.serialized_payload,
                reliable=self._config.reliable,
            )
            await asyncio.sleep(self._config.period)

    def _on_receive_data(self, data: DataPacket):
        if self._should_exit():
            return

        if data.topic != self._config.topic:
            return

        logger.info(f"Received data for topic {self._config.topic}")

        try:
            raw = data.data.decode("utf-8")
            self._result = self._config.validator(raw)
        except Exception as e:
            logger.error(f"Error validating data: {e}")
            return

        if not self._receive_fut.done():
            self._receive_fut.set_result(True)

        # Execute callbacks in parallel
        asyncio.gather(
            *[cb(self._result) for cb in self._callbacks],
            return_exceptions=True,
        )

    def on_update(self, callback: Callable[[T], Coroutine[Any, Any, None] | None]):
        async def wrapped_callback(result: T) -> None:
            try:
                if iscoroutinefunction(callback):
                    return await callback(result)
                else:
                    return callback(result)  # type: ignore
            except Exception as e:
                logger.error(f"Error in callback: {e}")

        self._callbacks.append(wrapped_callback)

    def connect(self, ctx: JobContext) -> Self:
        if self._connected:
            logger.warning("Already connected to topic `%s`", self._config.topic)
            return self

        self._connected = True
        logger.info(f"Connecting to topic `{self._config.topic}`")

        if self._request_task is None:
            ctx.room.on("data_received", self._on_receive_data)
            self._request_task = asyncio.create_task(self._request_data_task(ctx))

        return self
