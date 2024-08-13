from langchain_openai import ChatOpenAI
from langchain_community.tools.tavily_search import TavilyAnswer
from langgraph.prebuilt import create_react_agent


model = ChatOpenAI(model="gpt-4o")

tools = [TavilyAnswer()]

graph = create_react_agent(model, tools, checkpointer=MemorySaver())
