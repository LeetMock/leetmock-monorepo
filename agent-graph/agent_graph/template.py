from enum import Enum
from typing import Annotated, List, Literal

from agent_graph.constants import JOIN_CALL_MESSAGE
from agent_graph.llms import get_model
from langchain_core.messages import AnyMessage, HumanMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph, add_messages
from pydantic.v1 import BaseModel, Field


class Stages(str, Enum):
    BACKGROUND = "background"
    CODING = "coding"
    EVAL = "eval"
    END = END


class AgentState(BaseModel):
    """State of the agent."""

    messages: Annotated[List[AnyMessage], add_messages] = Field(default_factory=list)

    initialized: bool = Field(default=False)

    event: str | None = Field(default=None)

    trigger: bool = Field(default=False)


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
    return dict(trigger=False)


async def stage_runner(state: AgentState):
    # Example stage workflow
    llm = get_model("gpt-4o-mini")
    result = await llm.ainvoke(state.messages)

    return dict(messages=[result])


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


def create_graph():
    graph_builder = (
        StateGraph(AgentState)
        # nodes
        .add_node("init_state", init_state)
        .add_node("on_event", on_event)
        .add_node("on_trigger", on_trigger)
        .add_node("stage_runner", stage_runner)
        # edges
        .add_conditional_edges(
            START, decide_entry_point, ["init_state", "on_event", "on_trigger", END]
        )
        .add_conditional_edges("init_state", should_trigger_event, ["on_event", END])
        .add_edge("on_event", END)
        .add_edge("on_trigger", "stage_runner")
        .add_edge("stage_runner", END)
        .compile(checkpointer=MemorySaver())
    )

    return graph_builder


graph = create_graph()
