import hashlib

# code below import lru_cache related package
from functools import lru_cache


from typing import List
from app.types import Utterance
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage


CACHE_SIZE = 4096


@lru_cache(maxsize=CACHE_SIZE)
def md5_hash(content: str) -> str:
    return hashlib.md5(content.encode()).hexdigest()


def get_utterance_id(idx: int, utterance: Utterance) -> str:
    return f"{idx}-{utterance.role}"


def convert_transcript_to_messages(transcript: List[Utterance]) -> List[BaseMessage]:
    messages: List[BaseMessage] = []

    for i, utterance in enumerate(transcript):
        utterance_id = get_utterance_id(i, utterance)

        if utterance.role == "user":
            messages.append(HumanMessage(id=utterance_id, content=utterance.content))
        else:
            messages.append(AIMessage(id=utterance_id, content=utterance.content))

    return messages
