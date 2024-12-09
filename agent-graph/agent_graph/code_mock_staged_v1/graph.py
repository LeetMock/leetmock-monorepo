from collections import defaultdict
from typing import List, OrderedDict, Set, cast

from agent_graph.code_mock_staged_v1.constants import (
    AgentConfig,
    StageTypes,
    format_content_changed_notification_messages,
    format_stage_transition_messages,
    format_testcase_changed_notification_messages,
    format_user_testcase_executed_notification_messages,
    get_next_stage,
    get_step_map,
)
from agent_graph.code_mock_staged_v1.subgraphs import (
    intro_stage,
    coding_stage,
    background_stage,
    eval_stage,
)
from agent_graph.event_descriptors import EVENT_DESCRIPTORS, EventDescriptor
from agent_graph.prompts import JOIN_CALL_MESSAGE, RECONNECT_MESSAGE
from agent_graph.types import EventMessageState, Step
from agent_graph.utils import get_configurable, with_event_reset, with_trigger_reset
from langchain_core.messages import HumanMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from pydantic.v1 import Field
from langchain_core.runnables import RunnableConfig
from libs.convex.convex_types import (
    CodeSessionContentChangedEvent,
    CodeSessionTestcaseChangedEvent,
    CodeSessionUserTestcaseExecutedEvent,
)
from libs.types import MessageWrapper


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

    events: List[EventDescriptor] = Field(
        default_factory=list,
        description="Event descriptors for the agent",
    )

    steps: OrderedDict[StageTypes, List[Step]] = Field(
        default_factory=lambda: defaultdict(list),
        description="Steps for the agent",
    )

    completed_steps: Set[str] = Field(
        default_factory=set,
        description="Completed steps for the agent",
    )

    test_context: str | None = Field(
        default=None,
        description="Test context for the agent",
    )


# --------------------- agent graph nodes --------------------- #
async def init_state(_: AgentState):
    return dict(
        initialized=True,
        current_stage_idx=0,
        messages=[HumanMessage(content=JOIN_CALL_MESSAGE)],
        events=EVENT_DESCRIPTORS,
        steps=get_step_map(),
        completed_steps=set(),
    )


async def on_event(
    state: AgentState,
):
    if state.event == "trigger":
        messages = (
            [HumanMessage(content=RECONNECT_MESSAGE)] if len(state.messages) > 5 else []
        )
        return with_event_reset(trigger=True, messages=messages)

    if state.event == "step_tracking":
        step_name = cast(str, state.event_data)
        state.completed_steps.add(step_name)
        return with_event_reset(trigger=False, completed_steps=state.completed_steps)

    if state.event == "user_message":
        messages = cast(MessageWrapper, state.event_data).messages
        return with_event_reset(trigger=True, messages=messages)

    if state.event == "add_user_message":
        messages = cast(List, state.event_data)
        print("add_user_message", messages)
        return with_event_reset(trigger=True, messages=messages)

    if state.event == "add_ai_message":
        messages = cast(List, state.event_data)
        return with_event_reset(trigger=False, messages=messages)

    if state.event == "reminder":
        messages = HumanMessage(
            content="(Now the user has been silent in a while, ask them if they are doing well.)"
        )
        return with_event_reset(trigger=True, messages=messages)

    if state.event == "testcase_changed":
        event_data = cast(CodeSessionTestcaseChangedEvent, state.event_data)  # type: ignore
        messages = format_testcase_changed_notification_messages(event_data)
        return with_event_reset(trigger=False, messages=messages)

    if state.event == "user_testcase_executed":
        event_data = cast(CodeSessionUserTestcaseExecutedEvent, state.event_data)  # type: ignore
        messages = format_user_testcase_executed_notification_messages(event_data)
        return with_event_reset(trigger=False, messages=messages)

    if state.event == "content_changed":
        event_data = cast(CodeSessionContentChangedEvent, state.event_data)  # type: ignore
        messages = format_content_changed_notification_messages(event_data)
        return with_event_reset(trigger=False, messages=messages)

    return with_event_reset(trigger=False)


async def on_trigger(state: AgentState):
    # Router node that redirect to the correct stage
    return with_trigger_reset()


async def decide_next_stage(state: AgentState, config: RunnableConfig):
    agent_config = get_configurable(AgentConfig, config)

    if state.current_stage_idx >= len(agent_config.stages):
        return dict(trigger=False)

    stages = agent_config.stages
    current_stage = stages[state.current_stage_idx]

    # Check if all steps in the current stage are completed
    stage_steps = set([step.name for step in state.steps[current_stage]])
    completed_stage_steps = len(stage_steps - state.completed_steps) == 0

    # If not all steps are completed, stay in the current stage
    if not completed_stage_steps:
        return dict(trigger=False)

    # Move to the next stage
    next_stage = (
        stages[state.current_stage_idx + 1]
        if state.current_stage_idx + 1 < len(stages)
        else StageTypes.END
    )

    # Format the stage transition messages
    messages = (
        format_stage_transition_messages(next_stage)
        if current_stage != next_stage
        else []
    )

    return dict(current_stage=next_stage, trigger=False, messages=messages)


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


async def select_stage(state: AgentState, config: RunnableConfig):
    agent_config = get_configurable(AgentConfig, config)
    if state.current_stage_idx == len(agent_config.stages):
        return END
    return agent_config.stages[state.current_stage_idx]


def create_graph():
    return (
        StateGraph(AgentState, AgentConfig)
        # nodes
        .add_node("init_state", init_state)
        .add_node("on_event", on_event)
        .add_node("on_trigger", on_trigger)
        .add_node("decide_next_stage", decide_next_stage)
        .add_node(StageTypes.INTRO, intro_stage.create_compiled_graph())
        .add_node(StageTypes.BACKGROUND, background_stage.create_compiled_graph())
        .add_node(StageTypes.CODING, coding_stage.create_compiled_graph())
        .add_node(StageTypes.EVAL, eval_stage.create_compiled_graph())
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
            path_map=[
                StageTypes.INTRO,
                StageTypes.BACKGROUND,
                StageTypes.CODING,
                StageTypes.EVAL,
                END,
            ],
        )
        .add_edge(StageTypes.INTRO, "decide_next_stage")
        .add_edge(StageTypes.BACKGROUND, "decide_next_stage")
        .add_edge(StageTypes.CODING, "decide_next_stage")
        .add_edge(StageTypes.EVAL, "decide_next_stage")
        .add_edge("decide_next_stage", END)
    )


def create_compiled_graph():
    return create_graph().compile(checkpointer=MemorySaver())


graph = create_compiled_graph()
