from langchain_anthropic import ChatAnthropic
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_fireworks import ChatFireworks
from langchain_openai import ChatOpenAI


def get_model(
    model_name: str,
    temperature: float = 0.9,
) -> BaseChatModel:
    if model_name.startswith("gpt") or model_name.startswith("o1"):
        return ChatOpenAI(model=model_name, temperature=temperature)
    elif model_name.startswith("claude"):
        return ChatAnthropic(model=model_name, temperature=temperature)  # type: ignore
    elif "fireworks" in model_name:
        return ChatFireworks(
            model=model_name,
            temperature=temperature,
            max_tokens=None,
            timeout=None,
            max_retries=2,
        )  # type: ignore

    raise ValueError(f"Model {model_name} not found")
