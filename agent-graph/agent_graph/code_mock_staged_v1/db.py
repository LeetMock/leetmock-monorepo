from agent_graph.code_mock_staged_v1.graph import AgentState
from agent_graph.utils import with_noop_node
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph

graph = StateGraph(AgentState).compile(checkpointer=MemorySaver())
db = with_noop_node(graph)
