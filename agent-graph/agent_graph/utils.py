from typing import Any, List, Type, TypeVar, cast

from langchain_core.runnables.config import RunnableConfig
from pydantic.v1 import BaseModel

T = TypeVar("T")
TState = TypeVar("TState", bound=BaseModel)
TConfig = TypeVar("TConfig", bound=BaseModel)


def custom_data(id: str, data: Any):
    return {"id": id, "data": data}


def merge_str_list(l1: List[str], l2: List[str]) -> List[str]:
    return list(set(l1) | set(l2))


def wrap_xml(tag: str, content: str) -> str:
    return f"<{tag}>\n{content}\n</{tag}>"


def _validate_value(value: Any) -> bool:
    if value is None:
        return False

    if isinstance(value, str):
        return len(value) > 0

    return True


def with_default(type: Type[T], value: Any, default: Any) -> T:
    result = {k: v for k, v in value.items() if _validate_value(v)}

    for key in default.keys():
        if key not in result:
            result[key] = default[key]

    return cast(type, result)


def get_default_state(type: Type[T], value: Any, default: Any) -> T:
    return with_default(type, value, default)


def get_default_config(type: Type[T], config: RunnableConfig, default: Any) -> T:
    value = config.get("configurable", {})
    return with_default(type, value, default)


def get_configurable(type: Type[TConfig], config: RunnableConfig) -> TConfig:
    default_values = type().dict()
    value = config.get("configurable", {})
    default_values.update(value)
    return type(**default_values)


def tasks_to_str(tasks: List[str]) -> str:
    return "\n".join([f"{i}. {task}" for i, task in enumerate(tasks)])


def remove_tasks(tasks: List[str], task_to_remove: List[int]) -> List[str]:
    return [task for i, task in enumerate(tasks) if i not in task_to_remove]
