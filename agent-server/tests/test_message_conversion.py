from livekit.agents import llm
from agent_server.utils.messages import (
    convert_chat_ctx_to_langchain_messages,
)


def test_convert_chat_ctx_to_langchain_messages_basic_conversation():
    chat_ctx = llm.ChatContext()
    chat_ctx.append(text="You are a helpful assistant", role="system")
    chat_ctx.append(text="hello", role="user")
    chat_ctx.append(text="world", role="assistant")

    langchain_messages = convert_chat_ctx_to_langchain_messages(chat_ctx)

    assert len(langchain_messages) == 3

    assert langchain_messages[0].type == "system"
    assert langchain_messages[0].content == "You are a helpful assistant"

    assert langchain_messages[1].type == "human"
    assert langchain_messages[1].content == "hello"

    assert langchain_messages[2].type == "ai"
    assert langchain_messages[2].content == "world"
