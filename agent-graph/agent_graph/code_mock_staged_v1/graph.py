from collections import defaultdict
from typing import Dict, List, cast

from agent_graph.code_mock_staged_v1 import coding_stage, intro_stage, stage_tracker
from agent_graph.code_mock_staged_v1.constants import (
    CODING_SIGNALS,
    CODING_STEPS,
    EVAL_SIGNALS,
    EVAL_STEPS,
    INTRO_SIGNALS,
    INTRO_STEPS,
    AgentConfig,
    StageTypes,
    format_content_changed_notification_messages,
    get_next_stage,
)
from agent_graph.constants import JOIN_CALL_MESSAGE
from agent_graph.events import EVENT_DESCRIPTORS, EventDescriptor
from agent_graph.types import EventMessageState, MessageWrapper, Signal, Step
from agent_graph.utils import with_event_reset, with_trigger_reset
from langchain_core.messages import HumanMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from pydantic.v1 import Field

from libs.convex.convex_types import (
    CodeSessionContentChangedEvent,
    CodeSessionState,
    SessionMetadata,
)


class AgentState(EventMessageState):
    """State of the agent."""

    initialized: bool = Field(
        default=False,
        description="Whether the agent is initialized",
    )

    current_stage: StageTypes = Field(
        default=StageTypes.INTRO,
        description="Current stage of the agent",
    )

    events: List[EventDescriptor] = Field(
        default_factory=list,
        description="Event descriptors for the agent",
    )

    steps: Dict[StageTypes, List[Step]] = Field(
        default_factory=lambda: defaultdict(list),
        description="Steps for the agent",
    )

    signals: Dict[StageTypes, List[Signal]] = Field(
        default_factory=lambda: defaultdict(list),
        description="Signals for the agent",
    )

    completed_steps: Dict[StageTypes, List[str]] = Field(
        default_factory=lambda: defaultdict(list),
        description="Completed steps for the agent",
    )

    caught_signals: Dict[StageTypes, List[str]] = Field(
        default_factory=lambda: defaultdict(list),
        description="Caught signals for the agent",
    )


# --------------------- agent graph nodes --------------------- #
async def init_state(_: AgentState):
    messages = [HumanMessage(content=JOIN_CALL_MESSAGE)]
    stages = [StageTypes.INTRO, StageTypes.CODING, StageTypes.EVAL]
    events = EVENT_DESCRIPTORS

    steps = {
        StageTypes.INTRO: INTRO_STEPS,
        StageTypes.CODING: CODING_STEPS,
        StageTypes.EVAL: EVAL_STEPS,
    }

    signals = {
        StageTypes.INTRO: INTRO_SIGNALS,
        StageTypes.CODING: CODING_SIGNALS,
        StageTypes.EVAL: EVAL_SIGNALS,
    }

    completed_steps = {stage: [] for stage in stages}
    caught_signals = {stage: [] for stage in stages}

    return dict(
        initialized=True,
        messages=messages,
        events=events,
        steps=steps,
        signals=signals,
        completed_steps=completed_steps,
        caught_signals=caught_signals,
    )


async def on_event(
    state: AgentState,
):
    if state.event == "trigger":
        return with_event_reset(trigger=True)

    if state.event == "user_message":
        messages = cast(MessageWrapper, state.event_data).messages
        return with_event_reset(trigger=True, messages=messages)

    if state.event == "reminder":
        messages = HumanMessage(
            content="(Now the user has been slient in a while, you would say:)"
        )
        return with_event_reset(trigger=True, messages=messages)

    if state.event == "content_changed":
        event_data = cast(CodeSessionContentChangedEvent, state.event_data)
        messages = format_content_changed_notification_messages(event_data)
        return with_event_reset(trigger=False, messages=messages)

    return with_event_reset(trigger=False)


async def on_trigger(state: AgentState):
    # Router node that redirect to the correct stage
    return with_trigger_reset()


async def decide_next_stage(state: AgentState):
    stage_steps = state.steps[state.current_stage]
    required_step_names = [step.name for step in stage_steps if step.required]
    completed_step_names = state.completed_steps[state.current_stage]

    completed_stage_steps = (
        len(set(required_step_names) - set(completed_step_names)) == 0
    )
    next_stage = (
        get_next_stage(state.current_stage)
        if completed_stage_steps
        else state.current_stage
    )

    return dict(current_stage=next_stage, trigger=False)


# --------------------- agent graph edges --------------------- #
async def decide_entry_point(
    state: AgentState,
):
    if not state.initialized:
        return "init_state"
    elif state.event:
        return "on_event"
    elif state.trigger:
        return "on_trigger"
    return END


async def should_trigger_event(state: AgentState):
    if state.event:
        return "on_event"
    return END


async def select_stage(state: AgentState):
    if state.current_stage == StageTypes.END:
        return END
    return state.current_stage.value


def create_graph():
    return (
        StateGraph(AgentState, AgentConfig)
        # nodes
        .add_node("init_state", init_state)
        .add_node("on_event", on_event)
        .add_node("on_trigger", on_trigger)
        .add_node("decide_next_stage", decide_next_stage)
        .add_node("stage_tracker", stage_tracker.create_compiled_graph())
        .add_node(StageTypes.INTRO, intro_stage.create_compiled_graph())
        .add_node(StageTypes.CODING, coding_stage.create_compiled_graph())
        # edges
        .add_conditional_edges(
            source=START,
            path=decide_entry_point,
            path_map=["init_state", "on_event", "on_trigger", END],
        )
        .add_conditional_edges(
            source="init_state",
            path=should_trigger_event,
            path_map=["on_event", END],
        )
        .add_edge("on_event", END)
        .add_conditional_edges(
            source="on_trigger",
            path=select_stage,
            path_map=[StageTypes.INTRO, StageTypes.CODING, END],
        )
        .add_edge(StageTypes.INTRO, "stage_tracker")
        .add_edge(StageTypes.CODING, "stage_tracker")
        .add_edge("stage_tracker", "decide_next_stage")
        .add_edge("decide_next_stage", END)
    )


def create_compiled_graph():
    return create_graph().compile(checkpointer=MemorySaver())


graph = create_compiled_graph()
