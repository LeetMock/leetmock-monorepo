from typing import TypeVar, Type, Any, cast, List
from langchain_core.runnables.config import RunnableConfig
from agent_graph.llms import ChatbotConfig

T = TypeVar("T")


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


def get_default_config(type: Type[T], value: RunnableConfig, default: Any, config_key=None) -> T:
    return with_default(type, value, default)
    # configurable = value.get("configurable", {})
    
    # # Get the specific configuration based on the config_key
    # specific_config = configurable.get(config_key, {})
    
    # # Merge the specific configuration with the default
    # merged_config = {**default, **specific_config}
    
    # if config_key:
    # # Handle different config_key cases
    #     if config_key in ChatbotConfig:
    #         model_config = ChatbotConfig[config_key]
    #         merged_config["model_name"] = model_config["model_name"]
    #         merged_config["temperature"] = model_config["temperature"]
    
    # return type(**merged_config)

def tasks_to_str(tasks: List[str]) -> str:
    return "\n".join([f"{i}. {task}" for i, task in enumerate(tasks)])

def remove_tasks(tasks: List[str], task_to_remove: List[int]) -> List[str]:
    return [task for i, task in enumerate(tasks) if i not in task_to_remove]
