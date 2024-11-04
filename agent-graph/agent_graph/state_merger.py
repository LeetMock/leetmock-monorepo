from typing import Any, Dict, Generic, Type, TypeVar

from langchain_core.runnables import RunnableConfig
from langgraph.graph.state import CompiledStateGraph, StateGraph
from pydantic.v1 import BaseModel, Field

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

    @classmethod
    def from_state(cls, state_type: Type[TState]):
        graph = StateGraph(state_type)
        return cls(state_type=state_type, state_graph=graph.compile())

    async def get_state(self):
        snapshot = await self.state_graph.aget_state(config=CONFIG)
        return self.state_type(**snapshot.values)

    async def merge_state(self, state: TState | Dict[str, Any]):
        return await self.state_graph.ainvoke(state, config=CONFIG)
