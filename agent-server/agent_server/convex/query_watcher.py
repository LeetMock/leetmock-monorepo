import asyncio
import logging
from inspect import iscoroutinefunction
from typing import Any, Callable, Coroutine, Dict, Generic, List, Self, Type, TypeVar

from agent_server.convex.api import ConvexApi
from agent_server.convex.query_generator import AsyncQueryGenerator
from pydantic import BaseModel, Field, PrivateAttr

TModel = TypeVar("TModel", bound=BaseModel)
logger = logging.getLogger("convex")


class QueryWatcher(BaseModel, Generic[TModel]):

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
        return cls(query=query, params=params, validator_cls=validator_cls, dedup=dedup)

    def on_update(self, callback: Callable[[TModel], Coroutine[Any, Any, None] | None]):
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
        subscription = api.subscribe(self.query, self.params)

        query_stream = AsyncQueryGenerator.from_subscription(subscription)

        logger.info(f"Watching query `{self.query}` with params `{self.params}`")
        async for raw_data in query_stream:
            if raw_data is None:
                continue

            try:
                data = self.validator_cls.model_validate(raw_data)
            except Exception as e:
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
        if self._query_watch_task is None:
            self._query_watch_task = asyncio.create_task(
                self._run_query_watch_task(api)
            )
