from typing import Any, AsyncIterator, Generic, Tuple, Type, TypeVar

from agent_graph.state_merger import StateMerger
from agent_graph.types import EventMessageState
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph
from langgraph.types import StreamMode
from livekit.agents.voice_assistant import VoiceAssistant
from pydantic.v1 import BaseModel, Field, PrivateAttr

from libs.timestamp import Timestamp

TState = TypeVar("TState", bound=EventMessageState)


def get_config(thread_id: int) -> RunnableConfig:
    return {"configurable": {"thread_id": str(thread_id)}}


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

    _state_merger: StateMerger[TState] = PrivateAttr(...)

    def __init__(
        self, state_cls: Type[TState], assistant: VoiceAssistant, graph: StateGraph
    ):
        super().__init__(state_cls=state_cls, assistant=assistant, graph=graph)
        self._state_merger = StateMerger.from_state(state_cls)
        self._fetch_remote_state()

    async def get_state(self) -> TState:
        return await self._state_merger.get_state()

    def _fetch_remote_state(self):
        # TODO: fetch latest state from convex
        pass

    def _update_remote_state(self, state: TState):
        # TODO: update state in convex
        pass

    def _stateless_graph_stream(
        self, initial_state: TState
    ) -> AsyncIterator[Tuple[StreamMode, Any]]:
        graph = self.graph.compile()
        return graph.astream(initial_state, stream_mode=["values", "custom"])  # type: ignore

    async def send_event(self, event_name: str, data: Any) -> bool:
        state = await self._state_merger.get_state()
        state.event = event_name
        state.event_data = data

        # TODO: send event to langgraph, check if graph should be triggered
        async for mode, part in self._stateless_graph_stream(state):
            if mode == "values":
                await self._state_merger.merge_state(part)

        return True

    async def trigger_agent(self, timestamp: Timestamp):
        start_t = timestamp.t

        state = await self._state_merger.get_state()
        state.event = None
        state.event_data = None
        state.trigger = True

        # TODO: run langgraph, stop when graph is done or interrupted
        async for mode, part in self._stateless_graph_stream(state):
            if start_t != timestamp.t:
                break

            if mode == "values":
                await self._state_merger.merge_state(part)

            if mode == "custom":
                id, data = part["id"], part["data"]
                if id != "assistant":
                    continue

                print(data)

        return True
