from __future__ import annotations

import hashlib
import os

from datetime import datetime
from pprint import pprint
from langgraph_sdk.client import get_client
from livekit.agents import llm
from typing import AsyncGenerator, AsyncIterator
from langgraph_sdk.schema import StreamPart
from agent_server.utils.messages import convert_chat_ctx_to_langchain_messages
from agent_server.types import SessionMetadata, EditorSnapshot
from agent_server.utils.logger import get_logger

logger = get_logger(__name__)


class LangGraphLLM(llm.LLM):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.counter: int = 0
        self._unix_timestamp = int(datetime.now().timestamp())
        self._client = get_client(url=os.getenv("LANGGRAPH_API_URL"))
        self._session_metadata: SessionMetadata | None = None
        self._snapshot: EditorSnapshot | None = None
        self._interaction_type: str | None = None

    async def get_state(self):
        assert self._session_metadata is not None, "Session metadata is not set"

        state = await self._client.threads.get_state(
            thread_id=self._session_metadata.agent_thread_id
        )
        return state["values"]

    def set_agent_session(self, session_data: SessionMetadata):
        self._session_metadata = session_data

    def set_agent_context(
        self,
        snapshot: EditorSnapshot,
        interaction_type: str,
    ):
        self._snapshot = snapshot
        self._interaction_type = interaction_type

    def chat(
        self,
        *,
        chat_ctx: llm.ChatContext,
        fnc_ctx: llm.FunctionContext | None = None,
        temperature: float | None = None,
        n: int | None = 1,
        parallel_tool_calls: bool | None = None,
    ) -> llm.LLMStream:
        langchain_messages = convert_chat_ctx_to_langchain_messages(chat_ctx)

        for i, message in enumerate(langchain_messages):
            key = f"{self._unix_timestamp}-{i}-{message.type}"
            message.id = hashlib.md5(key.encode()).hexdigest()

        print("Following is copied_ctx.messages, not conmmitted yet!")
        pprint(langchain_messages)

        assert self._session_metadata is not None, "Session metadata is not set"
        assert self._snapshot is not None, "Snapshot is not set"
        assert self._interaction_type is not None, "Interaction type is not set"

        lang_graph_input = dict(
            incoming_messages=langchain_messages,
            coding_question=self._session_metadata.question_content,
            editor_content=self._snapshot.editor.content,
            content_last_updated=self._snapshot.editor.last_updated,
            interaction_type=self._interaction_type,
            question_id=self._session_metadata.question_id,
        )

        stream = self._client.runs.stream(
            thread_id=self._session_metadata.agent_thread_id,
            assistant_id=self._session_metadata.assistant_id,
            input=lang_graph_input,
            stream_mode="events",
            multitask_strategy="interrupt",
        )

        return SimpleLLMStream(stream=stream, chat_ctx=chat_ctx, fnc_ctx=fnc_ctx)


class NoOpLLMStream(llm.LLMStream):

    def __init__(
        self,
        *,
        chat_ctx: llm.ChatContext,
        fnc_ctx: llm.FunctionContext | None = None,
    ):
        super().__init__(chat_ctx=chat_ctx, fnc_ctx=fnc_ctx)
        self._stream = self._create_fake_stream()

    def _create_llm_chunk(self, content: str) -> llm.ChatChunk:
        choice = llm.Choice(
            delta=llm.ChoiceDelta(content=content, role="assistant"),
            index=0,
        )
        return llm.ChatChunk(choices=[choice])

    async def _create_fake_stream(self) -> AsyncGenerator[llm.ChatChunk, None]:
        for content in (
            "I love you! I love you so much! Man! What can I say! gee ni tai may, baby"
            * 100
        ):
            logger.info(f"Sending fake chunk: {content}")
            yield self._create_llm_chunk(content)

    async def __anext__(self) -> llm.ChatChunk:
        return await anext(self._stream)


class SimpleLLMStream(llm.LLMStream):

    def __init__(
        self,
        *,
        stream: AsyncIterator[StreamPart],
        chat_ctx: llm.ChatContext,
        fnc_ctx: llm.FunctionContext | None,
    ):
        super().__init__(chat_ctx=chat_ctx, fnc_ctx=fnc_ctx)
        self._stream = self.generate_llm_stream(stream)

    def _create_llm_chunk(self, content: str) -> llm.ChatChunk:
        choice = llm.Choice(
            delta=llm.ChoiceDelta(content=content, role="assistant"),
            index=0,
        )
        return llm.ChatChunk(choices=[choice])

    async def generate_llm_stream(
        self, stream: AsyncIterator[StreamPart]
    ) -> AsyncGenerator[llm.ChatChunk, None]:
        logger.info("Agent stream started")

        async for chunk in stream:
            tags = chunk.data.get("tags", [])
            if "chatbot" not in tags:
                continue

            event = chunk.data.get("event", None)
            if event != "on_chat_model_stream":
                continue

            content = chunk.data.get("data", {}).get("chunk", {}).get("content", "")
            logger.info(f"Received chunk content: `{content}`")
            yield self._create_llm_chunk(content)

        # default empty chunk, in case no content is streamed out
        yield self._create_llm_chunk("")
        logger.info("Agent stream ended")

    async def __anext__(self) -> llm.ChatChunk:
        try:
            return await anext(self._stream)
        except StopAsyncIteration:
            raise StopAsyncIteration
