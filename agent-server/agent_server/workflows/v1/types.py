from collections import OrderedDict
from typing import Annotated, Any, Dict, List

from agent_server.workflows.reducers import merge_unique
from agent_server.workflows.types import EventDescriptor, SessionState, StageType, Step
from langchain_core.messages import AnyMessage, HumanMessage
from livechain.graph import EventSignal
from pydantic import BaseModel, Field

from libs.convex.convex_types import (
    CodeSessionContentChangedEvent,
    CodeSessionTestcaseChangedEvent,
    CodeSessionUserTestcaseExecutedEvent,
)


class AgentState(SessionState):
    """State of the agent."""

    initialized: bool = Field(default=False)

    current_stage_idx: int = Field(default=0)

    interview_flow: List[str] = Field(default_factory=list)

    event_descriptors: List[EventDescriptor] = Field(default_factory=list)

    steps: OrderedDict[StageType, List[Step]] = Field(
        default_factory=lambda: OrderedDict()
    )

    events: List[EventDescriptor] = Field(
        default_factory=list,
        description="Event descriptors for the agent",
    )

    completed_steps: Annotated[List[str], merge_unique] = Field(default_factory=list)

    test_context: str | None = Field(default=None)

    tool_call_detected: bool = Field(default=False)

    round_until_next_confirmation: int = Field(default=0)

    num_messages_before_eval: int = Field(
        default=1000000, description="Number of messages so far"
    )


class AgentConfig(BaseModel):
    """Config for the agent.

    - Used for agent-specific configurations.
    - Every single field should have a default value; otherwise, the agent will fail to start.
    """

    convex_url: str = Field(default="")

    fast_model: str = Field(default="gpt-4o-mini")

    smart_model: str = Field(default="gpt-4o")

    temperature: float = Field(default=0.2)

    stages: List[StageType] = Field(default=[])

    transition_confirmation_enabled: bool = Field(default=False)


class TrackSignals(BaseModel):
    """Track which signal(s) are observed based on the conversation history"""

    rationale: str = Field(
        ...,
        description="Rationale for which signal(s) are observed based on the conversation context",
    )

    signals: List[str] = Field(
        ...,
        description="List of signal names that are observed, name should correspond to the signal names",
    )

    # TODO: conversation suggestion


class ConfirmStageCompletion(BaseModel):
    """
    Confirm if the stage is completed based on the conversation history.

    Call this tool whenever the following three conditions are met:
    1. Interviewer prompted/asked candidate if he/she wants to move forward to the next stage.
    2. Candidate confirmed that he/she would like to move forward to the next stage.
    """

    pass


class ConfirmEndOfInterview(BaseModel):
    """
    Confirm if the interview session should be safely ended based on the conversation history.

    This tool should be only called after
    1. Interviewer has provided feedback to candidate.
    2. Candidate and interviewer say goodbye to each other, or some closing statements are made.
    """

    thought: str = Field(
        ...,
        description="Step-by-step thinking process for deciding if the interview session should be safely ended based on the conversation history",
    )

    should_end: bool = Field(
        ...,
        description="Whether the interview session should be safely ended based on the conversation history",
    )


## Event Signal Definitions ##
class UserMessageEvent(EventSignal):
    """User message event."""

    messages: List[AnyMessage]


class ReminderEvent(EventSignal):
    """Reminder event."""

    message: HumanMessage = Field(
        default=HumanMessage(
            content="(Now the user has been silent in a while, ask them if they are doing well.)"
        )
    )


class TestCaseChangedEvent(EventSignal):
    """Testcase changed event."""

    data: CodeSessionTestcaseChangedEvent


class TestCaseExecutedEvent(EventSignal):
    """Testcase executed event."""

    data: CodeSessionUserTestcaseExecutedEvent


class ContentChangedEvent(EventSignal):
    """Content changed event."""

    data: CodeSessionContentChangedEvent


class GroundTruthTestCaseExecutedEvent(EventSignal):
    """Ground truth test case executed event."""

    test_context: str
