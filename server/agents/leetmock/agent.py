import time
from typing import List, Literal, TypedDict, Annotated

from langchain import hub

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_core.runnables.config import RunnableConfig
from langchain_core.prompts import ChatPromptTemplate

from langgraph.graph import END, START, StateGraph, add_messages
from langgraph.checkpoint import MemorySaver

from agent_graph.utils import create_init_state_node, safe_get
from agent_graph.llms import get_model, ModelName


InteractionType = Literal["response_required", "reminder_required"]


class AgentState(TypedDict):
    """Agent state"""

    messages: Annotated[List[BaseMessage], add_messages]
    """List of messages exchanged between user and agent"""

    interaction_type: InteractionType
    """The type of interaction, either response_required or reminder_required"""

    coding_question: str
    """The coding question to ask the user"""

    editor_content: str
    """The content of the editor"""

    content_last_updated: int
    """The last time the editor content was updated by the user in unix timestamp"""

    response: BaseMessage | None
    """The response from the agent"""


class AgentConfig(TypedDict):
    """Agent configuration"""

    model_name: ModelName
    """The name of the language model to use"""

    editor_idle_shreshold: int
    """The time in seconds that defines whether user is typing or not"""

    chatbot_stop_tokens: List[str]
    """The stop tokens for the chatbot"""

    chatbot_temperature: float
    """The temperature for the chatbot"""

    debug_mode: bool


DEFAULT_MODEL_NAME: ModelName = "gpt-4o"

DEFAULT_EDITOR_IDLE_SHRESHOLD = 15

DEFAULT_CHATBOT_STOP_TOKEN = "SILENT"

DEFAULT_CHATBOT_TEMPERATURE = 0.9

DEFAULT_STATE = {
    "interaction_type": "response_required",
    "coding_question": "Write a function that takes in a string and returns the string reversed",
    "editor_content": "def reverse_string(s: str) -> str:\n    return s[::-1]",
    "content_last_updated": 0,
    "response": None,
}


def chatbot(state: AgentState, config: RunnableConfig):
    system_prompt_tpl: ChatPromptTemplate = hub.pull("leetmock-v1")

    messages = safe_get(List, state, "messages", [])
    debug_mode = safe_get(bool, config.get("configurable", {}), "debug_mode", False)
    model_name = safe_get(
        str, config.get("configurable", {}), "model_name", DEFAULT_MODEL_NAME
    )
    temperature = safe_get(
        float,
        config.get("configurable", {}),
        "chatbot_temperature",
        DEFAULT_CHATBOT_TEMPERATURE,
    )
    stops = safe_get(
        List,
        config.get("configurable", {}),
        "chatbot_stop_tokens",
        [DEFAULT_CHATBOT_STOP_TOKEN],
    )

    llm = (
        get_model(model_name, temperature)
        .bind(stop=stops)
        .with_config({"tags": ["chatbot"]})
    )
    chain = system_prompt_tpl | llm

    response = chain.invoke(
        {
            "coding_question": state["coding_question"],
            "editor_content": state["editor_content"],
            "messages": messages,
        }
    )

    # Keep track of SLIENT token in message history, but not send to voice engine
    message = AIMessage(
        content=(
            response.content
            if len(response.content) > 0
            else DEFAULT_CHATBOT_STOP_TOKEN
        )
    )

    if debug_mode:
        messages = [message]
        return {"messages": messages, "response": response}
    else:
        # In production, only append the message if the response is empty (SILENT),
        # we want the messages to be updated using (update_state) on the server side
        messages = [message] if len(response.content) == 0 else []
        return {"messages": messages, "response": response}


def reminder(state: AgentState, config: RunnableConfig):
    editor_idle_shreshold = safe_get(
        int,
        config.get("configurable", {}),
        "editor_idle_shreshold",
        DEFAULT_EDITOR_IDLE_SHRESHOLD,
    )

    # check the total seconds since user last updated the code editor content
    time_diff = int(int(time.time()) - state["content_last_updated"] / 1000)

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

    return {"messages": [HumanMessage(content=message)]}


def check_user_activity(state: AgentState):
    time_diff = int(int(time.time()) - state["content_last_updated"] / 1000)

    # if last user activity is less than 4 seconds, then user is still typing
    if time_diff < 4:
        return END

    if state["interaction_type"] == "reminder_required":
        return "reminder"

    return "chatbot"


graph_builder = StateGraph(state_schema=AgentState, config_schema=AgentConfig)
graph_builder.add_node("prepare_state", create_init_state_node(DEFAULT_STATE))
graph_builder.add_node("reminder", reminder)  # type: ignore
graph_builder.add_node("chatbot", chatbot)  # type: ignore

graph_builder.add_edge(START, "prepare_state")
graph_builder.add_conditional_edges(
    "prepare_state",
    check_user_activity,
    {
        "reminder": "reminder",
        "chatbot": "chatbot",
        END: END,
    },
)
graph_builder.add_edge("reminder", "chatbot")
graph_builder.add_edge("chatbot", END)


graph = graph_builder.compile(
    checkpointer=MemorySaver(),
)
