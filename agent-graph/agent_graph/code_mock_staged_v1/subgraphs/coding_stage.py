import logging
import time
from typing import List, Literal, OrderedDict, Set, cast

from agent_graph.code_mock_staged_v1.constants import (
    AgentConfig,
    StageTypes,
    Step,
    get_stage_confirmation_tool_call_state_patch,
)
from agent_graph.code_mock_staged_v1.prompts import (
    CODING_CONTEXT_SUFFIX_PROMPT,
    CODING_PROMPT,
)
from agent_graph.code_mock_staged_v1.schemas import ConfirmStageCompletion
from agent_graph.event_descriptors import EventDescriptor
from agent_graph.llms import get_model
from agent_graph.types import EventMessageState
from agent_graph.utils import custom_data, get_configurable
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
)
from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import StreamWriter
from pydantic import Field

from libs.convex.convex_types import CodeSessionState, SessionMetadata

logger = logging.getLogger(__name__)

from typing import Annotated

from agent_graph.reducers import merge_unique


class CodingStageState(EventMessageState):
    """State for the coding stage of the agent."""

    events: List[EventDescriptor] = Field(default_factory=list)

    steps: OrderedDict[StageTypes, List[Step]] = Field(
        default_factory=lambda: OrderedDict()
    )

    completed_steps: Annotated[List[str], merge_unique] = Field(default_factory=list)

    test_context: str | None = Field(
        default=None,
    )

    current_stage_idx: int = Field(default=0)

    tool_call_detected: bool = Field(default=False)

    round_until_next_confirmation: int = Field(
        default=0, description="Round until next confirmation"
    )


async def interrupter(_: CodingStageState):
    typing_aware_interupter_message = f"(User just spoke, but user is still typing on coding editor. You only need to response if user is asking you a question or to do something explicitly.)"
    return dict(messages=[HumanMessage(content=typing_aware_interupter_message)])


# --------------------- stage subgraph nodes --------------------- #
async def assistant(
    state: CodingStageState, config: RunnableConfig, writer: StreamWriter
):
    agent_config = get_configurable(AgentConfig, config)

    messages = state.messages
    last_human_message_idx = -1

    # Find the last human message idx
    for idx in reversed(range(len(messages))):
        if messages[idx].type == "human":
            last_human_message_idx = idx
            break

    # Split the messages into history and upcoming messages
    # This action is necessary because we do not want to put coding context suffix at the very end of the prompt
    # because model will attend to the code context more often and less care about the last human message
    history_messages = messages[:last_human_message_idx]
    upcoming_messages = messages[last_human_message_idx:]

    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(
                CODING_PROMPT, template_format="jinja2"
            ),
            MessagesPlaceholder(variable_name="history_messages"),
            HumanMessagePromptTemplate.from_template(
                CODING_CONTEXT_SUFFIX_PROMPT, template_format="jinja2"
            ),
            MessagesPlaceholder(variable_name="upcoming_messages"),
        ]
    )

    llm = get_model(
        model_name=agent_config.smart_model,
        temperature=agent_config.temperature,
    )

    if (
        agent_config.transition_confirmation_enabled
        and state.round_until_next_confirmation == 0
    ):
        llm = llm.bind_tools([ConfirmStageCompletion])

    chain = prompt | llm.bind(stop=["SILENT", "<thinking>"])

    content = ""
    session_state = CodeSessionState(**state.session_state)
    session_metadata = SessionMetadata(**state.session_metadata)
    coding_steps = set(map(lambda step: step.name, state.steps[StageTypes.CODING]))

    tool_call_detected = False
    function_name = ""
    async for chunk in chain.astream(
        {
            "events": state.events,
            "steps": state.steps[StageTypes.CODING],
            "completed_steps": set(state.completed_steps).intersection(coding_steps),
            "content": session_state.editor.content,
            "language": session_state.editor.language,
            "question": session_metadata.question_content,
            "test_context": state.test_context,
            "history_messages": history_messages,
            "upcoming_messages": upcoming_messages,
        }
    ):
        if "tool_calls" in chunk.additional_kwargs:
            tool_call_detected = True
            function_name = chunk.additional_kwargs["tool_calls"][0]["function"]["name"]
            break
        else:
            content += cast(str, chunk.content)
            writer(custom_data("assistant", chunk.content))

    if tool_call_detected:
        return get_stage_confirmation_tool_call_state_patch(
            StageTypes.CODING, function_name, state
        )

    # If the assistant doesn't say anything, we should return a SILENT message
    if len(content.strip()) == 0:
        return dict(messages=[AIMessage(content="SILENT")])

    return dict(test_context=None)


# --------------------- stage subgraph edges --------------------- #
async def decide_pre_generation_activities(
    state: CodingStageState,
) -> List[Literal["assistant", "interrupter"]]:
    edges = []
    time_diff = int(
        time.time() - CodeSessionState(**state.session_state).editor.last_updated / 1000
    )

    # If the user has not typed for 2 seconds, add a message indicating that the user is typing
    if time_diff < 2:
        edges.append("interrupter")

    # If no other activities are needed, directly call the assistant
    if len(edges) == 0:
        edges.append("assistant")

    return edges


def create_graph():
    return (
        StateGraph(CodingStageState, AgentConfig)
        # nodes
        .add_node("interrupter", interrupter)
        .add_node("assistant", assistant)  # type: ignore
        # edges
        .add_conditional_edges(
            source=START,
            path=decide_pre_generation_activities,
            path_map=["assistant", "interrupter"],
        )
        .add_edge("interrupter", "assistant")
        .add_edge("assistant", END)
    )


def create_compiled_graph():
    return create_graph().compile(checkpointer=MemorySaver())


stage_subgraph = create_compiled_graph()
