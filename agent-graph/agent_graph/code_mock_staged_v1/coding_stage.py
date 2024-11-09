import time
from collections import defaultdict
from typing import Annotated, Dict, List, Literal, cast

from agent_graph.code_mock_staged_v1.constants import (
    AgentConfig,
    Signal,
    StageTypes,
    Step,
    format_test_code_correctness_notification_messages,
)
from agent_graph.code_mock_staged_v1.prompts import CODING_PROMPT
from agent_graph.llms import get_model
from agent_graph.prompts import format_test_context
from agent_graph.utils import custom_data, get_configurable
from langchain_core.messages import AIMessage, AnyMessage, HumanMessage
from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
)
from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph, add_messages
from langgraph.types import StreamWriter
from pydantic.v1 import BaseModel, Field

from libs.convex.api import ConvexApi
from libs.convex.convex_requests import create_test_code_correctness_request
from libs.convex.convex_types import CodeSessionState, SessionMetadata


class CodingStageState(BaseModel):
    """State for the coding stage of the agent."""

    messages: Annotated[List[AnyMessage], add_messages]

    steps: Dict[StageTypes, List[Step]] = Field(
        default_factory=lambda: defaultdict(list)
    )

    signals: Dict[StageTypes, List[Signal]] = Field(
        default_factory=lambda: defaultdict(list)
    )

    completed_steps: Dict[StageTypes, List[str]] = Field(
        default_factory=lambda: defaultdict(list),
    )

    session_state: CodeSessionState = Field(default=None)

    session_metadata: SessionMetadata = Field(default=None)


async def test_code_correctness(state: CodingStageState, config: RunnableConfig):
    agent_config = get_configurable(AgentConfig, config)
    question_id = state.session_metadata.question_id
    request = create_test_code_correctness_request(
        language="python",
        code=state.session_state.editor.content,
        question_id=question_id,
    )

    try:
        api = ConvexApi(convex_url=agent_config.convex_url)
        response = api.action.api_run_actions_run_tests_post(request)
        assert response.value is not None
        result = response.value["testResults"]
    except Exception:
        return None

    test_context = format_test_context(result)
    messages = format_test_code_correctness_notification_messages(test_context)
    return dict(messages=messages)


async def interrupter(_: CodingStageState):
    typing_aware_interupter_message = f"(User just spoke, but user is still typing on coding editor. You only need to response if user is asking you a question or to do something explicitly.)"
    return dict(messages=[HumanMessage(content=typing_aware_interupter_message)])


# --------------------- stage subgraph nodes --------------------- #
async def assistant(state: CodingStageState, writer: StreamWriter):
    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(
                CODING_PROMPT, template_format="jinja2"
            ),
            MessagesPlaceholder(variable_name="messages"),
        ]
    )

    chain = prompt | get_model("gpt-4o").bind(stop=["SILENT", "<thinking>"])

    content = ""
    async for chunk in chain.astream(
        {
            "messages": state.messages,
            "steps": state.steps[StageTypes.INTRO],
            "signals": state.signals[StageTypes.INTRO],
        }
    ):
        content += cast(str, chunk.content)
        writer(custom_data("assistant", chunk.content))

    # If the assistant doesn't say anything, we should return a SILENT message
    if len(content.strip()) == 0:
        return dict(messages=[AIMessage(content="SILENT")])

    return None


# --------------------- stage subgraph edges --------------------- #
async def decide_pre_generation_action(
    state: CodingStageState,
) -> List[Literal["assistant", "test_code_correctness", "interrupter"]]:
    edges = []
    time_diff = int(time.time() - state.session_state.editor.last_updated / 1000)

    if time_diff < 2:
        edges.append("interrupter")

    if "prompt_explain_code" in state.completed_steps[StageTypes.CODING]:
        edges.append("test_code_correctness")

    if len(edges) == 0:
        edges.append("assistant")

    return edges


def create_graph():
    return (
        StateGraph(CodingStageState, AgentConfig)
        # nodes
        .add_node("test_code_correctness", test_code_correctness)
        .add_node("interrupter", interrupter)
        .add_node("assistant", assistant)  # type: ignore
        # edges
        .add_conditional_edges(
            source=START,
            path=decide_pre_generation_action,
            path_map=["assistant", "test_code_correctness", "interrupter"],
        )
        .add_edge("test_code_correctness", "assistant")
        .add_edge("interrupter", "assistant")
        .add_edge("assistant", END)
    )


def create_compiled_graph():
    return create_graph().compile(checkpointer=MemorySaver())


stage_subgraph = create_compiled_graph()
