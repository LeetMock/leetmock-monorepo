import asyncio
from typing import Generic, List, TypeVar

from agent_server.agent import LangGraphLLM
from agent_server.contexts.convex import ConvexApi
from agent_server.contexts.session import BaseSession
from agent_server.types import CodeSessionState, create_get_session_metadata_request
from agent_server.utils.logger import get_logger
from livekit.agents import AutoSubscribe, JobContext
from livekit.agents.llm import ChatContext
from livekit.rtc import DataPacket

logger = get_logger(__name__)

RECONNECT_MESSAGE = (
    "(User has disconnected and reconnected back to the interview, you would say:)"
)


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
        self.ctx.room.on("data_received", self._on_data_received)

        await self.ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
        await self._session_id_fut
        await self._session.setup(self.session_id)

    def _on_data_received(self, data: DataPacket):
        if data.topic != "session-id":
            logger.warning("Unexpected data topic: %s", data.topic)
            return

        session_id = data.data.decode("utf-8")
        if len(session_id) == 0:
            logger.warning("Received empty session id")
            return

        if not self._session_id_fut.done():
            self._session_id_fut.set_result(session_id)
            logger.info("session_id_fut set")
            return
        else:
            logger.warning("session_id_fut already set")

        asyncio.create_task(
            self.ctx.room.local_participant.publish_data(
                payload="session-id-received",
                topic="session-id-received",
                reliable=True,
            )
        )

    # async def _prepare_initial_agent_context(self, agent: LangGraphLLM):
    #     state = await agent.get_state()

    #     messages = state.get("messages", [])  # type: ignore
    #     logger.info(f"Got initial context: {messages}")

    #     if len(messages) != 0:
    #         self.chat_ctx.append(text=RECONNECT_MESSAGE, role="user")

    async def start(self):
        if self._has_started:
            logger.warning(
                "start method called multiple times. Ignoring subsequent calls."
            )
            return

        self._has_started = True
        self._session.start()
