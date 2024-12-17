from __future__ import annotations

import asyncio
import uuid
from typing import AsyncIterator, List

from agent_server.utils.logger import get_logger
from livekit.agents import llm

logger = get_logger(__name__)


class NoopLLM(llm.LLM):

    def chat(
        self,
        *,
        chat_ctx: llm.ChatContext,
        fnc_ctx: llm.FunctionContext | None = None,
        temperature: float | None = None,
        n: int | None = None,
        parallel_tool_calls: bool | None = None,
    ) -> llm.LLMStream:
        return NoopStream(chat_ctx=chat_ctx)


class IntermittentEchoLLM(llm.LLM):

    def __init__(self, stream: List[str | float]):
        super().__init__()
        self._stream = stream

    def chat(
        self,
        *,
        chat_ctx: llm.ChatContext,
        fnc_ctx: llm.FunctionContext | None = None,
        temperature: float | None = None,
        n: int | None = None,
        parallel_tool_calls: bool | None = None,
    ) -> llm.LLMStream:
        return IntermittentEchoStream(stream=self._stream, chat_ctx=chat_ctx)


class NoopStream(llm.LLMStream):
    """Noop stream that does nothing (stream empty string)"""

    def __init__(
        self,
        *,
        chat_ctx: llm.ChatContext,
    ):
        super().__init__(llm=NoopLLM(), chat_ctx=chat_ctx, fnc_ctx=None)
        self._stream = self._create_noop_stream()
        self._request_id = str(uuid.uuid4())

    async def _main_task(self):
        pass

    async def _create_noop_stream(self) -> AsyncIterator[llm.ChatChunk]:
        yield create_llm_chunk(self._request_id, "")

    async def __anext__(self) -> llm.ChatChunk:
        return await anext(self._stream)


class EchoStream(llm.LLMStream):
    """Echoes the text stream back to the user."""

    def __init__(self, *, text_stream: AsyncIterator[str], chat_ctx: llm.ChatContext):
        super().__init__(llm=NoopLLM(), chat_ctx=chat_ctx, fnc_ctx=None)
        self._chunk_stream = self._create_message_chunk_stream(text_stream)
        self._request_id = str(uuid.uuid4())

    async def _main_task(self):
        pass

    async def _create_message_chunk_stream(self, text_stream: AsyncIterator[str]):
        async for text in text_stream:
            yield create_llm_chunk(self._request_id, text)

    async def __anext__(self) -> llm.ChatChunk:
        return await anext(self._chunk_stream)


class IntermittentEchoStream(llm.LLMStream):
    """Echoes the text stream back to the user intermittently."""

    def __init__(self, stream: List[str | float], chat_ctx: llm.ChatContext):
        super().__init__(llm=NoopLLM(), chat_ctx=chat_ctx, fnc_ctx=None)
        self._intermittent_stream = self._create_intermittent_stream(stream)
        self._request_id = str(uuid.uuid4())

    async def _main_task(self):
        pass

    async def _create_intermittent_stream(self, stream: List[str | float]):
        logger.info(f"Intermittent stream: {stream}")

        for item in stream:
            if isinstance(item, str):
                yield create_llm_chunk(self._request_id, item)
            elif isinstance(item, float) or isinstance(item, int):
                await asyncio.sleep(item)
            else:
                raise ValueError(f"Invalid item type: {type(item)}")

        logger.info("Intermittent stream finished")

    async def __anext__(self) -> llm.ChatChunk:
        return await anext(self._intermittent_stream)


def create_llm_chunk(request_id: str, content: str) -> llm.ChatChunk:
    choice = llm.Choice(
        delta=llm.ChoiceDelta(content=content, role="assistant"),
        index=0,
    )
    return llm.ChatChunk(request_id=request_id, choices=[choice])
