import asyncio
import logging
from typing import Any, AsyncIterator, Callable, Generic, Tuple, Type, TypeVar, cast

from agent_graph.state_merger import StateMerger
from agent_graph.types import EventMessageState
from agent_server.utils.streams import to_async_iterable
from langchain_core.messages import BaseMessageChunk
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph
from langgraph.types import StreamMode
from livekit.agents.voice_assistant import VoiceAssistant
from pydantic.v1 import BaseModel, Field, PrivateAttr

from libs.timestamp import Timestamp

logger = logging.getLogger(__name__)

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

    _message_q: asyncio.Queue[AsyncIterator[str]] = PrivateAttr(...)

    _state_merger: StateMerger[TState] = PrivateAttr(...)

    class Config:
        arbitrary_types_allowed = True

    def __init__(
        self,
        state_cls: Type[TState],
        assistant: VoiceAssistant,
        graph: StateGraph,
        message_q: asyncio.Queue[AsyncIterator[str]],
    ):
        super().__init__(state_cls=state_cls, assistant=assistant, graph=graph)
        self._message_q = message_q
        self._state_merger = StateMerger.from_state(state_cls)
        self._fetch_remote_state()

    async def get_state(self) -> TState:
        return await self._state_merger.get_state()

    def _fetch_remote_state(self):
        # TODO: fetch latest state from convex
        pass

    async def _update_remote_state(self, state: TState):
        # TODO: update state in convex
        pass

    def _stateless_graph_stream(
        self, initial_state: TState
    ) -> AsyncIterator[Tuple[StreamMode, Any]]:
        graph = self.graph.compile()
        return graph.astream(initial_state, stream_mode=["values", "custom"])  # type: ignore

    async def notify_agent(self, event_name: str, data: Any) -> bool:
        state = await self._state_merger.get_state()
        state.event = event_name
        state.event_data = data
        state.trigger = False

        should_trigger = False
        async for mode, part in self._stateless_graph_stream(state):
            if mode != "values":
                continue

            snapshot = await self._state_merger.merge_state(part)
            if snapshot.trigger:
                should_trigger = True

        return should_trigger

    async def trigger_agent(self, timestamp: Timestamp, is_user_message: bool):
        start_t = timestamp.t
        should_interrupt = lambda: start_t != timestamp.t

        state = await self._state_merger.get_state()
        state.event = None
        state.event_data = None
        state.trigger = True

        logger.info("Triggering agent")
        text_stream = self._assistant_text_stream(state, should_interrupt)

        if is_user_message:
            await self._message_q.put(text_stream)
        else:
            await self.assistant.say(
                to_async_iterable(text_stream),
                allow_interruptions=True,
                add_to_chat_ctx=True,
            )

    async def _assistant_text_stream(
        self,
        state: TState,
        should_interrupt: Callable[[], bool],
    ) -> AsyncIterator[str]:
        async for mode, part in self._stateless_graph_stream(state):
            if should_interrupt():
                logger.info("Interrupting graph stream")
                break

            if mode == "values":
                await self._state_merger.merge_state(part)

            if mode == "custom":
                id, chunk_text = part["id"], cast(str, part["data"])
                if id != "assistant":
                    continue

                yield chunk_text
