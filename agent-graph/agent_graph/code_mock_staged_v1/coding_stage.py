from collections import defaultdict
from typing import Annotated, Dict, List, cast

from agent_graph.code_mock_staged_v1.constants import (
    AgentTags,
    Signal,
    StageTypes,
    Step,
)
from agent_graph.code_mock_staged_v1.prompts import INTRO_PROMPT
from agent_graph.llms import get_model
from agent_graph.utils import custom_data
from langchain_core.messages import AIMessage, AnyMessage
from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
)
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph, add_messages
from langgraph.types import StreamWriter
from pydantic.v1 import BaseModel, Field


class CodingStageState(BaseModel):
    """State for the coding stage of the agent."""

    messages: Annotated[List[AnyMessage], add_messages]

    steps: Dict[StageTypes, List[Step]] = Field(
        default_factory=lambda: defaultdict(list)
    )

    signals: Dict[StageTypes, List[Signal]] = Field(
        default_factory=lambda: defaultdict(list)
    )


# --------------------- stage subgraph nodes --------------------- #
async def assistant(state: CodingStageState, writer: StreamWriter):
    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(
                INTRO_PROMPT, template_format="jinja2"
            ),
            MessagesPlaceholder(variable_name="messages"),
        ]
    )

    chain = prompt | get_model("gpt-4o-mini").bind(
        stop=["SILENT", "<thinking>"]
    ).with_config({"tags": [AgentTags.INTRO_LLM]})

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


def create_graph():
    return (
        StateGraph(CodingStageState)
        # nodes
        .add_node("assistant", assistant)  # type: ignore
        # edges
        .add_edge(START, "assistant").add_edge("assistant", END)
    )


def create_compiled_graph():
    return create_graph().compile(checkpointer=MemorySaver())


stage_subgraph = create_compiled_graph()
