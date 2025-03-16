from collections import OrderedDict
from typing import Annotated, List

from agent_server.workflows.reducers import merge_unique
from agent_server.workflows.types import EventDescriptor, SessionState, StageType, Step
from pydantic import Field


class AgentState(SessionState):
    """State of the agent."""

    initialized: bool = Field(default=False)

    current_stage_idx: int = Field(default=0)

    interview_flow: List[str] = Field(default_factory=list)

    event_descriptors: List[EventDescriptor] = Field(default_factory=list)

    steps: OrderedDict[StageType, List[Step]] = Field(
        default_factory=lambda: OrderedDict()
    )

    completed_steps: Annotated[List[str], merge_unique] = Field(default_factory=list)

    test_context: str | None = Field(default=None)

    tool_call_detected: bool = Field(default=False)

    round_until_next_confirmation: int = Field(default=0)
