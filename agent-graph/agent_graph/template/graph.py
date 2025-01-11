from typing import Annotated, List

from agent_graph.prompts import JOIN_CALL_MESSAGE
from agent_graph.template.stage_subgraph import (
    create_compiled_graph as create_stage_subgraph,
)
from langchain_core.messages import AnyMessage, HumanMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph, add_messages
from pydantic import BaseModel, Field


class AgentState(BaseModel):
    """State of the agent."""

    messages: Annotated[List[AnyMessage], add_messages] = Field(default_factory=list)

    initialized: bool = Field(default=False)

    event: str | None = Field(default=None)

    trigger: bool = Field(default=False)

    stage_idx: int = Field(default=0)


# --------------------- agent graph nodes --------------------- #
async def init_state(state: AgentState):
    # TODO: add logic to initialize the state
    # e.g. fetch initial tasks, config from Convex DB
    messages = [HumanMessage(content=JOIN_CALL_MESSAGE)]

    return dict(initialized=True, messages=messages)


async def on_event(state: AgentState):
    trigger: bool = False

    if state.event == "user_message":
        trigger = True

    return dict(trigger=trigger, event=None)


async def on_trigger(state: AgentState):
    # TODO: process and update state
    # e.g. update task status, etc.
    return None


async def on_stage_end(state: AgentState):
    return dict(trigger=False, stage_idx=state.stage_idx + 1)


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
    stages = ["stage_1", "stage_2", "stage_3"]
    return stages[state.stage_idx % len(stages)]


def create_graph():
    return (
        StateGraph(AgentState)
        # nodes
        .add_node("init_state", init_state)
        .add_node("on_event", on_event)
        .add_node("on_trigger", on_trigger)
        .add_node("stage_1", create_stage_subgraph())
        .add_node("stage_2", create_stage_subgraph())
        .add_node("stage_3", create_stage_subgraph())
        .add_node("on_stage_end", on_stage_end)
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
            path_map=["stage_1", "stage_2", "stage_3"],
        )
        .add_edge("stage_1", "on_stage_end")
        .add_edge("stage_2", "on_stage_end")
        .add_edge("stage_3", "on_stage_end")
        .add_edge("on_stage_end", END)
    )


def create_compiled_graph():
    return create_graph().compile(checkpointer=MemorySaver())


graph = create_compiled_graph()
