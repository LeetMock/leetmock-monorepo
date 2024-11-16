import asyncio
import time
from abc import ABC, abstractmethod
from typing import Literal, TypeVar

from agent_server.convex.query_watcher import QueryWatcher
from agent_server.utils.logger import get_logger
from livekit.agents.utils import EventEmitter
from pydantic import BaseModel

from libs.convex.api import ConvexApi
from libs.convex.convex_requests import create_get_session_metadata_request
from libs.convex.convex_types import (
    CodeSessionContentChangedEvent,
    CodeSessionState,
    CodeSessionTestcaseChangedEvent,
    CodeSessionUserTestcaseExecutedEvent,
    SessionMetadata,
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

    @property
    def session_state(self) -> BaseModel:
        raise NotImplementedError

    @property
    def session_metadata(self) -> SessionMetadata:
        raise NotImplementedError

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


CodeSessionEventTypes = Literal[
    "content_changed", "testcase_changed", "testcase_executed"
]


CODE_SESSION_STATE_QUERY = "codeSessionStates:get"
CONTENT_CHANGED_QUERY = "codeSessionEvents:getLatestContentChangeEvent"
TESTCASE_CHANGED_QUERY = "codeSessionEvents:getLatestTestcaseChangeEvent"
USER_TESTCASE_EXECUTED_QUERY = "codeSessionEvents:getLatestUserTestcaseExecutedEvent"


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

        self.emit("content_changed", event)

    def _handle_testcase_changed(self, event: CodeSessionTestcaseChangedEvent):
        if event.ts < self._start_time_ms:
            logger.info(
                "Code session testcase changed event is older than session start time."
                "Ignoring event."
            )
            return

        self.emit("testcase_changed", event)

    def _handle_user_testcase_executed(
        self, event: CodeSessionUserTestcaseExecutedEvent
    ):
        if event.ts < self._start_time_ms:
            logger.info(
                "Code session user testcase executed event is older than session start time."
                "Ignoring event."
            )
            return

        self.emit("testcase_executed", event)

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

        testcase_changed_watcher = QueryWatcher.from_query(
            query=TESTCASE_CHANGED_QUERY,
            params={"codeSessionStateId": self.session_state.id},
            validator_cls=CodeSessionTestcaseChangedEvent,
        )

        user_testcase_executed_watcher = QueryWatcher.from_query(
            query=USER_TESTCASE_EXECUTED_QUERY,
            params={"codeSessionStateId": self.session_state.id},
            validator_cls=CodeSessionUserTestcaseExecutedEvent,
        )

        # TODO: add more event types

        content_changed_watcher.on_update(self._handle_content_changed)
        content_changed_watcher.watch(self._api)

        testcase_changed_watcher.on_update(self._handle_testcase_changed)
        testcase_changed_watcher.watch(self._api)

        user_testcase_executed_watcher.on_update(self._handle_user_testcase_executed)
        user_testcase_executed_watcher.watch(self._api)
