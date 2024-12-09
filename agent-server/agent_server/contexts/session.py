import asyncio
import time
from abc import ABC, abstractmethod
from typing import Any, Generic, Literal, TypeVar

from agent_graph.code_mock_staged_v1.graph import AgentState
from agent_graph.state_merger import AgentStateEmitter
from agent_graph.types import EventMessageState
from agent_server.convex.query_watcher import query_watcher
from agent_server.utils.logger import get_logger
from livekit.agents.utils import EventEmitter
from pydantic import BaseModel

from libs.convex.api import ConvexApi
from libs.convex.convex_requests import (
    create_commit_code_session_event_request,
    create_get_session_metadata_request,
)
from libs.convex.convex_types import (
    CodeSessionContentChangedEvent,
    CodeSessionGroundTruthTestcaseExecutedEvent,
    CodeSessionState,
    CodeSessionTestcaseChangedEvent,
    CodeSessionUserTestcaseExecutedEvent,
    SessionMetadata,
)

logger = get_logger(__name__)


TEventTypes = TypeVar("TEventTypes", bound=str)
TState = TypeVar("TState", bound=EventMessageState)


class BaseSession(EventEmitter[TEventTypes], Generic[TEventTypes, TState], ABC):
    """BaseSession is a base class for managing session state & sync with convex.
    It inherits from EventEmitter to allow for event-based communication.
    """

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
    async def setup(
        self, session_id: str, agent_state_emitter: AgentStateEmitter[TState]
    ):
        raise NotImplementedError

    async def start(
        self, session_id: str, agent_state_emitter: AgentStateEmitter[TState]
    ):
        """Start the session with the given session ID."""
        async with self._start_lock:
            if self._has_started:
                logger.warning(
                    "start method called multiple times. Ignoring subsequent calls."
                )
                return

            self._has_started = True
            await self.setup(session_id, agent_state_emitter)


# A list of events that the code session can emit
CodeSessionEventTypes = Literal[
    "content_changed",
    "testcase_changed",
    "testcase_executed",
    "ground_truth_testcase_executed",
]

# Queries to fetch the latest events from the convex backend
CODE_SESSION_STATE_QUERY = "codeSessionStates:get"
CONTENT_CHANGED_QUERY = "codeSessionEvents:getLatestContentChangeEvent"
TESTCASE_CHANGED_QUERY = "codeSessionEvents:getLatestTestcaseChangeEvent"
USER_TESTCASE_EXECUTED_QUERY = "codeSessionEvents:getLatestUserTestcaseExecutedEvent"
GROUND_TRUTH_TESTCASE_EXECUTED_QUERY = (
    "codeSessionEvents:getLatestGroundTruthTestcaseExecutedEvent"
)


class CodeSession(BaseSession[CodeSessionEventTypes, AgentState]):
    """A session manager for the whole interview coding session.

    CodeSession extends BaseSession to handle code-specific session events and state management.
    It maintains real-time synchronization with the Convex backend for code editing sessions,
    testcase execution, and related events.

    Events:
        content_changed: Emitted when code content changes
        testcase_changed: Emitted when testcase definitions are modified
        testcase_executed: Emitted when a testcase is executed
        ground_truth_testcase_executed: Emitted when the ground truth testcase is executed

    Attributes:
        session_metadata (SessionMetadata): Metadata about the current session
        session_state (CodeSessionState): Current state of the code session

    Example:
        ```python
        session = CodeSession(api=convex_api)
        await session.start("session_123")

        @session.on("content_changed")
        def handle_content_change(event: CodeSessionContentChangedEvent):
            print(f"Code changed: {event}")
        ```

    Note:
        The session maintains timestamps to prevent processing of stale events that
        occurred before the session started. All events are validated against their
        respective Pydantic models before being emitted.
    """

    def __init__(self, api: ConvexApi):
        """Initialize a new CodeSession instance.

        Args:
            api (ConvexApi): The Convex API client for backend communication

        Note:
            Initializes internal state including:
            - Start timestamp in milliseconds
            - Session tracking variables
            - Synchronization primitives
        """

        super().__init__(api)

        self._start_time_ms = int(time.time_ns() // 1_000_000)
        self._session_id: str | None = None
        self._session_metadata: SessionMetadata | None = None
        self._code_session_state: CodeSessionState | None = None
        self._synced_future: asyncio.Future[bool] = asyncio.Future()

    @property
    def session_metadata(self) -> SessionMetadata:
        """Get the metadata for the current session.

        Returns:
            SessionMetadata: Metadata about the current session

        Raises:
            AssertionError: If session metadata hasn't been initialized
        """
        assert self._session_metadata is not None
        return self._session_metadata

    @property
    def session_state(self) -> CodeSessionState:
        """Get the current state of the code session.

        Returns:
            CodeSessionState: Current state of the code session

        Raises:
            AssertionError: If session state hasn't been initialized
        """
        assert self._code_session_state is not None
        return self._code_session_state

    def _handle_code_session_state_changed(self, state: CodeSessionState):
        """Handle updates to the code session state.

        Updates the internal session state and completes the sync future
        when the initial state is received.

        Args:
            state (CodeSessionState): The new session state from Convex
        """
        self._code_session_state = state

        if not self._synced_future.done():
            self._synced_future.set_result(True)

    def _create_event_handler(self, event_name: CodeSessionEventTypes):
        def handler(event: Any):
            if event.ts < self._start_time_ms:
                logger.info(
                    f"Code session {event_name} event is older than session start time."
                    "Ignoring event."
                )
                return

            self.emit(event_name, event)

        return handler

    def _create_handle_state_changed_task(self, prev: AgentState, curr: AgentState):
        asyncio.create_task(self._handle_state_changed(prev, curr))

    async def _handle_state_changed(self, prev: AgentState, curr: AgentState):
        """Handle updates to the code session state.

        Updates the internal session state and completes the sync future
        when the initial state is received.
        """

        if prev.current_stage_idx != curr.current_stage_idx:
            assert (
                self._session_id is not None
            ), "Session ID must be set before committing events"

            logger.info("Committing stage_switched code session event")
            await asyncio.sleep(3)  # allow agent to finish the last sentence (if any)

            self._api.mutation_unsafe(
                name="codeSessionEvents:commitCodeSessionEvent",
                args={
                    "sessionId": self._session_id,
                    "event": {
                        "type": "stage_switched",
                        "data": {"stageIdx": curr.current_stage_idx},
                    },
                },
            )
            logger.info("Committed stage_switched code session event")

    async def setup(
        self,
        session_id: str,
        agent_state_emitter: AgentStateEmitter[AgentState],
    ):
        """Set up the code session with the given session ID.

        This method:
        1. Fetches session metadata from Convex
        2. Sets up watchers for various session events:
            - Session state changes
            - Code content changes
            - Testcase changes
            - Testcase execution results

        Args:
            session_id (str): The unique identifier for this session

        Raises:
            Exception: If there's an error fetching session metadata

        Note:
            All watchers are configured with appropriate validators and handlers
        """
        self._session_id = session_id

        # Get session metadata
        request = create_get_session_metadata_request(self._session_id)
        response = self._api.action.api_run_actions_get_session_metadata_post(request)
        if response.status == "error" or response.value is None:
            logger.error(f"Error getting session metadata: {response.error_message}")
            raise Exception(f"Error getting session metadata: {response.error_message}")

        self._session_metadata = response.value

        session_state_watcher = query_watcher(
            query=CODE_SESSION_STATE_QUERY,
            params={"sessionId": self._session_id},
            validator_cls=CodeSessionState,
        )

        session_state_watcher.on_update(self._handle_code_session_state_changed)
        session_state_watcher.watch(self._api)
        await self._synced_future

        # Observe for agent state changes
        agent_state_emitter.on("state_changed", self._create_handle_state_changed_task)

        content_changed_watcher = query_watcher(
            query=CONTENT_CHANGED_QUERY,
            params={"codeSessionStateId": self.session_state.id},
            validator_cls=CodeSessionContentChangedEvent,
        )

        testcase_changed_watcher = query_watcher(
            query=TESTCASE_CHANGED_QUERY,
            params={"codeSessionStateId": self.session_state.id},
            validator_cls=CodeSessionTestcaseChangedEvent,
        )

        user_testcase_executed_watcher = query_watcher(
            query=USER_TESTCASE_EXECUTED_QUERY,
            params={"codeSessionStateId": self.session_state.id},
            validator_cls=CodeSessionUserTestcaseExecutedEvent,
        )

        ground_truth_testcase_executed_watcher = query_watcher(
            query=GROUND_TRUTH_TESTCASE_EXECUTED_QUERY,
            params={"codeSessionStateId": self.session_state.id},
            validator_cls=CodeSessionGroundTruthTestcaseExecutedEvent,
        )

        # TODO: add more event types

        content_changed_handler = self._create_event_handler("content_changed")
        testcase_changed_handler = self._create_event_handler("testcase_changed")
        user_testcase_executed_handler = self._create_event_handler("testcase_executed")
        ground_truth_executed_handler = self._create_event_handler(
            "ground_truth_testcase_executed"
        )

        content_changed_watcher.on_update(content_changed_handler)
        content_changed_watcher.watch(self._api)

        testcase_changed_watcher.on_update(testcase_changed_handler)
        testcase_changed_watcher.watch(self._api)

        user_testcase_executed_watcher.on_update(user_testcase_executed_handler)
        user_testcase_executed_watcher.watch(self._api)

        ground_truth_testcase_executed_watcher.on_update(ground_truth_executed_handler)
        ground_truth_testcase_executed_watcher.watch(self._api)
