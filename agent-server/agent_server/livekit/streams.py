from __future__ import annotations

import uuid
from typing import AsyncIterator, Literal, Self, Union

from agent_server.utils.logger import get_logger
from livekit.agents import llm
from livekit.agents.llm import ToolChoice, function_context
from livekit.agents.types import DEFAULT_API_CONNECT_OPTIONS, APIConnectOptions

logger = get_logger(__name__)


class NoopLLM(llm.LLM):

    def chat(
        self,
        *,
        chat_ctx: llm.ChatContext,
        conn_options: APIConnectOptions = DEFAULT_API_CONNECT_OPTIONS,
        fnc_ctx: llm.FunctionContext | None = None,
        temperature: float | None = None,
        n: int | None = 1,
        parallel_tool_calls: bool | None = None,
        tool_choice: (
            Union[ToolChoice, Literal["auto", "required", "none"]] | None
        ) = None,
    ) -> llm.LLMStream:
        return NoopStream(
            chat_ctx=chat_ctx,
            fnc_ctx=fnc_ctx,
            conn_options=conn_options,
        )


class NoopStream(llm.LLMStream):
    """Noop stream that does nothing (stream empty string)"""

    def __init__(
        self,
        *,
        chat_ctx: llm.ChatContext,
        fnc_ctx: function_context.FunctionContext | None,
        conn_options: APIConnectOptions = DEFAULT_API_CONNECT_OPTIONS,
    ):
        super().__init__(
            llm=NoopLLM(),
            chat_ctx=chat_ctx,
            fnc_ctx=fnc_ctx,
            conn_options=conn_options,
        )
        self._stream = self._create_noop_stream()
        self._request_id = str(uuid.uuid4())

    @classmethod
    def from_chat_ctx(cls, chat_ctx: llm.ChatContext) -> Self:
        return cls(chat_ctx=chat_ctx)

    async def _run(self):
        pass

    async def _create_noop_stream(self) -> AsyncIterator[llm.ChatChunk]:
        yield create_llm_chunk(self._request_id, "")

    async def __anext__(self) -> llm.ChatChunk:
        return await anext(self._stream)


class EchoStream(llm.LLMStream):
    """Echoes the text stream back to the user."""

    def __init__(
        self,
        text_stream: AsyncIterator[str],
        *,
        chat_ctx: llm.ChatContext,
        fnc_ctx: function_context.FunctionContext | None,
        conn_options: APIConnectOptions = DEFAULT_API_CONNECT_OPTIONS,
    ):
        super().__init__(
            llm=NoopLLM(),
            chat_ctx=chat_ctx,
            fnc_ctx=fnc_ctx,
            conn_options=conn_options,
        )
        self._chunk_stream = self._create_message_chunk_stream(text_stream)
        self._request_id = str(uuid.uuid4())

    @classmethod
    def from_chat_ctx(
        cls, text_stream: AsyncIterator[str], chat_ctx: llm.ChatContext
    ) -> Self:
        return cls(text_stream=text_stream, chat_ctx=chat_ctx)

    async def _run(self):
        pass

    async def _create_message_chunk_stream(self, text_stream: AsyncIterator[str]):
        async for text in text_stream:
            yield create_llm_chunk(self._request_id, text)

    async def __anext__(self) -> llm.ChatChunk:
        return await anext(self._chunk_stream)


def create_llm_chunk(request_id: str, content: str) -> llm.ChatChunk:
    choice = llm.Choice(
        delta=llm.ChoiceDelta(content=content, role="assistant"),
        index=0,
    )
    return llm.ChatChunk(request_id=request_id, choices=[choice])
