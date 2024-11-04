from collections import defaultdict
from typing import Annotated, Dict, List

from agent_graph.code_mock_staged_v1 import intro_stage, stage_tracker
from agent_graph.code_mock_staged_v1.constants import (
    CODING_SIGNALS,
    CODING_STEPS,
    EVAL_SIGNALS,
    EVAL_STEPS,
    INTRO_SIGNALS,
    INTRO_STEPS,
    StageTypes,
    get_next_stage,
)
from agent_graph.constants import JOIN_CALL_MESSAGE
from agent_graph.types import Signal, Step
from langchain_core.messages import AnyMessage, HumanMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph, add_messages
from pydantic.v1 import BaseModel, Field


class AgentState(BaseModel):
    """State of the agent."""

    messages: Annotated[List[AnyMessage], add_messages] = Field(
        default_factory=list,
        description="Messages to be sent to the model",
    )

    initialized: bool = Field(
        default=False,
        description="Whether the agent is initialized",
    )

    event: str | None = Field(
        default=None,
        description="Event triggered by the user",
    )

    trigger: bool = Field(
        default=False,
        description="Whether the agent should be triggered",
    )

    current_stage: StageTypes = Field(
        default=StageTypes.INTRO,
        description="Current stage of the agent",
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


class AgentConfig(BaseModel):
    """Config for the agent."""

    session_id: str = Field(default="")

    model_name: str = Field(default="gpt-4o")

    temperature: float = Field(default=0.9)


# --------------------- agent graph nodes --------------------- #
async def init_state(_: AgentState):
    messages = [HumanMessage(content=JOIN_CALL_MESSAGE)]
    stages = [StageTypes.INTRO, StageTypes.CODING, StageTypes.EVAL]

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
        steps=steps,
        signals=signals,
        completed_steps=completed_steps,
        caught_signals=caught_signals,
    )


async def on_event(state: AgentState):
    trigger: bool = False

    if state.event == "user_message":
        trigger = True

    return dict(trigger=trigger, event=None)


async def on_trigger(state: AgentState):
    # TODO: process and update state
    # e.g. update step status, etc.
    return None


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
            path_map=[StageTypes.INTRO, END],
        )
        .add_edge(StageTypes.INTRO, "stage_tracker")
        .add_edge("stage_tracker", "decide_next_stage")
        .add_edge("decide_next_stage", END)
    )


def create_compiled_graph():
    return create_graph().compile(checkpointer=MemorySaver())


graph = create_compiled_graph()
