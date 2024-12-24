import uuid

import pytest
from agent_server.utils.messages import DynamicLengthMessageCompressor
from langchain_core.messages import HumanMessage


def create_message(id: str | None = None):
    return HumanMessage(content="", id=str(uuid.uuid4()) if id is None else id)


def test_dynamic_length_message_compressor_empty_message():
    compressor = DynamicLengthMessageCompressor(min_length=2, max_length=6)
    assert len(compressor.get_messages()) == 0


def test_dynamic_length_message_compressor_within_range():
    compressor = DynamicLengthMessageCompressor(min_length=2, max_length=6)

    for i in range(1, 7):
        compressor.update([create_message(id=str(num)) for num in range(i)])
        assert len(compressor.get_messages()) == i

    compressor.update([create_message(id=str(num)) for num in range(7)])
    assert len(compressor.get_messages()) == 2
    assert compressor.get_messages()[0].id == "5"


def test_dynamic_length_message_compressor_accumulate_after_exceed_max_length():
    compressor = DynamicLengthMessageCompressor(min_length=2, max_length=6)

    compressor.update([create_message(id=str(num)) for num in range(7)])
    assert len(compressor.get_messages()) == 2

    compressor.update([create_message(id=str(num)) for num in range(10)])
    assert len(compressor.get_messages()) == 5
    assert [msg.id for msg in compressor.get_messages()] == ["5", "6", "7", "8", "9"]

    compressor.update([create_message(id=str(num)) for num in range(12)])
    assert len(compressor.get_messages()) == 2
    assert [msg.id for msg in compressor.get_messages()] == ["10", "11"]


@pytest.mark.parametrize("length", [3, 6, 12])
def test_dynamic_length_message_compressor_fixed_length(length: int):
    compressor = DynamicLengthMessageCompressor(min_length=length, max_length=length)

    for i in range(length):
        compressor.update([create_message(id=str(num)) for num in range(i)])
        assert len(compressor.get_messages()) == i

    compressor.update([create_message(id=str(num)) for num in range(length + 5)])
    assert len(compressor.get_messages()) == length
    assert [msg.id for msg in compressor.get_messages()] == [
        str(num) for num in range(5, length + 5)
    ]
