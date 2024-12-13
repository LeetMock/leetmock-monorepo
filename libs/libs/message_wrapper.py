from typing import List

from langchain_core.messages import AnyMessage
from pydantic.v1 import BaseModel


class MessageWrapper(BaseModel):
    """Data model for llm messages.

    Attributes:
        messages: List of chat messages
    """

    messages: List[AnyMessage]

    @classmethod
    def from_messages(cls, messages: List[AnyMessage]):
        """Creates a MessageWrapper instance from a list of messages.

        Args:
            messages: List of BaseMessage objects to include

        Returns:
            MessageWrapper instance containing the messages
        """
        return cls(messages=messages)
