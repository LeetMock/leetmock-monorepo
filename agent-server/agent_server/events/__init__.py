import asyncio
import logging
from abc import ABC, abstractmethod
from inspect import iscoroutinefunction
from typing import Any, Callable, Coroutine, Generic, List, Self, Type, TypeVar

from agent_server.contexts.session import BaseSession
from livekit.agents.voice_assistant import VoiceAssistant
from pydantic import BaseModel, Field, PrivateAttr

logger = logging.getLogger(__name__)


TModel = TypeVar("TModel", bound=BaseModel)
TSession = TypeVar("TSession", bound=BaseSession)


class BaseEvent(BaseModel, Generic[TModel], ABC):

    event_name: str = Field(..., description="The name of the event to listen to")

    _callbacks: List[Callable[[TModel], Coroutine[Any, Any, None]]] = PrivateAttr(
        default_factory=list
    )

    def on_event(self, callback: Callable[[TModel], None | Coroutine[Any, Any, None]]):
        async def wrapped_callback(result: TModel) -> None:
            try:
                if iscoroutinefunction(callback):
                    return await callback(result)
                else:
                    return callback(result)  # type: ignore
            except Exception as e:
                logger.error(f"Error in callback: {e}")

        self._callbacks.append(wrapped_callback)
        return self

    def emit_event(self, event: TModel):
        asyncio.gather(
            *[callback(event) for callback in self._callbacks],
            return_exceptions=True,
        )

    @abstractmethod
    def start(self):
        raise NotImplementedError


class SessionEvent(BaseEvent[TModel], Generic[TModel, TSession]):

    session: TSession

    @classmethod
    def from_session(cls, event_name: str, session: TSession) -> Self:
        return cls(event_name=event_name, session=session)


class AssistantEvent(BaseEvent[TModel]):

    assistant: VoiceAssistant

    @classmethod
    def from_assistant(cls, event_name: str, assistant: VoiceAssistant) -> Self:
        return cls(event_name=event_name, assistant=assistant)
