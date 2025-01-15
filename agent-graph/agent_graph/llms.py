import os

from langchain_anthropic import ChatAnthropic
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_fireworks import ChatFireworks
from langchain_openai import ChatOpenAI
from pydantic import SecretStr


def get_model(
    model_name: str,
    temperature: float = 0.9,
) -> BaseChatModel:
    if model_name.startswith("gpt") or model_name.startswith("o1"):
        return ChatOpenAI(model=model_name, temperature=temperature)
    elif model_name.startswith("claude"):
        return ChatAnthropic(model="claude-3-5-sonnet-latest", temperature=temperature)  # type: ignore
    elif "fireworks" in model_name:
        return ChatFireworks(
            model=model_name,
            temperature=temperature,
            max_tokens=None,
            timeout=None,
            max_retries=2,
        )  # type: ignore
    elif model_name.startswith("deepseek"):
        return ChatOpenAI(
            model="deepseek-chat",
            api_key=SecretStr(os.getenv("DEEPSEEK_API_KEY", "")),
            base_url="https://api.deepseek.com",
        )

    raise ValueError(f"Model {model_name} not found")
