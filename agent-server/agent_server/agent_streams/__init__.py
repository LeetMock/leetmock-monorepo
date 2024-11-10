import asyncio
import logging
import os
from typing import (
    Any,
    AsyncIterator,
    Callable,
    Dict,
    Generic,
    Tuple,
    Type,
    TypeVar,
    cast,
)

import debouncer
from agent_graph.state_merger import StateMerger
from agent_graph.types import EventMessageState
from agent_server.contexts.session import BaseSession
from agent_server.utils.streams import to_async_iterable
from debouncer import debounce
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph
from langgraph.types import StreamMode
from langgraph_sdk import get_client
from livekit.agents.voice_assistant import VoiceAssistant
from pydantic.v1 import BaseModel, Field, PrivateAttr

from libs.timestamp import Timestamp

logger = logging.getLogger(__name__)

TState = TypeVar("TState", bound=EventMessageState)
TConfig = TypeVar("TConfig", bound=BaseModel)

LG_CLIENT = get_client(url=os.getenv("LANGGRAPH_API_URL"))


def get_config(thread_id: int) -> RunnableConfig:
    return {"configurable": {"thread_id": str(thread_id)}}


def make_config(configurable: Dict[str, Any]) -> RunnableConfig:
    return {"configurable": configurable}


class AgentStream(BaseModel, Generic[TState]):

    state_cls: Type[TState] = Field(
        ..., description="The type of the state to be returned"
    )

    assistant: VoiceAssistant = Field(
        ..., description="The voice assistant to trigger the agent"
    )

    session: BaseSession = Field(..., description="The session to trigger the agent")

    graph: StateGraph = Field(
        ..., description="The compiled state graph to trigger the agent"
    )

    _initialized: bool = PrivateAttr(default=False)

    _message_q: asyncio.Queue[AsyncIterator[str]] = PrivateAttr(...)

    _state_merger: StateMerger[TState] = PrivateAttr(...)

    _agent_config: Dict[str, Any] = PrivateAttr(...)

    _update_remote_state_debounced = PrivateAttr(...)

    class Config:
        arbitrary_types_allowed = True

    def __init__(
        self,
        state_cls: Type[TState],
        config: BaseModel,
        session: BaseSession,
        graph: StateGraph,
        assistant: VoiceAssistant,
        message_q: asyncio.Queue[AsyncIterator[str]],
    ):
        super().__init__(
            state_cls=state_cls,
            assistant=assistant,
            graph=graph,
            session=session,
        )

        @debounce(wait=1)
        async def update_remote_state_debounced():
            await self._update_remote_state()

        self._agent_config = config.dict()
        self._message_q = message_q
        self._state_merger = StateMerger.from_state(state_cls)
        self._update_remote_state_debounced = update_remote_state_debounced

    async def setup(self):
        thread_id = self.session.session_metadata.agent_thread_id
        state = await LG_CLIENT.threads.get_state(thread_id=thread_id)
        values = state["values"]

        logger.info(f"Initializing agent with state: {values}")
        await self._state_merger.merge_state(values)  # type: ignore
        self._initialized = True

    async def get_state(self) -> TState:
        return await self._state_merger.get_state()

    async def _update_remote_state(self):
        thread_id = self.session.session_metadata.agent_thread_id
        assistant_id = self.session.session_metadata.assistant_id
        state = await self._state_merger.get_state()

        logger.info(f"Updating remote state: {state}")
        await LG_CLIENT.runs.create(
            thread_id=thread_id,
            assistant_id=assistant_id,
            input=state.dict(),
            multitask_strategy="enqueue",
        )

    def _stateless_graph_stream(
        self, initial_state: TState
    ) -> AsyncIterator[Tuple[StreamMode, Any]]:
        graph = self.graph.compile()
        config = make_config(self._agent_config)
        return graph.astream(input=initial_state, config=config, stream_mode=["values", "custom"])  # type: ignore

    async def notify_agent(self, event_name: str, data: Any) -> bool:
        state = await self._state_merger.get_state()
        state.event = event_name
        state.event_data = data
        state.trigger = False
        state.session_metadata = self.session.session_metadata.dict()
        state.session_state = self.session.session_state.dict()

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
        state.session_metadata = self.session.session_metadata.dict()
        state.session_state = self.session.session_state.dict()

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
        chunks = []
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
                chunks.append(chunk_text)

        await self._update_remote_state_debounced()
        logger.info(f"Agent text stream: {''.join(chunks)}")
