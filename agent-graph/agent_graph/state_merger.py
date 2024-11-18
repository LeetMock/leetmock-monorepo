import asyncio
from typing import Any, Dict, Generic, Type, TypeVar

from agent_graph.storages import StateStorage
from debouncer import debounce
from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph.state import CompiledStateGraph, StateGraph
from pydantic.v1 import BaseModel, Field, PrivateAttr

from libs.profiler import get_profiler

pf = get_profiler()

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

        @debounce(wait=4)
        async def set_state_debounced(state: Dict[str, Any]):
            await self.storage.set_state(state)

        self._set_state_debounced = set_state_debounced

    @classmethod
    async def from_state_and_storage(
        cls,
        name: str,
        state_type: Type[TState],
        storage: StateStorage,
    ):
        graph = StateGraph(state_type)

        merger = cls(
            state_type=state_type,
            state_graph=graph.compile(checkpointer=MemorySaver()).with_config(
                {"run_name": f"{name}-state-merger"}
            ),
            storage=storage,
        )

        with pf.interval("state_merger.from_state_and_storage.fetch_initial_state"):
            initial_state = await storage.get_state()
            await merger.merge_state(initial_state)

        return merger

    async def get_state(self) -> TState:
        state_dict = await self.get_state_dict()
        return self.state_type(**state_dict)

    async def get_state_dict(self) -> Dict[str, Any]:
        snapshot = await self.state_graph.aget_state(config=CONFIG)
        return snapshot.values

    async def merge_state(self, state: TState | Dict[str, Any]):
        with pf.interval("state_merger.merge_state"):
            if isinstance(state, dict) and len(state) == 0:
                return await self.get_state()

            with pf.interval("state_merger.merge_state.invoke"):
                values = await self.state_graph.ainvoke(state, config=CONFIG)
                state = self.state_type(**values)

            with pf.interval("state_merger.merge_state.flush"):
                self.flush(values)

        return state

    def flush(self, values: Dict[str, Any]):
        """Flush the state to the storage"""
        asyncio.create_task(self._set_state_debounced(values))
