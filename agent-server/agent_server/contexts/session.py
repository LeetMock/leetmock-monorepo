import asyncio
from abc import ABC, abstractmethod
from ast import List
from typing import Any, Dict, Literal, Type, TypeVar

from agent_server.contexts.convex import ConvexApi
from agent_server.convex.query_generator import AsyncQueryGenerator
from agent_server.types import (
    CodeSessionContentChangedEvent,
    CodeSessionState,
    SessionMetadata,
    create_get_session_metadata_request,
)
from agent_server.utils.logger import get_logger
from livekit.agents.utils import EventEmitter
from pydantic import BaseModel

logger = get_logger(__name__)


TEventTypes = TypeVar("TEventTypes", bound=str)
TEvent = TypeVar("TEvent", bound=BaseModel)


class BaseSession(EventEmitter[TEventTypes], ABC):
    """BaseSession is a base class for managing session state & sync with convex."""

    def __init__(self, api: ConvexApi):
        super().__init__()

        self._api = api
        self._session_id: str | None = None
        self._session_metadata: SessionMetadata | None = None

        self._tasks: Dict[str, asyncio.Task] = {}
        self._has_started = False
        self._start_lock = asyncio.Lock()

    @property
    def session_id(self) -> str:
        assert self._session_id is not None
        return self._session_id

    @property
    def session_metadata(self) -> SessionMetadata:
        assert self._session_metadata is not None
        return self._session_metadata

    @property
    def session_state(self) -> Any:
        raise NotImplementedError

    async def _event_stream_task(
        self,
        event_type: TEventTypes,
        query: str,
        params: Dict[str, Any],
        validator_cls: Type[TEvent],
    ):
        subscription = self._api.subscribe(query, params)
        query_stream = AsyncQueryGenerator.from_subscription(subscription)

        logger.info(f"Watching query `{query}` with params `{params}`")
        async for raw_event in query_stream:
            event = validator_cls.model_validate(raw_event)
            self.emit(event_type, event)

    def create_event_stream_task(
        self,
        event_type: TEventTypes,
        query: str,
        params: Dict[str, Any],
        validator_cls: Type[TEvent],
    ):
        if event_type in self._tasks:
            logger.warning(
                f"Event stream task for {event_type} already exists. Ignoring."
            )
            return

        self._tasks[event_type] = asyncio.create_task(
            self._event_stream_task(event_type, query, params, validator_cls)
        )

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


class CodeSession(BaseSession[CodeSessionEventTypes]):

    def __init__(self, api: ConvexApi):
        super().__init__(api)

        self._code_session_state: CodeSessionState | None = None
        self._watch_code_session_state_task: asyncio.Task | None = None
        self._synced_future: asyncio.Future[bool] = asyncio.Future()

    @property
    def session_state(self) -> CodeSessionState:
        assert self._code_session_state is not None
        return self._code_session_state

    async def _watch_code_session_state(self):
        """Watch the changes of code session state from convex."""

        subscription = self._api.subscribe(
            CODE_SESSION_STATE_QUERY, {"sessionId": self._session_id}
        )
        query_stream = AsyncQueryGenerator.from_subscription(subscription)

        logger.info(f"Watching code session state for {self._session_id}")
        async for raw_state in query_stream:
            self._code_session_state = CodeSessionState.model_validate(raw_state)
            logger.info(f"Code session state: {self._code_session_state}")

            if not self._synced_future.done():
                self._synced_future.set_result(True)

    def _on_code_session_state_changed(self, event: CodeSessionState):
        logger.info(f"Code session state: {event}")

        if not self._synced_future.done():
            self._synced_future.set_result(True)

    def _on_content_changed(self, event: CodeSessionContentChangedEvent):
        logger.info(f"Code session content changed: {event}")

    async def setup(self, session_id: str):
        self._session_id = session_id

        # Get session metadata
        request = create_get_session_metadata_request(self._session_id)
        response = self._api.action.api_run_actions_get_session_metadata_post(request)
        if response.status == "error" or response.value is None:
            logger.error(f"Error getting session metadata: {response.error_message}")
            raise Exception(f"Error getting session metadata: {response.error_message}")

        self._session_metadata = response.value
        self._watch_code_session_state_task = asyncio.create_task(
            self._watch_code_session_state()
        )

        await self._synced_future

        self.on("content_changed", self._on_content_changed)

        # Create event stream tasks
        self.create_event_stream_task(
            "content_changed",
            "codeSessionEvents:getNextContentChangeEvent",
            {"codeSessionStateId": self.session_state.id},
            CodeSessionContentChangedEvent,
        )
