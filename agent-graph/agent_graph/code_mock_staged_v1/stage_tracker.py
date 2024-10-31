from typing import Annotated, Dict, List, cast

from agent_graph.code_mock_staged_v1.constants import StageTypes
from agent_graph.code_mock_staged_v1.prompts import (
    SIGNAL_TRACKING_PROMPT,
    STEP_TRACKING_PROMPT,
)
from agent_graph.code_mock_staged_v1.schemas import TrackSignals, TrackSteps
from agent_graph.llms import get_model
from agent_graph.types import Signal, Step
from langchain_core.messages import AnyMessage
from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
)
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph, add_messages
from pydantic.v1 import BaseModel


class StageTrackerState(BaseModel):
    """State for the stage tracker of the agent."""

    messages: Annotated[List[AnyMessage], add_messages]

    current_stage: StageTypes

    steps: Dict[StageTypes, List[Step]]

    signals: Dict[StageTypes, List[Signal]]

    completed_steps: Dict[StageTypes, List[str]]

    caught_signals: Dict[StageTypes, List[str]]


# --------------------- stage subgraph nodes --------------------- #
# Call LLM to see if there are any steps completed in the current stage
async def track_stage_steps(state: StageTrackerState):
    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(
                STEP_TRACKING_PROMPT, template_format="jinja2"
            ),
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
async def track_stage_signals(state: StageTrackerState):
    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(
                SIGNAL_TRACKING_PROMPT, template_format="jinja2"
            ),
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


def create_graph():
    return (
        StateGraph(StageTrackerState)
        # nodes
        .add_node("track_stage_steps", track_stage_steps)
        .add_node("track_stage_signals", track_stage_signals)
        # edges
        .add_edge(START, "track_stage_steps")
        .add_edge(START, "track_stage_signals")
        .add_edge("track_stage_steps", END)
        .add_edge("track_stage_signals", END)
        .compile(checkpointer=MemorySaver())
    )


stage_subgraph = create_graph()
