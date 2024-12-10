import asyncio
from abc import ABC, abstractmethod
from typing import Any, Dict, Generic, Literal, Type, TypeVar

from agent_graph.storages import StateStorage
from agent_graph.utils import with_noop_node
from agent_server.utils.logger import get_logger
from debouncer import debounce
from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph.state import CompiledStateGraph, StateGraph
from livekit.agents.utils import EventEmitter
from pydantic.v1 import BaseModel

logger = get_logger(__name__)

TState = TypeVar("TState", bound=BaseModel)
EventTypes = Literal["state_changed", "state_initialized"]

CONFIG = RunnableConfig(configurable={"thread_id": "1"})


class AgentStateEmitter(EventEmitter[EventTypes], Generic[TState], ABC):
    """An event emitter for agent state events"""

    @abstractmethod
    async def connect(self, storage: StateStorage):
        """Connect the agent state emitter to a storage"""
        raise NotImplementedError


class StateMerger(AgentStateEmitter[TState]):
    """A state merger is a class that keeps a persistent state and allows for merging with other states."""

    def __init__(
        self,
        state_type: Type[TState],
        state_graph: CompiledStateGraph,
    ):
        super().__init__()

        self.state_type = state_type
        self.state_graph = state_graph

        # Cache the state and state dict to avoid recomputing them
        self._cached_state: TState | None = None
        self._cached_state_dict: Dict[str, Any] | None = None

        self._storage: StateStorage | None = None
        self._state_lock = asyncio.Lock()
        self._initialized_fut: asyncio.Future[bool] = asyncio.Future()

        @debounce(wait=4)
        async def set_state_debounced(state: Dict[str, Any]):
            assert self._initialized_fut.done(), "State merger not initialized"
            assert self._storage is not None, "Should not happen"
            await self._storage.set_state(state)

        self._set_state_debounced = set_state_debounced

    @classmethod
    def from_state(
        cls,
        name: str,
        state_type: Type[TState],
    ):
        graph = StateGraph(state_type)
        graph = with_noop_node(graph)
        return cls(
            state_type=state_type,
            state_graph=graph.compile(checkpointer=MemorySaver()).with_config(
                {"run_name": f"{name}:state-merger"}
            ),
        )

    async def connect(self, storage: StateStorage):
        self._storage = storage

        initial_state = await storage.get_state()
        await self.merge_state(initial_state, is_initial_state=True)

        self._initialized_fut.set_result(True)
        self.emit("state_initialized", initial_state)
        return self

    async def get_state(self) -> TState:
        assert self._initialized_fut.done(), "State merger not initialized"
        assert self._cached_state is not None, "Should not happen"
        return self._cached_state

    async def get_state_dict(self) -> Dict[str, Any]:
        assert self._initialized_fut.done(), "State merger not initialized"
        assert self._cached_state_dict is not None, "Should not happen"
        return self._cached_state_dict

    async def merge_state(
        self,
        state: TState | Dict[str, Any],
        is_initial_state: bool = False,
    ):
        logger.info(f"Acquiring state lock...")
        async with self._state_lock:
            logger.info(f"State lock acquired")
            if is_initial_state:
                return await self._merge_initial_state(state)
            else:
                return await self._merge_state(state)

    def flush(self, values: Dict[str, Any]):
        """Flush the state to the storage"""
        asyncio.create_task(self._set_state_debounced(values))

    async def _merge_initial_state(self, state: TState | Dict[str, Any]):
        if isinstance(state, dict) and len(state) == 0:
            state_dict = self.state_graph.get_state(config=CONFIG).values
        else:
            state_dict = await self.state_graph.ainvoke(state, config=CONFIG)

        state = self.state_type(**state_dict)
        self._cached_state = state
        self._cached_state_dict = state_dict

        return state

    async def _merge_state(self, state: TState | Dict[str, Any]):
        if isinstance(state, dict) and len(state) == 0:
            return await self.get_state()

        state_dict = await self.state_graph.ainvoke(state, config=CONFIG)
        state = self.state_type(**state_dict)

        self.flush(state_dict)

        prev_state = self._cached_state
        self._cached_state = state
        self._cached_state_dict = state_dict

        # Callback function should not modify the state
        self.emit("state_changed", prev_state, state)

        return state
