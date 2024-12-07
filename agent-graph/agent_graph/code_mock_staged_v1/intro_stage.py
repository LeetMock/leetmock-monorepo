from typing import List, OrderedDict, cast

from agent_graph.code_mock_staged_v1.constants import (
    AgentConfig,
    Signal,
    StageTypes,
    Step,
)
from agent_graph.code_mock_staged_v1.prompts import INTRO_PROMPT
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


class IntroStageState(EventMessageState):
    """State for the intro stage of the agent."""

    steps: OrderedDict[StageTypes, List[Step]] = Field(
        default_factory=lambda: OrderedDict()
    )


# --------------------- stage subgraph nodes --------------------- #
async def assistant(
    state: IntroStageState, config: RunnableConfig, writer: StreamWriter
):
    agent_config = get_configurable(AgentConfig, config)
    print(agent_config)

    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(
                INTRO_PROMPT, template_format="jinja2"
            ),
            MessagesPlaceholder(variable_name="messages"),
        ]
    )

    chain = prompt | get_model(
        model_name=agent_config.fast_model,
        temperature=agent_config.temperature,
    ).bind(stop=["SILENT", "<thinking>"])

    content = ""
    async for chunk in chain.astream(
        {
            "messages": state.messages,
            "steps": state.steps[StageTypes.BACKGROUND],
        }
    ):
        content += cast(str, chunk.content)
        writer(custom_data("assistant", chunk.content))

    # If the assistant doesn't say anything, we should return a SILENT message
    if len(content.strip()) == 0:
        return dict(messages=[AIMessage(content="SILENT")])

    return None


def create_graph():
    return (
        StateGraph(IntroStageState, AgentConfig)
        # nodes
        .add_node("assistant", assistant)  # type: ignore
        # edges
        .add_edge(START, "assistant").add_edge("assistant", END)
    )


def create_compiled_graph():
    return create_graph().compile(checkpointer=MemorySaver())


stage_subgraph = create_compiled_graph()
