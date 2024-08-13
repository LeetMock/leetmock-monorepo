from typing import Dict, TypeVar, Type, Any

T = TypeVar("T")


def create_init_state_node(default_state: Dict):

    def init_state_node(state: Dict):
        state_update = {}

        for key, value in default_state.items():
            state_value = state.get(key, None)

            if state_value is not None:
                continue

            state_update[key] = value

        return state_update if len(state_update) > 0 else None

    return init_state_node


def safe_get(type: Type[T], state: Any, key: str, default: T) -> T:
    value = state.get(key, None)

    if value is None:
        return default

    if not isinstance(value, type):
        return default

    return value
