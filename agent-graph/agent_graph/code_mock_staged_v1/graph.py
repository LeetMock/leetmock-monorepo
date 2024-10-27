from collections import defaultdict
from typing import Annotated, Dict, List, Set, cast

from agent_graph.code_mock_staged_v1 import intro_stage
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
from agent_graph.code_mock_staged_v1.prompts import (
    INTRO_PROMPT,
    SIGNAL_TRACKING_PROMPT,
    STEP_TRACKING_PROMPT,
)
from agent_graph.code_mock_staged_v1.schemas import TrackSignals, TrackSteps
from agent_graph.constants import JOIN_CALL_MESSAGE
from agent_graph.llms import get_model
from agent_graph.types import Signal, Step
from agent_graph.utils import AgentPromptTemplates
from langchain_core.messages import AnyMessage, HumanMessage
from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
)
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
        default=lambda: defaultdict(list),
        description="Steps for the agent",
    )

    signals: Dict[StageTypes, List[Signal]] = Field(
        default=lambda: defaultdict(list),
        description="Signals for the agent",
    )

    completed_steps: Dict[StageTypes, List[str]] = Field(
        default=lambda: defaultdict(list),
        description="Completed steps for the agent",
    )

    caught_signals: Dict[StageTypes, List[str]] = Field(
        default=lambda: defaultdict(list),
        description="Caught signals for the agent",
    )


class AgentConfig(BaseModel):
    """Config for the agent."""

    session_id: str = Field(default="")

    model_name: str = Field(default="gpt-4o")

    temperature: float = Field(default=0.9)


# --------------------- agent graph nodes --------------------- #
async def init_state(state: AgentState):
    messages = [HumanMessage(content=JOIN_CALL_MESSAGE)]

    steps = {
        StageTypes.INTRO: INTRO_STEPS,
        StageTypes.CODING: CODING_STEPS,
        StageTypes.EVAL: EVAL_STEPS,
    }

    return dict(initialized=True, messages=messages, steps=steps)


async def on_event(state: AgentState):
    trigger: bool = False

    if state.event == "user_message":
        trigger = True

    return dict(trigger=trigger, event=None)


async def on_trigger(state: AgentState):
    # TODO: process and update state
    # e.g. update step status, etc.
    return None


# Call LLM to see if there are any steps completed in the current stage
async def track_stage_steps(state: AgentState):
    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(STEP_TRACKING_PROMPT),
            MessagesPlaceholder(variable_name="messages"),
        ]
    )
    llm = get_model("gpt-4o", temperature=0.1)
    structured_llm = llm.with_structured_output(TrackSteps)

    chain = prompt | structured_llm
    result = cast(
        TrackSteps,
        await chain.ainvoke(
            {
                "messages": state.messages,
                "steps": state.steps[state.current_stage],
                "completed_steps": state.completed_steps[state.current_stage],
            }
        ),
    )

    valid_step_names = {step.name for step in state.steps[state.current_stage]}
    new_completed_steps = [
        s
        for s in result.steps
        if s in valid_step_names and s not in state.completed_steps[state.current_stage]
    ]
    for s in new_completed_steps:
        state.completed_steps[state.current_stage].append(s)

    return dict(completed_steps=state.completed_steps)


# Call LLM to see if there are any signals caught in the current stage
async def track_stage_signals(state: AgentState):
    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(SIGNAL_TRACKING_PROMPT),
            MessagesPlaceholder(variable_name="messages"),
        ]
    )
    llm = get_model("gpt-4o", temperature=0.1)
    structured_llm = llm.with_structured_output(TrackSignals)

    chain = prompt | structured_llm
    result = cast(
        TrackSignals,
        await chain.ainvoke(
            {
                "messages": state.messages,
                "signals": state.signals[state.current_stage],
                "caught_signals": state.caught_signals[state.current_stage],
            }
        ),
    )

    valid_signal_names = {signal.name for signal in state.signals[state.current_stage]}
    new_caught_signals = [
        s
        for s in result.signals
        if s in valid_signal_names
        and s not in state.caught_signals[state.current_stage]
    ]
    for s in new_caught_signals:
        state.caught_signals[state.current_stage].append(s)

    return dict(caught_signals=state.caught_signals)


async def decide_next_stage(state: AgentState):
    stage_steps = state.steps[state.current_stage]
    required_step_names = set(step.name for step in stage_steps if step.required)
    completed_step_names = state.completed_steps[state.current_stage]

    completed_stage_steps = len(required_step_names - set(completed_step_names)) == 0
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
    return state.current_stage


def create_graph():
    return (
        StateGraph(AgentState, AgentConfig)
        # nodes
        .add_node("init_state", init_state)
        .add_node("on_event", on_event)
        .add_node("on_trigger", on_trigger)
        .add_node("intro_stage", intro_stage.create_graph())
        .add_node("track_stage_steps", track_stage_steps)
        .add_node("track_stage_signals", track_stage_signals)
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
            path_map=["intro_stage", END],
        )
        .add_edge("intro_stage", "track_stage_steps")
        .add_edge("intro_stage", "track_stage_signals")
        .add_edge("track_stage_steps", END)
        .add_edge("track_stage_signals", END)
        .compile(checkpointer=MemorySaver())
    )


graph = create_graph()
