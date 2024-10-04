import asyncio
import logging

from typing import List
from pydantic import BaseModel, Field, PrivateAttr
from convex_client import ApiClient, ActionApi, QueryApi, MutationApi, Configuration

from livekit.rtc import DataPacket
from livekit.agents import JobContext, AutoSubscribe
from livekit.agents.llm import ChatContext

from agent_server.agent import LangGraphLLM
from agent_server.types import EditorSnapshot, create_get_session_metadata_request


logger = logging.getLogger("context_manager")


RECONNECT_MESSAGE = (
    "(User has disconnected and reconnected back to the interview, you would say:)"
)


class ConvexHttpClient(BaseModel):
    """ConvexHttpClient is a client for the Convex API."""

    convex_url: str = Field(..., description="The URL of the Convex instance")

    _query_api: QueryApi = PrivateAttr()

    _mutation_api: MutationApi = PrivateAttr()

    _action_api: ActionApi = PrivateAttr()

    @property
    def query(self) -> QueryApi:
        return self._query_api

    @property
    def mutation(self) -> MutationApi:
        return self._mutation_api

    @property
    def action(self) -> ActionApi:
        return self._action_api

    def __init__(self, convex_url: str):
        super().__init__(convex_url=convex_url)

        configuration = Configuration(host=self.convex_url)
        self._client = ApiClient(configuration)
        self._query_api = QueryApi(self._client)
        self._mutation_api = MutationApi(self._client)
        self._action_api = ActionApi(self._client)


class AgentContextManager(BaseModel):
    """AgentContextManager is a context manager for the agent."""

    ctx: JobContext = Field(..., description="The job context")

    api: ConvexHttpClient = Field(..., description="The Convex API client")

    _chat_ctx: ChatContext = PrivateAttr()

    _snapshots: List[EditorSnapshot] = PrivateAttr()

    _session_id_fut: asyncio.Future[str] = PrivateAttr()

    _initialized_fut: asyncio.Future[bool] = PrivateAttr()

    class Config:
        arbitrary_types_allowed = True

    def __init__(self, ctx: JobContext, api: ConvexHttpClient):
        super().__init__(ctx=ctx, api=api)

        self._session_id_fut = asyncio.Future()
        self._initialized_fut = asyncio.Future()
        self._chat_ctx = ChatContext()
        self._snapshots = []

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

    async def _subscribe_convex_state(self):
        logger.info("Subscribing to convex state")
        self._initialized_fut.set_result(True)
        logger.info("Initialized convex state")
        pass

    async def start(self):
        asyncio.create_task(self._subscribe_convex_state())
        asyncio.create_task(self._update_convex_state())
        await self._initialized_fut
