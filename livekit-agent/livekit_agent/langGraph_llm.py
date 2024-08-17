from __future__ import annotations

import asyncio
import os
from pprint import pprint
from langgraph_sdk import get_client
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.agents import llm, utils
from livekit.plugins import openai
from livekit.plugins.openai import LLMStream
from typing import Any, AsyncIterator, List
from openai.types.chat import ChatCompletionChunk, ChatCompletionMessageParam
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage

from langgraph_sdk.client import LangGraphClient, StreamPart

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


class LangGraphLLM(openai.LLM):
    def __init__(self,  *args, **kwargs):
        super().__init__(*args, **kwargs)

        self._client = get_client(url=os.environ["LANGGRAPH_API_URL"])

        self.thread = None
        self.assistant = None

    @classmethod
    async def create(cls, *args, **kwargs):
        self = cls(*args, **kwargs)
        await self.initialize()
        return self

    async def initialize(self):
        self.thread = await self._client.threads.create()
        assistants = await self._client.assistants.search(graph_id="code-mock-v1")
        assert len(assistants) > 0, "No assistants found"
        self.assistant = assistants[0]

    def chat(
        self,
        *,
        chat_ctx: llm.ChatContext,
        fnc_ctx: llm.FunctionContext | None = None,
        temperature: float | None = None,
        n: int | None = 1,
        parallel_tool_calls: bool | None = None
    ) -> LLMStream:

        # No support for function context yet for LangGraph
        """
        opts: dict[str, Any] = dict()
        if fnc_ctx and len(fnc_ctx.ai_functions) > 0:
            fncs_desc = []
            for fnc in fnc_ctx.ai_functions.values():
                fncs_desc.append(llm._oai_api.build_oai_function_description(fnc))

            opts["tools"] = fncs_desc

            if fnc_ctx and parallel_tool_calls is not None:
                opts["parallel_tool_calls"] = parallel_tool_calls
        """

        messages = _build_oai_context(chat_ctx, id(self))
        langchain_messages = convert_msgs_to_langchain_msgs(messages)

        print("abcabc")
        pprint(langchain_messages)

        stream = self._client.runs.stream(
            thread_id=self.thread["thread_id"],
            assistant_id=self.assistant["assistant_id"],
            input={
                "coding_question": "Two numbers are given. Find the sum of the two numbers.",
                "editor_content": "def sum(a, b):\n    ",
                "content_last_updated": 123123123,
                "interaction_type": "chat",
            },
            multitask_strategy="interrupt",
            stream_mode=["events"],
        )

        return SimpleLLMStream(stream=stream, chat_ctx=chat_ctx, fnc_ctx=fnc_ctx)

    async def update_state(self, messages: list[BaseMessage]):
        print("Updating state")
        await self._client.threads.update_state(
            thread_id=self.thread["thread_id"],
            values={"messages": messages},
        )
        print("Updated state successfully")

def convert_msgs_to_langchain_msgs(messages: list[ChatCompletionMessageParam]):

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

    async def __anext__(self) -> llm.ChatChunk:
        while True:
            try:
                chunk = await anext(self._stream)

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
