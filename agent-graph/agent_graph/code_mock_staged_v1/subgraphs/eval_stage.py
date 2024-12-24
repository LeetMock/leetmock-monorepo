from typing import List, OrderedDict, Set, cast

from agent_graph.code_mock_staged_v1.constants import (
    AgentConfig,
    StageTypes,
    Step,
    get_stage_confirmation_tool_call_state_patch,
)
from agent_graph.code_mock_staged_v1.prompts import EVAL_PROMPT
from agent_graph.code_mock_staged_v1.schemas import ConfirmStageCompletion
from agent_graph.llms import get_model
from agent_graph.types import EventMessageState
from agent_graph.utils import custom_data, get_configurable
from langchain_core.messages import AIMessage
from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
)
from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import StreamWriter
from pydantic.v1 import Field


class EvalStageState(EventMessageState):
    """State for the intro stage of the agent."""

    completed_steps: Set[str] = Field(default_factory=set)

    steps: OrderedDict[StageTypes, List[Step]] = Field(
        default_factory=lambda: OrderedDict()
    )

    current_stage_idx: int = Field(default=0)

    has_tool_call: bool = Field(default=False)


# --------------------- stage subgraph nodes --------------------- #
async def assistant(
    state: EvalStageState, config: RunnableConfig, writer: StreamWriter
):
    agent_config = get_configurable(AgentConfig, config)
    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(
                EVAL_PROMPT, template_format="jinja2"
            ),
            MessagesPlaceholder(variable_name="messages"),
        ]
    )

    llm = get_model(
        model_name=agent_config.fast_model,
        temperature=agent_config.temperature,
    )

    if agent_config.transition_confirmation_enabled:
        llm = llm.bind_tools([ConfirmStageCompletion])

    chain = prompt | llm.bind(stop=["SILENT", "<thinking>"])

    content = ""
    tool_call_detected = False
    async for chunk in chain.astream(
        {
            "messages": state.messages,
            "steps": state.steps[StageTypes.EVAL],
        }
    ):
        if "tool_calls" in chunk.additional_kwargs:
            tool_call_detected = True
            break
        else:
            content += cast(str, chunk.content)
            writer(custom_data("assistant", chunk.content))

    if tool_call_detected:
        return get_stage_confirmation_tool_call_state_patch(
            StageTypes.EVAL, chunk, state
        )

    # If the assistant doesn't say anything, we should return a SILENT message
    if len(content.strip()) == 0:
        return dict(messages=[AIMessage(content="SILENT")])

    return None


def create_graph():
    return (
        StateGraph(EvalStageState, AgentConfig)
        # nodes
        .add_node("assistant", assistant)  # type: ignore
        # edges
        .add_edge(START, "assistant").add_edge("assistant", END)
    )


def create_compiled_graph():
    return create_graph().compile(checkpointer=MemorySaver())


stage_subgraph = create_compiled_graph()
