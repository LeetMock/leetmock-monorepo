import asyncio

from datetime import datetime
from typing import List, Literal

from convex import ConvexClient
from livekit.rtc import DataPacket
from livekit.agents import JobContext, AutoSubscribe
from livekit.agents.llm import ChatContext
from livekit.agents.utils import EventEmitter
from agent_server.utils.query_iterators import AsyncQueryIterator, ConvexHttpClient
from agent_server.agent import LangGraphLLM
from agent_server.types import EditorSnapshot, create_get_session_metadata_request
from agent_server.utils.logger import get_logger

logger = get_logger(__name__)

RECONNECT_MESSAGE = (
    "(User has disconnected and reconnected back to the interview, you would say:)"
)

LATEST_SNAPSHOT_QUERY = "editorSnapshots:getLatestSnapshotBySessionId"

EventTypes = Literal["snapshot_updated"]


class AgentContextManager(EventEmitter[EventTypes]):
    """AgentContextManager is a context manager for the agent."""

    def __init__(self, ctx: JobContext, api: ConvexHttpClient):
        super().__init__()

        self.ctx = ctx
        self.api = api

        self._session_id_fut = asyncio.Future[str]()
        self._initialized_fut = asyncio.Future[bool]()
        self._chat_ctx = ChatContext()
        self._snapshots: List[EditorSnapshot] = []

        self._convex = ConvexClient(self.api.convex_url)

        self._has_started = False
        self._start_lock = asyncio.Lock()
        self._subscribe_task: asyncio.Task | None = None
        self._update_task: asyncio.Task | None = None

    @property
    def chat_ctx(self) -> ChatContext:
        return self._chat_ctx

    @property
    def snapshots(self) -> List[EditorSnapshot]:
        return self._snapshots

    @property
    def session_id(self) -> str:
        assert self._session_id_fut.done(), "Session id not set yet"
        return self._session_id_fut.result()

    async def setup(self, agent: LangGraphLLM):
        self.ctx.room.on("data_received", self._on_data_received)

        await self.ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
        await self._session_id_fut
        await self._prepare_session_and_acknowledge(agent)
        await self._prepare_initial_agent_context(agent)

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

    async def _prepare_session_and_acknowledge(self, agent: LangGraphLLM):
        request = create_get_session_metadata_request(self._session_id_fut.result())
        response = self.api.action.api_run_actions_get_session_metadata_post(request)

        if response.status == "error" or response.value is None:
            logger.error(f"Error getting session metadata: {response.error_message}")
            raise Exception(f"Error getting session metadata: {response.error_message}")

        logger.info("Acked session id")
        agent.set_agent_session(response.value)

    async def _prepare_initial_agent_context(self, agent: LangGraphLLM):
        state = await agent.get_state()

        messages = state.get("messages", [])  # type: ignore
        logger.info(f"Got initial context: {messages}")

        if len(messages) != 0:
            self.chat_ctx.append(text=RECONNECT_MESSAGE, role="user")

    async def _update_convex_state(self):
        logger.info("Updating convex state")
        pass

    async def _subscribe_snapshot_state(self):
        logger.info("Subscribing to snapshot state")

        subscription = self._convex.subscribe(
            LATEST_SNAPSHOT_QUERY,
            {"sessionId": self.session_id},
        )
        query_iterator = AsyncQueryIterator(sub=subscription)

        async for part in query_iterator:
            if not self._initialized_fut.done():
                self._initialized_fut.set_result(True)

            snapshot = EditorSnapshot.model_validate(part)
            self._snapshots.append(snapshot)
            self.emit("snapshot_updated", self._snapshots)

        logger.error("Reached unreachable code in _subscribe_snapshot_state")

    async def start(self):
        async with self._start_lock:
            if self._has_started:
                logger.warning(
                    "start method called multiple times. Ignoring subsequent calls."
                )
                return

            self._has_started = True
            self._subscribe_task = asyncio.create_task(self._subscribe_snapshot_state())
            self._update_task = asyncio.create_task(self._update_convex_state())
            await self._initialized_fut
