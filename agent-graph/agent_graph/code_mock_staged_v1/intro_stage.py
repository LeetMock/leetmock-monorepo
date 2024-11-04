from collections import defaultdict
from typing import Annotated, Dict, List

from agent_graph.code_mock_staged_v1.constants import (
    AgentTags,
    Signal,
    StageTypes,
    Step,
)
from agent_graph.code_mock_staged_v1.prompts import INTRO_PROMPT
from agent_graph.llms import get_model
from langchain_core.messages import AnyMessage
from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
)
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph, add_messages
from pydantic.v1 import BaseModel, Field


class IntroStageState(BaseModel):
    """State for the intro stage of the agent."""

    messages: Annotated[List[AnyMessage], add_messages]

    steps: Dict[StageTypes, List[Step]] = Field(
        default_factory=lambda: defaultdict(list)
    )

    signals: Dict[StageTypes, List[Signal]] = Field(
        default_factory=lambda: defaultdict(list)
    )


# --------------------- stage subgraph nodes --------------------- #
async def assistant(state: IntroStageState):
    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(
                INTRO_PROMPT, template_format="jinja2"
            ),
            MessagesPlaceholder(variable_name="messages"),
        ]
    )

    chain = prompt | get_model("gpt-4o-mini").with_config(
        {"tags": [AgentTags.INTRO_LLM]}
    )

    result = await chain.ainvoke(
        {
            "messages": state.messages,
            "steps": state.steps[StageTypes.INTRO],
            "signals": state.signals[StageTypes.INTRO],
        }
    )

    return dict(messages=[result])


def create_graph():
    return (
        StateGraph(IntroStageState)
        # nodes
        .add_node("assistant", assistant)
        # edges
        .add_edge(START, "assistant").add_edge("assistant", END)
    )


def create_compiled_graph():
    return create_graph().compile(checkpointer=MemorySaver())


stage_subgraph = create_compiled_graph()
