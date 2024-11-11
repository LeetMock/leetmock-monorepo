"""Event handling system for the agent server.

This module provides the base event infrastructure for handling various types of events
in the agent server. It defines a generic BaseEvent class that can be extended to create
specific event types with type-safe event data.

Key Features:
- Generic event handling with type safety using Pydantic models
- Async callback support for event handlers
- Error handling for event callbacks
- Event lifecycle management (start/setup)

Example:
    ```python
    class MyEvent(BaseEvent[MyEventData]):
        @property
        def event_name(self) -> str:
            return "my_event"

        def setup(self):
            # Setup event handlers
            pass

    # Using the event
    event = MyEvent()
    event.subscribe(my_callback)
    event.start()
    event.publish(my_event_data)
    ```
"""

import asyncio
import logging
from abc import ABC, abstractmethod
from inspect import iscoroutinefunction
from typing import Any, Callable, Coroutine, Generic, List, Self, Type, TypeVar

from agent_server.contexts.session import BaseSession
from livekit.agents.voice_assistant import VoiceAssistant
from pydantic.v1 import BaseModel, PrivateAttr

logger = logging.getLogger(__name__)


TModel = TypeVar("TModel", bound=BaseModel)
TSession = TypeVar("TSession", bound=BaseSession)


class BaseEvent(BaseModel, Generic[TModel], ABC):
    """Base class for all events in the agent server.

    This abstract class provides the foundation for implementing event handling with type safety.
    It supports both synchronous and asynchronous callbacks, and manages the event lifecycle.

    Attributes:
        _callbacks (List[Callable]): List of callback functions to be executed when event is emitted
        _started (bool): Flag indicating if the event has been started
    """

    _callbacks: List[Callable[[TModel], Coroutine[Any, Any, None]]] = PrivateAttr(
        default_factory=list
    )

    _started: bool = PrivateAttr(default=False)

    class Config:
        arbitrary_types_allowed = True

    @property
    @abstractmethod
    def event_name(self) -> str:
        raise NotImplementedError

    def subscribe(self, callback: Callable[[TModel], None | Coroutine[Any, Any, None]]):
        """Subscribe a callback function to be called when the event is published.

        Args:
            callback: A function that takes a TModel parameter and returns None or a Coroutine.
                     Can be either a synchronous or asynchronous function.

        Returns:
            self: Returns the event instance for method chaining
        """

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

    def publish(self, event: TModel):
        """Publish an event to all registered callbacks.

        Executes all registered callbacks asynchronously with the provided event data.
        Any exceptions in callbacks are logged but do not stop other callbacks from executing.

        Args:
            event: The event data of type TModel to pass to callbacks
        """
        asyncio.gather(
            *[callback(event) for callback in self._callbacks],
            return_exceptions=True,
        )

    def start(self):
        """Start the event handling system.

        Initializes the event system and calls the setup method.
        Can only be called once - subsequent calls will raise a RuntimeError.

        Raises:
            RuntimeError: If start() is called more than once
        """
        if self._started:
            raise RuntimeError("Event already started")

        self._started = True
        self.setup()

    @abstractmethod
    def setup(self):
        """Abstract method to be implemented by subclasses for event setup.

        This method is called during start() and should contain any initialization
        logic needed for the specific event type.
        """
