from typing import Any, Generic, Type, TypeVar

from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph
from langgraph.graph.state import CompiledStateGraph
from livekit.agents.voice_assistant import VoiceAssistant
from pydantic import BaseModel, Field, PrivateAttr
from pydantic.v1 import BaseModel as BaseModelV1

from libs.timestamp import Timestamp

TState = TypeVar("TState", bound=BaseModelV1)


def get_config(thread_id: int) -> RunnableConfig:
    return {"configurable": {"thread_id": str(thread_id)}}


DEFAULT_CONFIG = get_config(1)


class AgentStream(BaseModel, Generic[TState]):

    state_cls: Type[TState] = Field(
        ..., description="The type of the state to be returned"
    )

    assistant: VoiceAssistant = Field(
        ..., description="The voice assistant to trigger the agent"
    )

    graph: StateGraph = Field(
        ..., description="The compiled state graph to trigger the agent"
    )

    _event_graph: CompiledStateGraph = PrivateAttr()

    _main_graph: CompiledStateGraph = PrivateAttr()

    def __init__(
        self, state_cls: Type[TState], assistant: VoiceAssistant, graph: StateGraph
    ):
        super().__init__(state_cls=state_cls, assistant=assistant, graph=graph)
        self._event_graph = self.graph.compile()
        self._main_graph = self.graph.compile(checkpointer=MemorySaver())
        self._fetch_and_sync_state()

    def get_state(self) -> TState:
        state_values = self._main_graph.get_state(config=DEFAULT_CONFIG).values
        return self.state_cls(**state_values)

    def _fetch_and_sync_state(self):
        # TODO: fetch latest state from convex
        pass

    def _update_state(self, state: TState):
        # TODO: update state in convex
        pass

    async def send_event(self, event_name: str, data: Any) -> bool:
        # TODO: send event to langgraph, check if graph should be triggered
        return True

    async def trigger(self, timestamp: Timestamp):
        start_t = timestamp.t
        # TODO: run langgraph, stop when graph is done or interrupted
        pass
