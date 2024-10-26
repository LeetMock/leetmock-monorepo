from collections import defaultdict
from enum import Enum
from typing import Annotated, Dict, List, Set

from agent_graph.code_mock_staged_v1.constants import (
    CODING_OBSERVATIONS,
    CODING_TASKS,
    EVAL_OBSERVATIONS,
    EVAL_TASKS,
    INTRO_OBSERVATIONS,
    INTRO_TASKS,
    StageTypes,
    get_next_stage,
)
from agent_graph.constants import JOIN_CALL_MESSAGE
from agent_graph.types import Observation, Task
from agent_graph.utils import AgentPromptTemplates
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

    tasks: Dict[StageTypes, List[Task]] = Field(
        default=lambda: defaultdict(list),
        description="Tasks for the agent",
    )

    observations: Dict[StageTypes, List[Observation]] = Field(
        default=lambda: defaultdict(list),
        description="Observations for the agent",
    )

    completed_tasks: Dict[StageTypes, Set[str]] = Field(
        default=lambda: defaultdict(set),
        description="Completed tasks for the agent",
    )

    caught_observations: Dict[StageTypes, Set[str]] = Field(
        default=lambda: defaultdict(set),
        description="Caught observations for the agent",
    )


class AgentConfig(BaseModel):
    """Config for the agent."""

    session_id: str = Field(default="")

    model_name: str = Field(default="gpt-4o")

    temperature: float = Field(default=0.9)


# --------------------- agent graph nodes --------------------- #
async def init_state(state: AgentState):
    messages = [HumanMessage(content=JOIN_CALL_MESSAGE)]

    tasks = {
        StageTypes.INTRO: INTRO_TASKS,
        StageTypes.CODING: CODING_TASKS,
        StageTypes.EVAL: EVAL_TASKS,
    }

    return dict(initialized=True, messages=messages, tasks=tasks)


async def on_event(state: AgentState):
    trigger: bool = False

    if state.event == "user_message":
        trigger = True

    return dict(trigger=trigger, event=None)


async def on_trigger(state: AgentState):
    # TODO: process and update state
    # e.g. update task status, etc.
    return None


# call LLM to see if there are any tasks completed in the current stage
async def track_stage_tasks(state: AgentState):
    return None


async def track_stage_observations(state: AgentState):
    return None


async def decide_next_stage(state: AgentState):
    stage_tasks = state.tasks[state.current_stage]
    required_task_names = set(task.name for task in stage_tasks if task.required)
    completed_task_names = state.completed_tasks[state.current_stage]

    completed_stage_tasks = len(required_task_names - completed_task_names) == 0
    next_stage = (
        get_next_stage(state.current_stage)
        if completed_stage_tasks
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
        .add_node("stage_1", create_stage_subgraph())
        .add_node("stage_2", create_stage_subgraph())
        .add_node("stage_3", create_stage_subgraph())
        .add_node("track_stage_tasks", track_stage_tasks)
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
        .add_edge("stage_1", "track_stage_tasks")
        .add_edge("stage_2", "track_stage_tasks")
        .add_edge("stage_3", "track_stage_tasks")
        .add_edge("track_stage_tasks", END)
        .compile(checkpointer=MemorySaver())
    )


graph = create_graph()
