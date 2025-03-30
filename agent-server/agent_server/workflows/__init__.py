from collections import defaultdict
from typing import Annotated, Dict, List, OrderedDict, Set, cast

from agent_graph.code_mock_staged_v1.constants import (
    AgentConfig,
    StageTypes,
    create_transition_confirmation_step,
    format_content_changed_notification_messages,
    format_stage_transition_messages,
    format_testcase_changed_notification_messages,
    format_user_testcase_executed_notification_messages,
    get_step_map,
)
from agent_graph.code_mock_staged_v1.subgraphs import (
    coding_stage,
    eval_stage,
    intro_stage,
)
from agent_graph.event_descriptors import EVENT_DESCRIPTORS, EventDescriptor
from agent_graph.prompts import JOIN_CALL_MESSAGE, RECONNECT_MESSAGE
from agent_graph.reducers import merge_unique
from agent_graph.types import EventMessageState, Step
from agent_graph.utils import get_configurable, with_event_reset, with_trigger_reset
from langchain_core.messages import HumanMessage
from langchain_core.messages.tool import tool_call
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from pydantic import Field

from libs.convex.convex_types import (
    CodeSessionContentChangedEvent,
    CodeSessionGroundTruthTestcaseExecutedEvent,
    CodeSessionTestcaseChangedEvent,
    CodeSessionUserTestcaseExecutedEvent,
)
from libs.message_wrapper import MessageWrapper


class AgentState(EventMessageState):
    """State of the agent."""

    initialized: bool = Field(
        default=False,
        description="Whether the agent is initialized",
    )

    current_stage_idx: int = Field(
        default=0,
        description="Current stage index of the agent",
    )

    interview_flow: List[str] = Field(
        default_factory=list,
        description="The interview flow stages sequence",
    )

    events: List[EventDescriptor] = Field(
        default_factory=list,
        description="Event descriptors for the agent",
    )

    steps: OrderedDict[StageTypes, List[Step]] = Field(
        default_factory=lambda: OrderedDict(),
        description="Steps for the agent",
    )

    completed_steps: Annotated[List[str], merge_unique] = Field(
        default_factory=list,
        description="Completed steps for the agent",
    )

    test_context: str | None = Field(
        default=None,
        description="Test context for the agent",
    )

    tool_call_detected: bool = Field(
        default=False, description="Whether the agent contain tool call"
    )

    round_until_next_confirmation: int = Field(
        default=0, description="Round until next confirmation"
    )
