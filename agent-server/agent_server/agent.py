from __future__ import annotations

import logging
import os

from pprint import pprint
from langgraph_sdk.client import get_client
from livekit.agents import llm
from typing import AsyncIterator
from langgraph_sdk.client import StreamPart
from agent_server.utils.message_conversion import convert_livekit_msgs_to_langchain_msgs
from agent_server.types import SessionMetadata, EditorSnapshot


logger = logging.getLogger("minimal-assistant")
logger.setLevel(logging.DEBUG)


class LangGraphLLM(llm.LLM):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self._client = get_client(url=os.getenv("LANGGRAPH_API_URL"))
        self._session_metadata: SessionMetadata | None = None
        self._snapshot: EditorSnapshot | None = None
        self._interaction_type: str | None = None

    def set_agent_context(
        self,
        session_metadata: SessionMetadata,
        snapshot: EditorSnapshot,
        interaction_type: str,
    ):
        self._session_metadata = session_metadata
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

        langchain_messages = convert_livekit_msgs_to_langchain_msgs(chat_ctx.messages)

        print("Following is copied_ctx.messages, not conmmitted yet!")
        pprint(langchain_messages)

        assert self._session_metadata is not None, "Session metadata is not set"
        assert self._snapshot is not None, "Snapshot is not set"
        assert self._interaction_type is not None, "Interaction type is not set"

        lang_graph_input = dict(
            messages=langchain_messages,
            coding_question=self._session_metadata.question_content,
            editor_content=self._snapshot.editor.content,
            content_last_updated=self._snapshot.editor.last_updated,
            interaction_type=self._interaction_type,
        )

        stream = self._client.runs.stream(
            thread_id=self._session_metadata.agent_thread_id,
            assistant_id=self._session_metadata.assistant_id,
            input=lang_graph_input,
            stream_mode="updates",
            multitask_strategy="interrupt",
        )

        return SimpleLLMStream(stream=stream, chat_ctx=chat_ctx, fnc_ctx=fnc_ctx)


class SimpleLLMStream(llm.LLMStream):

    def __init__(
        self,
        *,
        stream: AsyncIterator[StreamPart],
        chat_ctx: llm.ChatContext,
        fnc_ctx: llm.FunctionContext | None,
    ):
        super().__init__(chat_ctx=chat_ctx, fnc_ctx=fnc_ctx)

        self._stream = stream

    async def __anext__(self) -> llm.ChatChunk:
        try:
            chunk = await anext(self._stream)

            logger.debug(f"Received chunk: {chunk}")

            if chunk.event != "updates" or "chatbot" not in chunk.data:
                return await self.__anext__()

            chatbot_data = chunk.data["chatbot"]
            if "response" not in chatbot_data:
                return await self.__anext__()

            response = chatbot_data["response"]
            content = response.get("content", "")

            return llm.ChatChunk(
                choices=[
                    llm.Choice(
                        delta=llm.ChoiceDelta(content=content, role="assistant"),
                        index=0,
                    )
                ]
            )
        except StopAsyncIteration:
            raise StopAsyncIteration

    """
    # Stateful LLMStream
    async def __anext__(self) -> llm.ChatChunk:
        while True:
            try:
                chunk = await anext(self._stream)

                logger.debug(f"Received chunk: {chunk}")

                # Skip chunks without data or metadata events
                if not chunk.data or chunk.event == "metadata":
                    continue

                # Skip chunks that don't have the required tags or events
                if ("chatbot" not in chunk.data.get("tags", []) or
                    chunk.data.get("event") != "on_chat_model_stream"):
                    continue

                content = chunk.data.get("data", {}).get("chunk", {}).get("content", "")

                return llm.ChatChunk(
                    choices=[
                        llm.Choice(
                            delta=llm.ChoiceDelta(content=content, role="assistant"),
                            index=0,
                        )
                    ]
                )
            except StopAsyncIteration:
                # Maybe more to do here?
                raise StopAsyncIteration
    """
