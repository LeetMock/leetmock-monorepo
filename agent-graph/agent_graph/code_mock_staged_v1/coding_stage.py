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
from agent_graph.code_mock_staged_v1.prompts import (
    CODING_CONTEXT_SUFFIX_PROMPT,
    CODING_PROMPT,
)
from agent_graph.event_descriptors import EventDescriptor
from agent_graph.llms import get_model
from agent_graph.prompts import format_test_context
from agent_graph.types import EventMessageState
from agent_graph.utils import custom_data, get_configurable
from langchain_core.messages import AIMessage, AnyMessage, HumanMessage
from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
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


class CodingStageState(EventMessageState):
    """State for the coding stage of the agent."""

    events: List[EventDescriptor] = Field(default_factory=list)

    steps: Dict[StageTypes, List[Step]] = Field(
        default_factory=lambda: defaultdict(list)
    )

    signals: Dict[StageTypes, List[Signal]] = Field(
        default_factory=lambda: defaultdict(list)
    )

    completed_steps: Dict[StageTypes, List[str]] = Field(
        default_factory=lambda: defaultdict(list),
    )


async def test_code_correctness(state: CodingStageState, config: RunnableConfig):
    agent_config = get_configurable(AgentConfig, config)
    question_id = SessionMetadata(**state.session_metadata).question_id
    request = create_test_code_correctness_request(
        language="python",
        code=CodeSessionState(**state.session_state).editor.content,
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
            # Append the current code content to the prompt as a suffix to maximize the prefix caching
            HumanMessagePromptTemplate.from_template(
                CODING_CONTEXT_SUFFIX_PROMPT, template_format="jinja2"
            ),
        ]
    )

    chain = prompt | get_model("gpt-4o").bind(stop=["SILENT", "<thinking>"])

    content = ""
    session_state = CodeSessionState(**state.session_state)
    session_metadata = SessionMetadata(**state.session_metadata)
    async for chunk in chain.astream(
        {
            "events": state.events,
            "steps": state.steps[StageTypes.CODING],
            "completed_steps": state.completed_steps[StageTypes.CODING],
            "signals": state.signals[StageTypes.CODING],
            "messages": state.messages,
            "content": session_state.editor.content,
            "language": session_state.editor.language,
            "question": session_metadata.question_content,
        }
    ):
        content += cast(str, chunk.content)
        writer(custom_data("assistant", chunk.content))

    # If the assistant doesn't say anything, we should return a SILENT message
    if len(content.strip()) == 0:
        return dict(messages=[AIMessage(content="SILENT")])

    return None


# --------------------- stage subgraph edges --------------------- #
async def decide_pre_generation_activities(
    state: CodingStageState,
) -> List[Literal["assistant", "test_code_correctness", "interrupter"]]:
    edges = []
    time_diff = int(
        time.time() - CodeSessionState(**state.session_state).editor.last_updated / 1000
    )

    # If the user has not typed for 2 seconds, add a message indicating that the user is typing
    if time_diff < 2:
        edges.append("interrupter")

    # If the user has completed the prompt_explain_code step, start running ground truth tests
    if "prompt_explain_code" in state.completed_steps[StageTypes.CODING]:
        edges.append("test_code_correctness")

    # If no other activities are needed, directly call the assistant
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
            path=decide_pre_generation_activities,
            path_map=["assistant", "test_code_correctness", "interrupter"],
        )
        .add_edge("test_code_correctness", "assistant")
        .add_edge("interrupter", "assistant")
        .add_edge("assistant", END)
    )


def create_compiled_graph():
    return create_graph().compile(checkpointer=MemorySaver())


stage_subgraph = create_compiled_graph()
