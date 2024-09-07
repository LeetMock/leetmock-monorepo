from __future__ import annotations

from typing import Any, List, cast, Any, Dict

import hashlib
from livekit.agents import llm
from livekit.plugins.openai.utils import build_oai_message

from openai.types.chat import (
    ChatCompletionMessageParam,
    ChatCompletionToolMessageParam,
    ChatCompletionUserMessageParam,
    ChatCompletionSystemMessageParam,
    ChatCompletionAssistantMessageParam,
)
from langchain_core.messages import (
    BaseMessage,
    HumanMessage,
    AIMessage,
    SystemMessage,
    ToolMessage,
    FunctionMessage,
)


def convert_chat_ctx_to_oai_messages(
    chat_ctx: llm.ChatContext, cache_key: Any
) -> List[ChatCompletionMessageParam]:
    return [build_oai_message(msg, cache_key) for msg in chat_ctx.messages]  # type: ignore


def convert_oai_messages_to_langchain_messages(
    messages: List[ChatCompletionMessageParam],
) -> List[BaseMessage]:
    langchain_messages: List[BaseMessage] = []

    for message in messages:
        langchain_message = convert_oai_message_to_langchain_message(message)
        if langchain_message is not None:
            langchain_messages.append(langchain_message)

    return langchain_messages


def convert_oai_message_to_langchain_message(
    message: ChatCompletionMessageParam,
) -> BaseMessage | None:
    role = message["role"]
    lc_message: BaseMessage | None = None

    if role == "user":
        message = cast(ChatCompletionUserMessageParam, message)
        content = (
            message["content"]
            if isinstance(message["content"], str)
            else list(message["content"])
        )
        lc_message = HumanMessage(content=content)  # type: ignore

    elif role == "system":
        message = cast(ChatCompletionSystemMessageParam, message)
        content = (
            message["content"]
            if isinstance(message["content"], str)
            else list(message["content"])  # type: ignore
        )
        lc_message = SystemMessage(content=content)  # type: ignore

    elif role == "assistant":
        message = cast(ChatCompletionAssistantMessageParam, message)
        additional_kwargs: Dict = {}

        if "content" not in message or message["content"] is None:
            content = ""
        else:
            content = (
                message["content"]
                if isinstance(message["content"], str)
                else list(message["content"])  # type: ignore
            )

        if "function_call" in message:
            additional_kwargs["function_call"] = message["function_call"]

        if "tool_calls" in message:
            additional_kwargs["tool_calls"] = message["tool_calls"]

        if "refusal" in message:
            additional_kwargs["refusal"] = message["refusal"]

        lc_message = AIMessage(content=content, additional_kwargs=additional_kwargs)  # type: ignore

    elif role == "tool":
        message = cast(ChatCompletionToolMessageParam, message)
        content = (
            message["content"]
            if isinstance(message["content"], str)
            else list(message["content"])  # type: ignore
        )
        lc_message = ToolMessage(content=content, tool_call_id=message["tool_call_id"])  # type: ignore

    return lc_message


def convert_langchain_messages_to_oai_messages(
    messages: List[BaseMessage],
) -> List[ChatCompletionMessageParam]:
    return [convert_langchain_message_to_oai_message(message) for message in messages]


def convert_langchain_message_to_oai_message(
    message: BaseMessage,
) -> ChatCompletionMessageParam:
    role = message.type
    oai_message: Dict[str, Any]

    if role == "human":
        oai_message = {"role": "user", "content": message.content}

    elif role == "system":
        oai_message = {"role": "system", "content": message.content}

    elif role == "ai":
        oai_message = {"role": "assistant", "content": message.content}

        if "function_call" in message.additional_kwargs:
            oai_message["function_call"] = message.additional_kwargs["function_call"]

        if "tool_calls" in message.additional_kwargs:
            oai_message["tool_calls"] = message.additional_kwargs["tool_calls"]

        if "refusal" in message.additional_kwargs:
            oai_message["refusal"] = message.additional_kwargs["refusal"]

    elif role == "tool":
        message = cast(ToolMessage, message)
        oai_message = {
            "role": "tool",
            "content": message.content,
            "tool_call_id": message.tool_call_id,
        }

    else:
        raise ValueError(f"Unsupported message type: {role}")

    return cast(ChatCompletionMessageParam, oai_message)


def hash_msg(msg: llm.ChatMessage) -> str:
    s = f"{msg.role}-{msg.name}-{str(msg.content)}"
    return str(int(hashlib.sha1(s.encode("utf-8")).hexdigest(), 16) % (10**8))


def convert_livekit_msgs_to_langchain_msgs(
    messages: list[llm.ChatMessage],
) -> List[BaseMessage]:
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
                        "arguments": call.raw_arguments,
                    },
                }
                for call in msg.tool_calls  # type: ignore
            ]
        if msg.tool_call_id:
            additional_kwargs["tool_call_id"] = msg.tool_call_id

        if msg.role == "user":
            lc_msgs.append(
                HumanMessage(
                    content=content, additional_kwargs=additional_kwargs, id=id
                )
            )
        elif msg.role == "assistant":
            lc_msgs.append(
                AIMessage(content=content, additional_kwargs=additional_kwargs, id=id)
            )
        elif msg.role == "system":
            lc_msgs.append(
                SystemMessage(
                    content=content, additional_kwargs=additional_kwargs, id=id
                )
            )
        elif msg.role == "tool":
            lc_msgs.append(
                FunctionMessage(
                    content=content,
                    name=msg.name,  # type: ignore
                    additional_kwargs=additional_kwargs,
                    id=id,
                )
            )

    return lc_msgs
