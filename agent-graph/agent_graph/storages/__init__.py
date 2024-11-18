from abc import ABC, abstractmethod
from typing import Any, Dict, TypeVar

from debouncer import debounce
from pydantic import Field, PrivateAttr
from pydantic.v1 import BaseModel

TState = TypeVar("TState", bound=BaseModel)


class StateStorage(BaseModel, ABC):
    """A state storage is a class that can fetch and update the state."""

    @abstractmethod
    async def get_state(self) -> Dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    async def set_state(self, state: Dict[str, Any]):
        raise NotImplementedError
