from __future__ import annotations

import hashlib
import os
import uuid
from datetime import datetime
from typing import AsyncGenerator, AsyncIterator, Coroutine

from agent_server.utils.logger import get_logger
from agent_server.utils.messages import convert_chat_ctx_to_langchain_messages
from langgraph_sdk.client import get_client
from langgraph_sdk.schema import StreamPart
from livekit.agents import llm

from libs.convex.convex_types import CodeSessionState, SessionMetadata

logger = get_logger(__name__)


class LangGraphLLM(llm.LLM):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.counter: int = 0
        self._unix_timestamp = int(datetime.now().timestamp())
        self._client = get_client(url=os.getenv("LANGGRAPH_API_URL"))
        self._session_metadata: SessionMetadata | None = None
        self._snapshot: CodeSessionState | None = None
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
        snapshot: CodeSessionState,
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

        return SimpleLLMStream(
            llm=self, stream=stream, chat_ctx=chat_ctx, fnc_ctx=fnc_ctx
        )
