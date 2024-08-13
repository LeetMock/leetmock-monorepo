from typing import Literal, get_args

from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_core.language_models.chat_models import BaseChatModel


ModelName = Literal["gpt-4o", "claude-35"]


def get_model(
    model_name: str,
    temperature: float = 0.9,
    default_model: ModelName = "gpt-4o",
) -> BaseChatModel:
    if model_name not in get_args(ModelName):
        model_name = default_model

    if model_name == "gpt-4o":
        return ChatOpenAI(model="gpt-4o", temperature=temperature)
    elif model_name == "claude-35":
        return ChatAnthropic(
            model="claude-3-5-sonnet-20240620", temperature=temperature  # type: ignore
        )

    raise ValueError(f"Model {model_name} not found")
