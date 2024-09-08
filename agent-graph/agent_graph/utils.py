from typing import TypeVar, Type, Any, cast
from langchain_core.runnables.config import RunnableConfig

T = TypeVar("T")


def with_default(type: Type[T], value: Any, default: Any) -> T:
    result = {k: v for k, v in value.items() if v is not None}

    for key in default.keys():
        if key not in result:
            result[key] = default[key]

    return cast(type, result)


def get_default_state(type: Type[T], value: Any, default: Any) -> T:
    return with_default(type, value, default)


def get_default_config(type: Type[T], value: RunnableConfig, default: Any) -> T:
    configurable = value.get("configurable", {})
    return with_default(type, configurable, default)
