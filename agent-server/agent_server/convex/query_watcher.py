"""
QueryWatcher Module

This module provides real-time data synchronization with a Convex backend through a query watching mechanism.
It allows setting up subscriptions to Convex queries and handling data updates through callbacks.

The module implements a generic QueryWatcher class that can watch any Convex query and validate its results
against a specified Pydantic model.

Classes:
    QueryWatcher: A generic class for watching Convex queries and handling their updates.

Example:
    ```python
    # Create a watcher for a specific session
    session_state_watcher = QueryWatcher.from_query(
        query="codeSessionStates:get",
        params={"sessionId": "session_123"},
        validator_cls=CodeSessionState,  # Generated from openapi-api-generator
    )

    # Define an update handler
    async def handle_session_update(session: CodeSessionState):
        print(f"Session updated: {session}")

    # Register the handler and start watching
    watcher.on_update(handle_session_update)
    watcher.watch(convex_api)
    ```

Key Features:
- Real-time data synchronization with Convex backend
- Type-safe data validation using Pydantic models
- Support for both async and sync callbacks
- Optional deduplication of events
- Automatic error handling for callbacks
- Async streaming of query results

Dependencies:
    - asyncio: For async/await functionality
    - pydantic: For data validation and settings management
    - logging: For error and debug logging
    - convex: For Convex API integration

Note:
    The QueryWatcher is designed to be used in conjunction with the AsyncQueryGenerator
    for handling the actual streaming of query results from Convex subscriptions.
"""

import asyncio
import json
from inspect import iscoroutinefunction
from typing import Any, Callable, Coroutine, Dict, Generic, List, Type, TypeVar

from agent_server.convex.query_generator import AsyncQueryGenerator
from pydantic import BaseModel, Field, PrivateAttr

from libs.convex.api import ConvexApi

TModel = TypeVar("TModel", bound=BaseModel)

from loguru import logger


class QueryWatcher(BaseModel, Generic[TModel]):
    """A generic class for watching Convex queries and handling their updates.

    This class provides real-time data synchronization with a Convex backend by watching
    specific queries and executing callbacks when the data changes.

    Attributes:
        query (str): The Convex query path to watch (e.g., "sessions.getById")
        params (Dict[str, Any]): Parameters to pass to the query
        validator_cls (Type[TModel]): Pydantic model class for validating query results
        dedup (bool): Whether to skip duplicate events with the same data

    Example:
        ```python
        watcher = QueryWatcher.from_query(
            query="sessions.getById",
            params={"id": "123"},
            validator_cls=SessionModel
        )
        ```
    """

    query: str = Field(..., description="The query to watch")

    params: Dict[str, Any] = Field(
        ..., description="The parameters to pass to the query"
    )

    validator_cls: Type[TModel] = Field(
        ..., description="The validator class to use to validate the query result"
    )

    dedup: bool = Field(default=True, description="Whether to deduplicate events")

    _callbacks: List[Callable[[TModel], Coroutine[Any, Any, None]]] = PrivateAttr(
        default_factory=list
    )

    _query_watch_task: asyncio.Task | None = PrivateAttr(default=None)

    _last_data: TModel | None = PrivateAttr(default=None)

    @classmethod
    def from_query(
        cls,
        query: str,
        params: Dict[str, Any],
        validator_cls: Type[TModel],
        dedup: bool = True,
    ):
        """Create a new QueryWatcher instance with the specified parameters.

        Args:
            query (str): The Convex query path to watch
            params (Dict[str, Any]): Parameters to pass to the query
            validator_cls (Type[TModel]): Pydantic model class for validating query results
            dedup (bool, optional): Whether to skip duplicate events. Defaults to True.

        Returns:
            QueryWatcher: A new QueryWatcher instance configured with the provided parameters
        """
        return cls(query=query, params=params, validator_cls=validator_cls, dedup=dedup)

    def on_update(self, callback: Callable[[TModel], Coroutine[Any, Any, None] | None]):
        """Register a callback to be called when the watched query data changes.

        The callback can be either a synchronous or asynchronous function that takes
        the validated query result as its argument.

        Args:
            callback (Callable[[TModel], Coroutine[Any, Any, None] | None]):
                Function to call when data changes. Can be sync or async.

        Returns:
            QueryWatcher: The watcher instance for method chaining

        Example:
            ```python
            async def handle_update(data: SessionModel):
                print(f"Session updated: {data}")

            watcher.on_update(handle_update)
            ```
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

    async def _run_query_watch_task(self, api: ConvexApi):
        """Internal method that runs the query watching task.

        This method:
        1. Creates a subscription to the Convex query
        2. Validates incoming data against the specified Pydantic model
        3. Handles deduplication if enabled
        4. Executes all registered callbacks with the validated data

        Args:
            api (ConvexApi): The Convex API client instance to use for the subscription

        Note:
            This is an internal method and should not be called directly.
            Use the `watch()` method instead.
        """
        subscription = api.subscribe(self.query, self.params)

        query_stream = AsyncQueryGenerator.from_subscription(subscription)

        logger.info(f"Watching query `{self.query}` with params `{self.params}`")
        async for raw_data in query_stream:
            if raw_data is None:
                continue

            try:
                data = self.validator_cls.model_validate(raw_data)
            except Exception as e:
                logger.error(
                    f"Failed to validate data: {json.dumps(raw_data, indent=2)}"
                )
                logger.error(f"Error validating data: {e}")
                continue

            if self.dedup and data == self._last_data:
                logger.debug(f"Skipping duplicated data: {data}")
                continue

            self._last_data = data
            await asyncio.gather(
                *[cb(data) for cb in self._callbacks],
                return_exceptions=True,
            )

    def watch(self, api: ConvexApi):
        """Start watching the query for changes.

        Creates an asyncio task that subscribes to the query and handles updates.
        Only one watch task will be created even if called multiple times.

        Args:
            api (ConvexApi): The Convex API client instance to use for the subscription

        Example:
            ```python
            watcher = QueryWatcher.from_query(...)
            watcher.on_update(handle_update)
            watcher.watch(convex_api)
            ```
        """
        if self._query_watch_task is None:
            self._query_watch_task = asyncio.create_task(
                self._run_query_watch_task(api)
            )


def query_watcher(
    query: str, params: Dict[str, Any], validator_cls: Type[TModel], dedup: bool = True
) -> QueryWatcher[TModel]:
    return QueryWatcher.from_query(query, params, validator_cls, dedup)
