from agent_server.utils.message_conversion import (
    convert_oai_messages_to_langchain_messages,
)


def test_convert_oai_messages_to_langchain_messages():
    langchain_messages = convert_oai_messages_to_langchain_messages(
        [
            {"role": "user", "content": "Hello, world!"},
            {"role": "assistant", "content": "Hello, user!"},
        ]
    )
    assert len(langchain_messages) == 2
