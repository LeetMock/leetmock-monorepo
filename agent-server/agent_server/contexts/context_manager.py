import asyncio
from typing import Generic, List, TypeVar, cast

from agent_server.contexts.session import BaseSession, CodeSession
from agent_server.convex.api import ConvexApi
from agent_server.livekit.channel import ChanConfig, ChanValue
from agent_server.livekit.validators import string_validator
from agent_server.utils.logger import get_logger
from livekit.agents import JobContext
from livekit.agents.llm import ChatContext

from libs.convex_types import CodeSessionState

logger = get_logger(__name__)

RECONNECT_MESSAGE = (
    "(User has disconnected and reconnected back to the interview, you would say:)"
)

SESSION_ID_TOPIC = "session-id"

TSession = TypeVar("TSession", bound=BaseSession)


class AgentContextManager(Generic[TSession]):
    """AgentContextManager is a context manager for the agent."""

    def __init__(
        self,
        ctx: JobContext,
        api: ConvexApi,
        session: TSession,
    ):
        super().__init__()

        self.ctx = ctx
        self.api = api

        self._session = session
        self._session_id_fut = asyncio.Future[str]()
        self._chat_ctx = ChatContext()
        self._snapshots: List[CodeSessionState] = []

        self._has_started = False
        self._start_lock = asyncio.Lock()

    @property
    def session(self) -> TSession:
        assert self._session is not None, "Session not set yet"
        return self._session

    @property
    def chat_ctx(self) -> ChatContext:
        return self._chat_ctx

    @property
    def session_id(self) -> str:
        assert self._session_id_fut.done(), "Session id not set yet"
        return self._session_id_fut.result()

    async def setup(self):
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
        await self._session.start(result)

    async def start(self):
        async with self._start_lock:
            if self._has_started:
                logger.warning(
                    "start method called multiple times. Ignoring subsequent calls."
                )
                return

            self._has_started = True
            await self.ctx.connect()
            await self.setup()
