import asyncio
from typing import Any, Dict, Generic, Type, TypeVar

from agent_server.storages import StateStorage
from debouncer import debounce
from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph.state import CompiledStateGraph, StateGraph
from pydantic.v1 import BaseModel, Field, PrivateAttr

TState = TypeVar("TState", bound=BaseModel)

CONFIG = RunnableConfig(configurable={"thread_id": "1"})


class StateMerger(BaseModel, Generic[TState]):
    """A state merger is a class that keeps a persistent state and allows for merging with other states."""

    state_type: Type[TState] = Field(
        ..., description="The type of the state to be returned"
    )

    state_graph: CompiledStateGraph = Field(
        ..., description="The compiled state graph to merge states"
    )

    storage: StateStorage = Field(
        ..., description="The storage to fetch and update the state"
    )

    _set_state_debounced: Any = PrivateAttr()

    class Config:
        arbitrary_types_allowed = True

    def __init__(
        self,
        state_type: Type[TState],
        state_graph: CompiledStateGraph,
        storage: StateStorage,
    ):
        super().__init__(
            state_type=state_type, state_graph=state_graph, storage=storage
        )

        @debounce(wait=1)
        async def set_state_debounced(state: Dict[str, Any]):
            await self.storage.set_state(state)

        self._set_state_debounced = set_state_debounced

    @classmethod
    async def from_state_and_storage(
        cls,
        state_type: Type[TState],
        storage: StateStorage,
    ):
        graph = StateGraph(state_type)

        merger = cls(
            state_type=state_type,
            state_graph=graph.compile(checkpointer=MemorySaver()),
            storage=storage,
        )

        initial_state = await storage.get_state()
        await merger.merge_state(initial_state)
        return merger

    async def get_state(self):
        state_dict = await self.get_state_dict()
        return self.state_type(**state_dict)

    async def get_state_dict(self) -> Dict[str, Any]:
        snapshot = await self.state_graph.aget_state(config=CONFIG)
        return snapshot.values

    async def merge_state(self, state: TState | Dict[str, Any], debounce: bool = True):
        if isinstance(state, dict) and len(state) == 0:
            return await self.get_state()

        values = await self.state_graph.ainvoke(state, config=CONFIG)
        if debounce:
            asyncio.create_task(self._set_state_debounced(values))
        else:
            asyncio.create_task(self.storage.set_state(values))

        return self.state_type(**values)
