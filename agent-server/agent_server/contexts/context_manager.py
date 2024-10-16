import asyncio
from typing import Generic, List, TypeVar

from agent_server.chan.request import ChanRequest, RequestConfig
from agent_server.chan.validators import string_validator
from agent_server.contexts.convex import ConvexApi
from agent_server.contexts.session import BaseSession
from agent_server.types import CodeSessionState
from agent_server.utils.logger import get_logger
from livekit.agents import JobContext
from livekit.agents.llm import ChatContext
from livekit.rtc import DataPacket

logger = get_logger(__name__)

RECONNECT_MESSAGE = (
    "(User has disconnected and reconnected back to the interview, you would say:)"
)

SESSION_ID_TOPIC = "session-id"

TEventTypes = TypeVar("TEventTypes", bound=str)


class AgentContextManager(Generic[TEventTypes]):
    """AgentContextManager is a context manager for the agent."""

    def __init__(
        self,
        ctx: JobContext,
        api: ConvexApi,
        session: BaseSession[TEventTypes],
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
    def session(self) -> BaseSession[TEventTypes]:
        return self._session

    @property
    def chat_ctx(self) -> ChatContext:
        return self._chat_ctx

    @property
    def snapshots(self) -> List[CodeSessionState]:
        return self._snapshots

    @property
    def session_id(self) -> str:
        assert self._session_id_fut.done(), "Session id not set yet"
        return self._session_id_fut.result()

    async def setup(self):
        # Create a data channel request to fetch the session id
        config = RequestConfig(
            topic=SESSION_ID_TOPIC,
            validator=string_validator(min_length=1),
            period=1.0,
            exit_on_receive=True,
        )
        request = ChanRequest(config)
        await request.connect(self.ctx)

        # Wait for the session id to be received
        result = await request.result()
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
            await self.setup()
