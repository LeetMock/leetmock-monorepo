from __future__ import annotations

import asyncio
import logging
import hashlib
import os

from pprint import pprint
from langgraph_sdk.client import get_client
from livekit.agents import llm
from livekit.plugins import openai
from livekit.plugins.openai import LLMStream
from typing import Any, AsyncIterator, List
from openai.types.chat import  ChatCompletionMessageParam
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, FunctionMessage, BaseMessage
from langgraph_sdk.client import StreamPart
from agent_server.types import SessionMetadata, EditorSnapshot

# LangGraph uses pydantic v1
from pydantic.v1 import BaseModel

logger = logging.getLogger("minimal-assistant")
logger.setLevel(logging.DEBUG)

def hash_msg(msg: llm.ChatMessage) -> str:
    s = f"{msg.role}-{msg.name}-{str(msg.content)}"
    return str(int(hashlib.sha1(s.encode("utf-8")).hexdigest(), 16) % (10 ** 8))

def _build_oai_message(msg: llm.ChatMessage, cache_key: Any):
    oai_msg: dict = {"role": msg.role}

    if msg.name:
        oai_msg["name"] = msg.name

    # add content if provided
    if isinstance(msg.content, str):
        oai_msg["content"] = msg.content
    elif isinstance(msg.content, list):
        oai_content = []
        for cnt in msg.content:
            if isinstance(cnt, str):
                oai_content.append({"type": "text", "text": cnt})
            # Not supported yet for LangGraph
            """
            elif isinstance(cnt, llm.ChatImage):
                oai_content.append(_build_oai_image_content(cnt, cache_key))
            """
        oai_msg["content"] = oai_content

    # make sure to provide when function has been called inside the context
    # (+ raw_arguments)
    if msg.tool_calls is not None:
        tool_calls: list[dict[str, Any]] = []
        oai_msg["tool_calls"] = tool_calls
        for fnc in msg.tool_calls:
            tool_calls.append(
                {
                    "id": fnc.tool_call_id,
                    "type": "function",
                    "function": {
                        "name": fnc.function_info.name,
                        "arguments": fnc.raw_arguments,
                    },
                }
            )

    # tool_call_id is set when the message is a response/result to a function call
    # (content is a string in this case)
    if msg.tool_call_id:
        oai_msg["tool_call_id"] = msg.tool_call_id

    return oai_msg

def _build_oai_context(
    chat_ctx: llm.ChatContext, cache_key: Any
) -> list[ChatCompletionMessageParam]:
    return [_build_oai_message(msg, cache_key) for msg in chat_ctx.messages]  # type: ignore

class LangGraphInput(BaseModel):
    messages: List[BaseMessage]
    coding_question: str
    editor_content: str
    content_last_updated: int
    interaction_type: str


class LangGraphLLM(openai.LLM):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._client = get_client(url=os.getenv("LANGGRAPH_API_URL"))

    def chat(
        self,
        *,
        chat_ctx: llm.ChatContext,
        session_metadata: SessionMetadata,
        snapshot: EditorSnapshot,
        interaction_type: str = "response_required",
    ) -> LLMStream:

        langchain_messages = convert_livekit_msgs_to_langchain_msgs(chat_ctx.messages)

        print("Following is copied_ctx.messages, not conmmitted yet!")
        pprint(langchain_messages)

        lang_graph_input = LangGraphInput(
            messages=langchain_messages,
            coding_question=session_metadata.question_content,
            editor_content=snapshot.editor.content,
            content_last_updated=snapshot.editor.last_updated,
            interaction_type=interaction_type,
        )

        stream = self._client.runs.stream(
            thread_id=session_metadata.agent_thread_id,
            assistant_id=session_metadata.assistant_id,
            input=lang_graph_input.dict(),
            stream_mode="updates",
            multitask_strategy="interrupt",
        )

        return SimpleLLMStream(stream=stream, chat_ctx=chat_ctx, fnc_ctx=None)

    async def update_state(self, messages: list[BaseMessage]):
        print("Updating state")
        await self._client.threads.update_state(
            thread_id=self.thread["thread_id"],
            values={"messages": messages},
        )
        print("Updated state successfully")


def convert_livekit_msgs_to_langchain_msgs(messages: list[llm.ChatMessage]) -> List[BaseMessage]:
    lc_msgs: List[BaseMessage] = []

    for i, msg in enumerate(messages):
        id = hash_msg(msg)

        if isinstance(msg.content, str):
            content = msg.content
        elif isinstance(msg.content, list):
            content = []
            for item in msg.content:
                if isinstance(item, str):
                    content.append(item)
                elif isinstance(item, llm.ChatImage):
                    # For now, we'll just add a placeholder for images
                    content.append("[IMAGE]")
            content = " ".join(content)
        else:
            content = str(msg.content)  # Fallback for any other type

        additional_kwargs = {}
        if msg.name:
            additional_kwargs["name"] = msg.name
        if msg.tool_calls:
            additional_kwargs["tool_calls"] = [
                {
                    "id": call.tool_call_id,
                    "type": "function",
                    "function": {
                        "name": call.function_info.name,
                        "arguments": call.raw_arguments
                    }
                } for call in msg.tool_calls
            ]
        if msg.tool_call_id:
            additional_kwargs["tool_call_id"] = msg.tool_call_id

        if msg.role == "user":
            lc_msgs.append(HumanMessage(content=content, additional_kwargs=additional_kwargs, id=id))
        elif msg.role == "assistant":
            lc_msgs.append(AIMessage(content=content, additional_kwargs=additional_kwargs, id=id))
        elif msg.role == "system":
            lc_msgs.append(SystemMessage(content=content, additional_kwargs=additional_kwargs, id=id))
        elif msg.role == "tool":
            lc_msgs.append(FunctionMessage(content=content, name=msg.name, additional_kwargs=additional_kwargs, id=id))

    return lc_msgs

def convert_oai_msgs_to_langchain_msgs(messages: list[ChatCompletionMessageParam]):

    lc_msgs: List[BaseMessage] = []

    for i, msg in enumerate(messages):

        id = f"{i}-{msg["role"]}"

        if isinstance(msg["content"], str):
            content = msg["content"]
        elif isinstance(msg.content, list):
            content = " ".join([cnt["text"] for cnt in msg["content"]])

        if msg["role"] == "user":
            lc_msgs.append(HumanMessage(id=id, content=content))
        else:
            lc_msgs.append(AIMessage(id=id, content=content))

    return lc_msgs

class SimpleLLMStream(llm.LLMStream):

    def __init__(self, *, stream: AsyncIterator[StreamPart], chat_ctx: llm.ChatContext, fnc_ctx: llm.FunctionContext | None):
        super().__init__(chat_ctx=chat_ctx, fnc_ctx=fnc_ctx)

        self._stream = stream

    async def aclose(self) -> None:
        # What to do here?
        await super().aclose()

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

    async def __anext__(self) -> llm.ChatChunk:
        try:
            chunk = await anext(self._stream)

            logger.debug(f"Received chunk: {chunk}")

            if chunk.event != 'updates' or 'chatbot' not in chunk.data:
                return await self.__anext__()

            chatbot_data = chunk.data['chatbot']
            if 'response' not in chatbot_data:
                return await self.__anext__()

            response = chatbot_data['response']
            content = response.get('content', '')

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
