from typing import Annotated, List

from agent_graph.llms import get_model
from langchain_core.messages import AnyMessage, HumanMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph, add_messages
from pydantic import BaseModel, Field


class StageSubgraphState(BaseModel):
    """State for a single stage of the agent."""

    messages: Annotated[List[AnyMessage], add_messages] = Field(default_factory=list)

    stage_idx: int = Field(..., description="The index of the stage")


# --------------------- stage subgraph nodes --------------------- #
async def add_stage_message(state: StageSubgraphState):
    message = HumanMessage(content=f"(Ask user what is {state.stage_idx} * 10:)")
    return dict(messages=[message])


async def stage_runner(state: StageSubgraphState):
    # Example stage workflow
    llm = get_model("gpt-4o-mini")
    result = await llm.ainvoke(state.messages)

    return dict(messages=[result])


def create_graph():
    return (
        StateGraph(StageSubgraphState)
        # nodes
        .add_node("add_stage_message", add_stage_message)
        .add_node("stage_runner", stage_runner)
        # edges
        .add_edge(START, "add_stage_message")
        .add_edge("add_stage_message", "stage_runner")
        .add_edge("stage_runner", END)
    )


def create_compiled_graph():
    return create_graph().compile(checkpointer=MemorySaver())


stage_subgraph = create_compiled_graph()
