from __future__ import annotations

import uuid
from typing import AsyncIterator

from agent_server.utils.logger import get_logger
from livekit.agents import llm

logger = get_logger(__name__)


class NoOpLLM(llm.LLM):

    def chat(
        self,
        *,
        chat_ctx: llm.ChatContext,
        fnc_ctx: llm.FunctionContext | None = None,
        temperature: float | None = None,
        n: int | None = None,
        parallel_tool_calls: bool | None = None,
    ) -> llm.LLMStream:
        return NoOpLLMStream(chat_ctx=chat_ctx)


class NoOpLLMStream(llm.LLMStream):

    def __init__(
        self,
        *,
        chat_ctx: llm.ChatContext,
    ):
        super().__init__(llm=NoOpLLM(), chat_ctx=chat_ctx, fnc_ctx=None)
        self._stream = self._create_fake_stream()
        self._request_id = str(uuid.uuid4())

    async def _main_task(self):
        pass

    def _create_llm_chunk(self, content: str) -> llm.ChatChunk:
        choice = llm.Choice(
            delta=llm.ChoiceDelta(content=content, role="assistant"),
            index=0,
        )
        return llm.ChatChunk(request_id=self._request_id, choices=[choice])

    async def _create_fake_stream(self) -> AsyncIterator[llm.ChatChunk]:
        yield self._create_llm_chunk("")

    async def __anext__(self) -> llm.ChatChunk:
        return await anext(self._stream)


class SimpleLLMStream(llm.LLMStream):

    def __init__(self, *, text_stream: AsyncIterator[str], chat_ctx: llm.ChatContext):
        super().__init__(llm=NoOpLLM(), chat_ctx=chat_ctx, fnc_ctx=None)
        self._chunk_stream = self._create_message_chunk_stream(text_stream)
        self._request_id = str(uuid.uuid4())

    async def _main_task(self):
        pass

    def _create_llm_chunk(self, content: str) -> llm.ChatChunk:
        choice = llm.Choice(
            delta=llm.ChoiceDelta(content=content, role="assistant"),
            index=0,
        )
        return llm.ChatChunk(request_id=self._request_id, choices=[choice])

    async def _create_message_chunk_stream(self, text_stream: AsyncIterator[str]):
        async for text in text_stream:
            yield self._create_llm_chunk(text)

    async def __anext__(self) -> llm.ChatChunk:
        return await anext(self._chunk_stream)
