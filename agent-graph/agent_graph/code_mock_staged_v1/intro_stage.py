from typing import Annotated, List

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
from pydantic.v1 import BaseModel


class IntroStageState(BaseModel):
    """State for the intro stage of the agent."""

    messages: Annotated[List[AnyMessage], add_messages]


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

    chain = prompt | get_model("gpt-4o-mini")
    result = await chain.ainvoke({"messages": state.messages})

    return dict(messages=[result])


def create_graph():
    return (
        StateGraph(IntroStageState)
        # nodes
        .add_node("assistant", assistant)
        # edges
        .add_edge(START, "assistant")
        .add_edge("assistant", END)
        .compile(checkpointer=MemorySaver())
    )


stage_subgraph = create_graph()
