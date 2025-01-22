import asyncio
from typing import Generic, Type, TypeVar

from agent_graph.state_merger import AgentStateEmitter
from agent_graph.storages.convex import ConvexStateStorage
from agent_graph.storages.langgraph_cloud import LangGraphCloudStateStorage
from agent_graph.types import EventMessageState
from agent_server.contexts.session import BaseSession
from agent_server.livekit.channel import ChanConfig, ChanValue
from agent_server.livekit.validators import string_validator
from agent_server.utils.logger import get_logger
from livekit.agents import JobContext

from libs.convex.api import ConvexApi

logger = get_logger(__name__)


SESSION_ID_TOPIC = "session-id"

TSession = TypeVar("TSession", bound=BaseSession)
TState = TypeVar("TState", bound=EventMessageState)


class AgentContextManager(Generic[TSession, TState]):
    """AgentContextManager coordinates the lifecycle and state management of an agent session.

    This class manages the connection between a LiveKit job context, Convex API, and a session instance.
    It handles session initialization, chat context management, and state synchronization.

    Attributes:
        ctx (JobContext): The LiveKit job context for managing room connections
        api (ConvexApi): The Convex API client for backend communication
        session (TSession): The managed session instance
        chat_ctx (ChatContext): The current chat context
        session_id (str): The unique identifier for the current session

    Example:
        ```python
        ctx_manager = AgentContextManager(
            ctx=job_context,
            api=convex_api,
            session=code_session
        )
        await ctx_manager.start()
        ```
    """

    def __init__(
        self,
        ctx: JobContext,
        api: ConvexApi,
        state_type: Type[TState],
        session: TSession,
        agent_state_emitter: AgentStateEmitter[TState],
    ):
        """Initialize the AgentContextManager.

        Args:
            ctx (JobContext): The LiveKit job context
            api (ConvexApi): The Convex API client instance
            session (TSession): The session instance to manage
            agent_state_emitter (StateMergerEventEmitter[TState]): The event emitter for agent state events
        """

        super().__init__()

        self.ctx = ctx
        self.api = api
        self.state_type = state_type
        self._session = session
        self._agent_state_emitter = agent_state_emitter

        self._has_started = False
        self._start_lock = asyncio.Lock()
        self._session_id_fut = asyncio.Future[str]()

    @property
    def session(self) -> TSession:
        """Get the managed session instance.

        Returns:
            TSession: The current session instance

        Raises:
            AssertionError: If the session hasn't been initialized
        """
        assert self._session is not None, "Session not set yet"
        return self._session

    @property
    def session_id(self) -> str:
        """Get the current session ID.

        Returns:
            str: The unique identifier for the current session

        Raises:
            AssertionError: If the session ID hasn't been set yet
        """
        assert self._session_id_fut.done(), "Session id not set yet"
        return self._session_id_fut.result()

    async def setup(self):
        """Set up the session connection and initialization at the start of the interview.

        This method:
        1. Creates a data channel to receive the session ID
        2. Waits for and stores the session ID from the client
        3. Initializes the session with the received ID
        """
        config = ChanConfig(
            topic=SESSION_ID_TOPIC,
            period=1.0,
            exit_on_receive=True,
            validator=string_validator(min_length=1),
        )

        # Create a data channel value to fetch the session id
        value = ChanValue(config).connect(self.ctx)

        # Wait for the session id to be received
        result = await value.result()
        self._session_id_fut.set_result(result)

        # Setup the session with the session id
        await self._session.start(result, self._agent_state_emitter)
        # Connect the agent state emitter to the state storage
        await self._agent_state_emitter.connect(
            storage=LangGraphCloudStateStorage(
                thread_id=self.session.session_metadata.agent_thread_id,
                assistant_id=self.session.session_metadata.assistant_id,
            )
        )

    async def start(self):
        """Start the context manager and initialize all components.

        This method:
        1. Ensures only one start operation runs at a time
        2. Connects the LiveKit context
        3. Runs the setup process

        Note:
            This method is idempotent - subsequent calls after the first will be ignored.
        """
        async with self._start_lock:
            if self._has_started:
                logger.warning(
                    "start method called multiple times. Ignoring subsequent calls."
                )
                return

            self._has_started = True
            await self.ctx.connect()
            await self.setup()

        return self
