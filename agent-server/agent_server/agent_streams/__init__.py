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

from agent_graph.state_merger import StateMerger
from agent_graph.types import EventMessageState
from agent_server.contexts.session import BaseSession
from agent_server.utils.messages import livekit_to_langchain_message
from agent_server.utils.streams import to_async_iterable
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
    """A stream manager for handling agent interactions and state management.

    AgentStream coordinates the execution of a state graph, manages message queues,
    and handles the synchronization between the voice assistant and session state.

    Attributes:
        name (str): The unique identifier for this agent stream used in LangGraph
        state_cls (Type[TState]): The class type for state management
        assistant (VoiceAssistant): The voice assistant instance
        session (BaseSession): The current session being managed
        graph (StateGraph): The compiled state graph for agent logic
        state_merger (StateMerger[TState]): Utility for merging state updates

    Example:
        ```python
        stream = AgentStream(
            name="coding_agent",
            state_cls=CodingState,
            config=agent_config,
            session=code_session,
            graph=agent_graph,
            assistant=voice_assistant,
            state_merger=state_merger,
            message_q=message_queue
        )
        ```
    """

    name: str = Field(..., description="The name of the agent stream")

    state_cls: Type[TState] = Field(
        ..., description="The type of the state to be returned"
    )

    global_session_ts: int = Field(..., description="The global session timestamp")

    assistant: VoiceAssistant = Field(
        ..., description="The voice assistant to trigger the agent"
    )

    session: BaseSession = Field(..., description="The session to trigger the agent")

    graph: StateGraph = Field(
        ..., description="The compiled state graph to trigger the agent"
    )

    state_merger: StateMerger[TState] = Field(
        ..., description="The state merger to merge the state"
    )

    _message_q: asyncio.Queue[AsyncIterator[str] | None] = PrivateAttr(...)

    _agent_config: Dict[str, Any] = PrivateAttr(...)

    class Config:
        arbitrary_types_allowed = True

    def __init__(
        self,
        name: str,
        state_cls: Type[TState],
        global_session_ts: int,
        config: BaseModel,
        session: BaseSession,
        graph: StateGraph,
        assistant: VoiceAssistant,
        state_merger: StateMerger[TState],
        message_q: asyncio.Queue[AsyncIterator[str] | None],
    ):
        """Initialize a new AgentStream instance.

        Args:
            name (str): Unique identifier for this stream
            state_cls (Type[TState]): Class type for state management
            config (BaseModel): Configuration for the agent
            session (BaseSession): Current session instance
            graph (StateGraph): Compiled state graph
            assistant (VoiceAssistant): Voice assistant instance
            state_merger (StateMerger[TState]): State merger utility
            message_q (asyncio.Queue): Queue for message handling
        """
        super().__init__(
            name=name,
            state_cls=state_cls,
            global_session_ts=global_session_ts,
            assistant=assistant,
            graph=graph,
            session=session,
            state_merger=state_merger,
        )

        self._agent_config = config.dict()
        self._message_q = message_q

    async def get_state(self) -> TState:
        """Retrieve the current state from the state merger.

        Returns:
            TState: Current state of the agent
        """
        return await self.state_merger.get_state()

    def _stateless_graph_stream(
        self, initial_state: TState
    ) -> AsyncIterator[Tuple[StreamMode, Any]]:
        """Create a stream from the state graph with the given initial state.

        Args:
            initial_state (TState): Initial state to start the graph execution

        Returns:
            AsyncIterator[Tuple[StreamMode, Any]]: Stream of state updates and custom events
        """
        graph = self.graph.compile().with_config({"run_name": f"{self.name}:graph"})
        config = make_config(self._agent_config)
        return graph.astream(input=initial_state, config=config, stream_mode=["values", "custom"])  # type: ignore

    async def notify_agent(self, event_name: str, data: Any) -> bool:
        """Notify the agent of an event and determine if it should trigger a response.

        Args:
            event_name (str): Name of the event that occurred
            data (Any): Event-specific data

        Returns:
            bool: True if the agent should be triggered to respond
        """
        state = await self.state_merger.get_state()
        state.event = event_name
        state.event_data = data
        state.trigger = False
        state.session_metadata = self.session.session_metadata.dict()
        state.session_state = self.session.session_state.dict()
        state.interview_flow = self.session.session_metadata.interview_flow
        #

        logger.info(f"Notifying agent with event XXX: {state.interview_flow}")

        should_trigger = False
        async for mode, part in self._stateless_graph_stream(state):
            if mode != "values":
                continue

            snapshot = await self.state_merger.merge_state(part)

            if snapshot.trigger:
                should_trigger = True

        return should_trigger

    async def trigger_agent(self, timestamp: Timestamp, is_user_message: bool):
        """Trigger the agent to generate and deliver a response. The entrypoint for interacting with the agent graph.

        Args:
            timestamp (Timestamp): Current timestamp for interruption checking
            is_user_message (bool): Whether this is in response to a user message

        Note:
            If is_user_message is True, the response is queued for message handling.
            Otherwise, it's sent directly to the voice assistant.
        """
        start_t = timestamp.t
        should_interrupt = lambda: start_t != timestamp.t

        state = await self.state_merger.get_state()
        state.event = None
        state.event_data = None
        state.trigger = True
        state.session_metadata = self.session.session_metadata.dict()
        state.session_state = self.session.session_state.dict()

        logger.info("Triggering agent")
        text_stream = self._assistant_text_stream(state, should_interrupt)

        if is_user_message:
            # Case 1: The bot is responding to a user message
            await self._message_q.put(text_stream)
        else:
            # Case 2: The bot is sending a message to the user spontaneously, e.g. reminder
            await self.assistant.say(
                to_async_iterable(text_stream),
                allow_interruptions=True,
                add_to_chat_ctx=True,
            )

            # We need to manually merge the newly added messages into state
            await self.state_merger.merge_state(
                dict(
                    messages=livekit_to_langchain_message(
                        self.assistant.chat_ctx, self.global_session_ts
                    )
                )
            )

    async def _assistant_text_stream(
        self,
        state: TState,
        should_interrupt: Callable[[], bool],
    ) -> AsyncIterator[str]:
        """Generate a stream of text from the agent's response.

        Args:
            state (TState): Current state to generate response from
            should_interrupt (Callable[[], bool]): Function to check for interruptions

        Returns:
            AsyncIterator[str]: Stream of text chunks from the agent's response

        Note:
            Monitors for interruptions and merges state updates during generation.
        """
        chunks = []

        first_token_received = False
        async for mode, part in self._stateless_graph_stream(state):
            if should_interrupt():
                logger.info("Interrupting graph stream")
                break

            if mode == "values":
                await self.state_merger.merge_state(part)

            if mode == "custom":
                id, chunk_text = part["id"], cast(str, part["data"])
                if id != "assistant":
                    continue

                if not first_token_received:
                    first_token_received = True

                yield chunk_text
                chunks.append(chunk_text)

        logger.info(f"Agent text stream: {''.join(chunks)}")
