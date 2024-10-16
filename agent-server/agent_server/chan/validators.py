import json
from typing import Any, Callable, Dict, List, Set

from pydantic import BaseModel, ValidationError


def string_validator(
    min_length: int | None = None, max_length: int | None = None
) -> Callable[[str], str]:
    def validator(value: str) -> str:
        if min_length is not None and len(value) < min_length:
            raise ValueError(f"String must be at least {min_length} characters")
        if max_length is not None and len(value) > max_length:
            raise ValueError(f"String must be at most {max_length} characters")
        return value

    return validator


def int_validator(
    min_value: int | None = None, max_value: int | None = None
) -> Callable[[str], int]:
    def validator(value: str) -> int:
        try:
            int_value = int(value)
        except ValueError:
            raise ValueError("Invalid integer value")

        if min_value is not None and int_value < min_value:
            raise ValueError(f"Integer must be at least {min_value}")
        if max_value is not None and int_value > max_value:
            raise ValueError(f"Integer must be at most {max_value}")
        return int_value

    return validator


def float_validator(
    min_value: float | None = None, max_value: float | None = None
) -> Callable[[str], float]:
    def validator(value: str) -> float:
        try:
            float_value = float(value)
        except ValueError:
            raise ValueError("Invalid float value")

        if min_value is not None and float_value < min_value:
            raise ValueError(f"Float must be at least {min_value}")
        if max_value is not None and float_value > max_value:
            raise ValueError(f"Float must be at most {max_value}")

        return float_value

    return validator


def dict_validator(keys: Set[str] | None = None) -> Callable[[str], Dict[str, Any]]:
    def validator(value: str) -> Dict[str, Any]:
        try:
            dict_value = json.loads(value)
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON value")

        if keys is not None:
            for key in keys:
                if key not in dict_value:
                    raise ValueError(f"Missing key: {key}")

        return dict_value

    return validator


def list_validator(
    min_length: int | None = None, max_length: int | None = None
) -> Callable[[str], List[Any]]:
    def validator(value: str) -> List[Any]:
        try:
            list_value = json.loads(value)
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON value")

        if min_length is not None and len(list_value) < min_length:
            raise ValueError(f"List must be at least {min_length} items")
        if max_length is not None and len(list_value) > max_length:
            raise ValueError(f"List must be at most {max_length} items")

        return list_value

    return validator


def pydantic_validator(pydantic_model: BaseModel) -> Callable[[str], Any]:
    def validator(value: str) -> Any:
        try:
            return pydantic_model.model_validate_json(value)
        except ValidationError as e:
            raise ValueError(str(e))

    return validator
