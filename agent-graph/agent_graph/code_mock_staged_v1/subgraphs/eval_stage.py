from lib2to3.pytree import HUGE
from typing import Annotated, List, OrderedDict, cast

from agent_graph.code_mock_staged_v1.constants import (
    AgentConfig,
    StageTypes,
    Step,
    format_end_of_session_thought_messages,
    get_stage_confirmation_tool_call_state_patch,
)
from agent_graph.code_mock_staged_v1.prompts import EVAL_FEEDBACK_PROMPT
from agent_graph.code_mock_staged_v1.schemas import ConfirmEndOfInterview
from agent_graph.llms import get_model
from agent_graph.reducers import merge_unique
from agent_graph.types import EventMessageState
from agent_graph.utils import custom_data, get_configurable
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
)
from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import StreamWriter
from pydantic import Field


class EvalStageState(EventMessageState):
    """State for the intro stage of the agent."""

    completed_steps: Annotated[List[str], merge_unique] = Field(default_factory=list)

    steps: OrderedDict[StageTypes, List[Step]] = Field(
        default_factory=lambda: OrderedDict()
    )

    current_stage_idx: int = Field(default=0)

    tool_call_detected: bool = Field(default=False)

    round_until_next_confirmation: int = Field(
        default=0, description="Round until next confirmation"
    )

    num_messages_before_eval: int = Field(
        default=1000000, description="Number of messages so far"
    )


async def update_num_messages_so_far(state: EvalStageState):
    num_messages_before_eval = min(
        state.num_messages_before_eval,
        len(state.messages),
    )

    return dict(num_messages_before_eval=num_messages_before_eval)


# --------------------- stage subgraph nodes --------------------- #
async def assistant(
    state: EvalStageState, config: RunnableConfig, writer: StreamWriter
):
    agent_config = get_configurable(AgentConfig, config)
    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(
                EVAL_FEEDBACK_PROMPT, template_format="jinja2"
            ),
            MessagesPlaceholder(variable_name="messages"),
        ]
    )

    llm = get_model(
        model_name=agent_config.fast_model,
        temperature=agent_config.temperature,
    )

    chain = prompt | llm.bind(stop=["SILENT", "<thinking>"])

    content = ""
    async for chunk in chain.astream(
        {
            "messages": state.messages,
            "steps": state.steps[StageTypes.EVAL],
        }
    ):
        content += cast(str, chunk.content)
        writer(custom_data("assistant", chunk.content))

    # If the assistant doesn't say anything, we should return a SILENT message
    if len(content.strip()) == 0:
        return dict(messages=[AIMessage(content="SILENT")])

    return None


async def check_end_of_session(state: EvalStageState, config: RunnableConfig):
    agent_config = get_configurable(AgentConfig, config)
    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(
                EVAL_FEEDBACK_PROMPT, template_format="jinja2"
            ),
            MessagesPlaceholder(variable_name="messages"),
            MessagesPlaceholder(variable_name="thought"),
        ]
    )

    llm = get_model(
        model_name=agent_config.smart_model,
        temperature=0.1,
    )

    chain = prompt | llm.with_structured_output(ConfirmEndOfInterview)

    messages = [
        HumanMessage(
            content="(Below are the most recent conversations; earlier conversations are omitted.)"
        ),
        *state.messages[state.num_messages_before_eval - 3 :],
    ]

    result = await chain.ainvoke(
        {
            "messages": messages,
            "steps": state.steps[StageTypes.EVAL],
            "thought": format_end_of_session_thought_messages(),
        }
    )
    result = cast(ConfirmEndOfInterview, result)

    if result.should_end:
        return get_stage_confirmation_tool_call_state_patch(
            StageTypes.EVAL, "confirm_end_of_interview", state
        )

    return None


def create_graph():
    return (
        StateGraph(EvalStageState, AgentConfig)
        # nodes
        .add_node("assistant", assistant)  # type: ignore
        .add_node("check_end_of_session", check_end_of_session)  # type: ignore
        # edges
        .add_edge(START, "assistant")
        .add_edge("assistant", "check_end_of_session")
        .add_edge("check_end_of_session", END)
    )


def create_compiled_graph():
    return create_graph().compile(checkpointer=MemorySaver())


stage_subgraph = create_compiled_graph()
