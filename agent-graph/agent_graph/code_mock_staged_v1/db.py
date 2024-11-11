from agent_graph.code_mock_staged_v1.graph import AgentState
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph

db = StateGraph(AgentState).compile(checkpointer=MemorySaver())
