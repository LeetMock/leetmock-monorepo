import asyncio
from typing import Any, Dict, Generic, Literal, Type, TypeVar

from agent_graph.storages import StateStorage
from debouncer import debounce
from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph.state import CompiledStateGraph, StateGraph
from livekit.agents.utils import EventEmitter
from pydantic.v1 import BaseModel, Field, PrivateAttr

from libs.profiler import get_profiler

pf = get_profiler()

TState = TypeVar("TState", bound=BaseModel)
EventTypes = Literal["state_changed"]

CONFIG = RunnableConfig(configurable={"thread_id": "1"})


class StateMerger(EventEmitter[EventTypes], Generic[TState]):
    """A state merger is a class that keeps a persistent state and allows for merging with other states."""

    def __init__(
        self,
        state_type: Type[TState],
        state_graph: CompiledStateGraph,
        storage: StateStorage,
    ):
        super().__init__()

        self.state_type = state_type
        self.state_graph = state_graph
        self.storage = storage

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
            await merger.merge_state(initial_state, emit_event=False)

        return merger

    async def get_state(self) -> TState:
        state_dict = await self.get_state_dict()
        return self.state_type(**state_dict)

    async def get_state_dict(self) -> Dict[str, Any]:
        snapshot = await self.state_graph.aget_state(config=CONFIG)
        return snapshot.values

    async def merge_state(
        self, state: TState | Dict[str, Any], emit_event: bool = True
    ):
        with pf.interval("state_merger.merge_state"):
            if isinstance(state, dict) and len(state) == 0:
                state = await self.get_state()
            else:
                with pf.interval("state_merger.merge_state.invoke"):
                    values = await self.state_graph.ainvoke(state, config=CONFIG)
                    state = self.state_type(**values)

                with pf.interval("state_merger.merge_state.flush"):
                    self.flush(values)

            if emit_event:
                self.emit("state_changed", state)

        return state

    def flush(self, values: Dict[str, Any]):
        """Flush the state to the storage"""
        asyncio.create_task(self._set_state_debounced(values))
