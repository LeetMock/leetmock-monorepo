import time
from typing import Annotated, List, Literal, TypedDict

from langchain import hub

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_core.runnables.config import RunnableConfig
from langchain_core.prompts import ChatPromptTemplate

from langgraph.graph import END, StateGraph, add_messages, START
from langgraph.checkpoint.memory import MemorySaver

from agent_graph.utils import (
    get_default_config,
    get_default_state,
)
from agent_graph.llms import get_model, ModelName

InteractionType = Literal["response_required", "reminder_required"]
InterviewStatus = Literal["not_started", "in_progress", "completed"]


class AgentState(TypedDict):
    """Agent state"""

    messages: Annotated[List[BaseMessage], add_messages]
    """List of messages exchanged between user and agent"""

    incoming_messages: List[BaseMessage]
    """List of messages that are incoming to the agent to be synced"""

    interaction_type: InteractionType
    """The type of interaction, either response_required or reminder_required"""

    coding_question: str
    """The coding question to ask the user"""

    editor_content: str
    """The content of the editor"""

    content_last_updated: int
    """The last time the editor content was updated by the user in unix timestamp"""


class AgentConfig(TypedDict):
    """Agent configuration"""

    model_name: ModelName
    """The name of the language model to use"""

    editor_idle_shreshold: int
    """The time in seconds that defines whether user is typing or not"""

    chatbot_stop_token: str
    """The stop token for the chatbot"""

    chatbot_temperature: float
    """The temperature for the chatbot"""


DEFAULT_STATE: AgentState = {
    "messages": [],
    "incoming_messages": [],
    "interaction_type": "response_required",
    "coding_question": "Write a function that takes in a string and returns the string reversed",
    "editor_content": "def reverse_string(s: str) -> str:\n    return s[::-1]",
    "content_last_updated": 0,
}

DEFAULT_CONFIG: AgentConfig = {
    "model_name": "gpt-4o",
    "editor_idle_shreshold": 15,
    "chatbot_stop_token": "SILENT",
    "chatbot_temperature": 0.9,
}


def prepare_state(state: AgentState, config: RunnableConfig):
    agent_state = get_default_state(AgentState, state, DEFAULT_STATE)

    return agent_state


def sync_messages(state: AgentState):
    agent_state = get_default_state(AgentState, state, DEFAULT_STATE)

    return {
        "messages": agent_state["incoming_messages"],
        "incoming_messages": [],
    }


def chatbot(state: AgentState, config: RunnableConfig):
    system_prompt_tpl: ChatPromptTemplate = hub.pull("leetmock-v1")

    agent_state = get_default_state(AgentState, state, DEFAULT_STATE)
    agent_config = get_default_config(AgentConfig, config, DEFAULT_CONFIG)

    messages = agent_state["messages"]
    model_name = agent_config["model_name"]
    temperature = agent_config["chatbot_temperature"]
    stop_token = agent_config["chatbot_stop_token"]

    llm = (
        get_model(model_name, temperature)
        .bind(stop=[stop_token])
        .with_config({"tags": ["chatbot"]})
    )
    chain = system_prompt_tpl | llm

    response = chain.invoke(
        {
            "coding_question": agent_state["coding_question"],
            "editor_content": agent_state["editor_content"],
            "messages": messages,
        }
    )

    # Keep track of SLIENT token in message history, but not send to voice engine
    message = AIMessage(content=stop_token) if len(response.content) == 0 else None

    return {"messages": [message]} if message is not None else None


def reminder(state: AgentState, config: RunnableConfig):
    agent_state = get_default_state(AgentState, state, DEFAULT_STATE)
    agent_config = get_default_config(AgentConfig, config, DEFAULT_CONFIG)

    editor_idle_shreshold = agent_config["editor_idle_shreshold"]

    # check the total seconds since user last updated the code editor content
    time_diff = int(int(time.time()) - agent_state["content_last_updated"] / 1000)

    base_reminder_message = "(Now the user has been slient in a while, you would say:)"
    typing_aware_reminder_message = (
        f"(Now the user has been slient in a while, but user is still typing on editor "
        f"{time_diff} seconds ago, you would say:)"
    )

    message = (
        base_reminder_message
        if time_diff > editor_idle_shreshold
        else typing_aware_reminder_message
    )

    return {
        "messages": [HumanMessage(content=message)],
        "interaction_type": "response_required",  # reset interaction type to response required
    }


def check_user_activity(state: AgentState):
    agent_state = get_default_state(AgentState, state, DEFAULT_STATE)

    time_diff = int(int(time.time()) - agent_state["content_last_updated"] / 1000)

    # if last user activity is less than 4 seconds, then user is still typing
    if time_diff < 4:
        return END

    if agent_state["interaction_type"] == "reminder_required":
        return "reminder"

    return "chatbot"


graph_builder = StateGraph(state_schema=AgentState, config_schema=AgentConfig)
graph_builder.add_node("prepare_state", prepare_state)  # type: ignore
graph_builder.add_node("sync_messages", sync_messages)  # type: ignore
graph_builder.add_node("reminder", reminder)  # type: ignore
graph_builder.add_node("chatbot", chatbot)  # type: ignore

graph_builder.add_edge(START, "prepare_state")
graph_builder.add_edge("prepare_state", "sync_messages")
graph_builder.add_conditional_edges(
    "sync_messages",
    check_user_activity,
    {
        "reminder": "reminder",
        "chatbot": "chatbot",
        END: END,
    },
)
graph_builder.add_edge("reminder", "chatbot")
graph_builder.add_edge("chatbot", END)

graph = graph_builder.compile(checkpointer=MemorySaver())
