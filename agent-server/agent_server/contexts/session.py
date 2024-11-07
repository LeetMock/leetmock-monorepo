import asyncio
import time
from abc import ABC, abstractmethod
from typing import Literal, TypeVar

from agent_server.convex.api import ConvexApi
from agent_server.convex.query_watcher import QueryWatcher
from agent_server.utils.logger import get_logger
from livekit.agents.utils import EventEmitter
from pydantic import BaseModel

from libs.convex_types import (
    CodeSessionContentChangedEvent,
    CodeSessionState,
    SessionMetadata,
    create_get_session_metadata_request,
)

logger = get_logger(__name__)


TEventTypes = TypeVar("TEventTypes", bound=str)
TEvent = TypeVar("TEvent", bound=BaseModel)


class BaseSession(EventEmitter[TEventTypes], ABC):
    """BaseSession is a base class for managing session state & sync with convex."""

    def __init__(self, api: ConvexApi):
        super().__init__()

        self._api = api
        self._has_started = False
        self._start_lock = asyncio.Lock()

    @abstractmethod
    async def setup(self, session_id: str):
        """Start the session."""
        raise NotImplementedError

    async def start(self, session_id: str):
        async with self._start_lock:
            if self._has_started:
                logger.warning(
                    "start method called multiple times. Ignoring subsequent calls."
                )
                return

            self._has_started = True
            await self.setup(session_id)


CodeSessionEventTypes = Literal["content_changed"]


CODE_SESSION_STATE_QUERY = "codeSessionStates:get"
CONTENT_CHANGED_QUERY = "codeSessionEvents:getLatestContentChangeEvent"


class CodeSession(BaseSession[CodeSessionEventTypes]):

    def __init__(self, api: ConvexApi):
        super().__init__(api)

        self._start_time_ms = int(time.time_ns() // 1_000_000)
        self._session_id: str | None = None
        self._session_metadata: SessionMetadata | None = None
        self._code_session_state: CodeSessionState | None = None
        self._synced_future: asyncio.Future[bool] = asyncio.Future()

    @property
    def session_metadata(self) -> SessionMetadata:
        assert self._session_metadata is not None
        return self._session_metadata

    @property
    def session_state(self) -> CodeSessionState:
        assert self._code_session_state is not None
        return self._code_session_state

    def _handle_code_session_state_changed(self, state: CodeSessionState):
        logger.info(f"Code session state: {state}")
        self._code_session_state = state

        if not self._synced_future.done():
            self._synced_future.set_result(True)

    def _handle_content_changed(self, event: CodeSessionContentChangedEvent):
        if event.ts < self._start_time_ms:
            logger.info(
                "Code session content changed event is older than session start time."
                "Ignoring event."
            )
            return

        logger.info(f"Code session content changed: {event}")
        self.emit("content_changed", event)

    async def setup(self, session_id: str):
        self._session_id = session_id

        # Get session metadata
        request = create_get_session_metadata_request(self._session_id)
        response = self._api.action.api_run_actions_get_session_metadata_post(request)
        if response.status == "error" or response.value is None:
            logger.error(f"Error getting session metadata: {response.error_message}")
            raise Exception(f"Error getting session metadata: {response.error_message}")

        self._session_metadata = response.value

        session_state_watcher = QueryWatcher.from_query(
            query=CODE_SESSION_STATE_QUERY,
            params={"sessionId": self._session_id},
            validator_cls=CodeSessionState,
        )

        session_state_watcher.on_update(self._handle_code_session_state_changed)
        session_state_watcher.watch(self._api)
        await self._synced_future

        content_changed_watcher = QueryWatcher.from_query(
            query=CONTENT_CHANGED_QUERY,
            params={"codeSessionStateId": self.session_state.id},
            validator_cls=CodeSessionContentChangedEvent,
        )

        content_changed_watcher.on_update(self._handle_content_changed)
        content_changed_watcher.watch(self._api)
