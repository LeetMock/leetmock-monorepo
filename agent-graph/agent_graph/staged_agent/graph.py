import os
import time
from typing import Annotated, Any, Dict, List, Literal, TypedDict

import convex_client
from agent_graph.llms import ModelName, get_model
from agent_graph.prompts import TESTCASE_INTERNAL_ERROR_PROMPT, format_test_context
from agent_graph.utils import (
    get_default_config,
    get_default_state,
    remove_tasks,
    tasks_to_str,
)
from convex_client.models.request_actions_run_tests import RequestActionsRunTests
from convex_client.models.request_actions_run_tests_args import (
    RequestActionsRunTestsArgs,
)
from langchain import hub  # type: ignore
from langchain_core.load.dump import dumpd
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables.config import RunnableConfig
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph, add_messages

# --------------------- Types & Constants --------------------- #
InteractionType = Literal["response_required", "reminder_required"]
InterviewStatus = Literal["not_started", "in_progress", "completed"]


class AgentState(TypedDict):
    """Agent state"""

    messages: Annotated[List[BaseMessage], add_messages]
    """List of messages exchanged between user and agent"""

    incoming_messages: List[BaseMessage]
    """List of messages that are incoming to the agent to be synced"""

    stage: Literal["background", "coding", "eval"]
    """The stage of the interview"""

    curr_tasks: List[List[Any]]
    """The tasks to be completed in the current stage"""

    interaction_type: InteractionType
    """The type of interaction, either response_required or reminder_required"""

    question_id: str | None
    """The id of the question"""

    test_context: str | None
    """The context for the test, including test cases and expected output"""

    coding_question: str
    """The coding question to ask the user"""

    editor_content: str
    """The content of the editor"""

    content_last_updated: int
    """The last time the editor content was updated by the user in unix timestamp"""

    run_test_case: bool
    """Whether to run the test case"""

    interview_pipeline: List[str]
    """The pipeline of the interview"""

    stage_tasks: Dict[str, List[List[Any]]]
    """The tasks to be completed in each stage"""


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
    "stage": "background",
    "question_id": None,
    "test_context": None,
    "coding_question": "Write a function that takes in a string and returns the string reversed",
    "editor_content": "def reverse_string(s: str) -> str:\n    return s[::-1]",
    "content_last_updated": 0,
    "run_test_case": False,
    "interview_pipeline": ["background", "coding", "eval", "END"],
    "curr_tasks": [],
    "stage_tasks": {
        "background": [
            ["Introduce yourself to the interviewee and ask for their name.", 1],
            ["Ask the interviewee about their background and experience.", 1],
            ["Ask the interviewee about their career goals.", 1],
            ["Ask the interviewee about their strengths and weaknesses.", 1],
            ["Discuss the interviewee's past projects and their role in them.", 1],
        ],
        "coding": [
            ["describe the problem to the user", 1],
            ["answer any clarifying questions the user has", 0],
            ["let user write the code to solve the problem", 1],
            [
                "Ask the user to explain their code and the approach they took to solve the problem",
                1,
            ],
            [
                "if user's code can be optimized, ask them if they can think of a better solution",
                1,
            ],
            ["finish the question", 1],
        ],
        "eval": [
            ["Tell user how they did in the interview.", 1],
            ["Tell user what they did well and what they could improve on.", 1],
            ["Give user suggestions on how to improve their coding skills.", 1],
            ["Ask user if they have any questions for you.", 1],
        ],
    },
}

DEFAULT_CONFIG: AgentConfig = {
    "model_name": "gpt-4o",
    "editor_idle_shreshold": 15,
    "chatbot_stop_token": "SILENT",
    "chatbot_temperature": 0.9,
}

configuration = convex_client.Configuration(host=os.getenv("CONVEX_URL") or "")
api_client = convex_client.ApiClient(configuration)
action_api = convex_client.ActionApi(api_client)


# --------------------- initialization and mesage sync --------------------- #
def prepare_state(state: AgentState, config: RunnableConfig) -> dict:
    # Use the input state, applying defaults where necessary
    agent_state = get_default_state(AgentState, state, DEFAULT_STATE)
    print(agent_state)
    # Create a new dictionary for the return value
    prepared_state = {
        "messages": agent_state["incoming_messages"],
        "incoming_messages": [],
        "interaction_type": agent_state["interaction_type"],
        "stage": "background",
        "curr_tasks": agent_state["stage_tasks"][agent_state["stage"]],
        "interview_pipeline": agent_state["interview_pipeline"],
        "stage_tasks": agent_state["stage_tasks"],
        "question_id": agent_state["question_id"],
        "test_context": agent_state["test_context"],
        "coding_question": agent_state["coding_question"],
        "editor_content": agent_state["editor_content"],
        "content_last_updated": agent_state["content_last_updated"]
        or int(time.time() * 1000),
        "run_test_case": agent_state["run_test_case"],
    }

    return prepared_state


# --------------------- main chatbot output nodes --------------------- #
def chatbot_coding(state: AgentState, config: RunnableConfig):
    system_prompt_tpl: ChatPromptTemplate = hub.pull("leetmock-v2")

    agent_state = get_default_state(AgentState, state, DEFAULT_STATE)
    agent_config = get_default_config(AgentConfig, config, DEFAULT_CONFIG)

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
            "test_context": agent_state["test_context"],
            "messages": agent_state["messages"],
            "tasks": tasks_to_str(agent_state["curr_tasks"]),
        }
    )

    # Keep track of SLIENT token in message history, but not send to voice engine
    if len(response.content) == 0:
        message = AIMessage(content=stop_token)
    else:
        message = response

    return {"messages": [message]}


def chatbot_eval(state: AgentState, config: RunnableConfig):
    agent_config = get_default_config(AgentConfig, config, DEFAULT_CONFIG)

    prompt_tpl: ChatPromptTemplate = hub.pull("leetmock-eval")
    model_name = agent_config["model_name"]
    temperature = agent_config["chatbot_temperature"]
    stop_token = agent_config["chatbot_stop_token"]

    llm = get_model(model_name, temperature).with_config({"tags": ["chatbot"]})

    chain = prompt_tpl | llm

    response = chain.invoke(
        {
            "messages": state["messages"],
            "tasks": tasks_to_str(state["curr_tasks"]),
        }
    )

    return {"messages": [response]}


def chatbot_bg(state: AgentState, config: RunnableConfig):
    system_prompt_tpl: ChatPromptTemplate = hub.pull("leetmock_bg")

    agent_config = get_default_config(AgentConfig, config, DEFAULT_CONFIG)

    model_name = agent_config["model_name"]
    temperature = agent_config["chatbot_temperature"]
    stop_token = agent_config["chatbot_stop_token"]

    llm = get_model(model_name, temperature).with_config({"tags": ["chatbot"]})

    chain = system_prompt_tpl | llm

    response = chain.invoke(
        {
            "messages": state["messages"],
            "tasks": tasks_to_str(state["curr_tasks"]),
        }
    )

    return {"messages": [response]}


# --------------------- record node, responsible for recording the conversation, update eval metric, determine stage change --------------------- #
def record_node(state: AgentState, config: RunnableConfig):
    # [TODO] update eval metric and prompt
    agent_config = get_default_config(AgentConfig, config, DEFAULT_CONFIG)

    return {"messages": [HumanMessage(content="")]}


# --------------------- keep track of task completion, determine stage change --------------------- #
def stage_tracker(state: AgentState, config: RunnableConfig):

    prompt_tpl: ChatPromptTemplate = hub.pull("leetmock-stage-tracker")

    llm = get_model("gpt-4o-mini", 0.1).with_config(
        {"tags": ["leetmock-stage-tracker"]}
    )

    chain = prompt_tpl | llm

    response = chain.invoke(
        {
            "messages": state["messages"],
            "tasks": tasks_to_str(state["curr_tasks"]),
        }
    )

    # check if response.content is a array
    current_tasks = state["curr_tasks"]
    tasks_finished = response["task_completed"]
    if isinstance(tasks_finished, list):
        updated_tasks = remove_tasks(current_tasks, tasks_finished)
    else:
        return {"curr_tasks": current_tasks}

    # check if all tasks are completed
    if len(updated_tasks) == 0:
        next_stage = state["interview_pipeline"][
            state["interview_pipeline"].index(state["stage"]) + 1
        ]
        return {
            "stage": next_stage,
            "curr_tasks": state["stage_tasks"][next_stage],
            "messages": [
                HumanMessage(
                    content=f"(Now user has completed {state['stage']} stage, and is ready to start {next_stage} stage. You should do a smooth transition.)"
                )
            ],
        }

    return {"curr_tasks": updated_tasks}


# --------------------- code action classifier --------------------- #
def code_action_classifier(state: AgentState, config: RunnableConfig):
    agent_config = get_default_config(AgentConfig, config, DEFAULT_CONFIG)

    # model_name = agent_config["model_name"]
    # temperature = agent_config["chatbot_temperature"]
    # stop_token = agent_config["chatbot_stop_token"]

    prompt_tpl: ChatPromptTemplate = hub.pull("leetmock-code-action-classifier")

    llm = get_model("gpt-4o-mini", 0.1).with_config(
        {"tags": ["leetmock-code-action-classifier"]}
    )

    chain = prompt_tpl | llm

    # [TODO] run hurstic check to see if code editor content has no syntax error, if so, run test case, else, ask user to fix syntax error
    response = chain.invoke(
        {
            "messages": state["messages"],
        }
    )

    if response["to_test"]:
        return {"run_test_case": True}
    else:
        return {"run_test_case": False}


# --------------------- codeing stage intermediate nodes --------------------- #
def reminder(state: AgentState, config: RunnableConfig):
    agent_config = get_default_config(AgentConfig, config, DEFAULT_CONFIG)

    editor_idle_shreshold = agent_config["editor_idle_shreshold"]

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

    return {
        "messages": [HumanMessage(content=message)],
        "interaction_type": "response_required",  # reset interaction type to response required
    }


def run_test(state: AgentState, config: RunnableConfig):

    if state["question_id"] is None or len(state["question_id"]) == 0:
        return {"test_context": f"question id is not set: {state['question_id']}"}

    request = RequestActionsRunTests(
        args=RequestActionsRunTestsArgs(
            language="python",
            code=state["editor_content"],
            questionId=state["question_id"],
        )
    )

    try:
        response = action_api.api_run_actions_run_tests_post(request)
        assert response.value is not None
        result = response.value["testResults"]
    except Exception as e:
        return {"test_context": str(e)}

    return {"test_context": format_test_context(result)}


def interupter(state: AgentState, config: RunnableConfig):

    # check the total seconds since user last updated the code editor content
    time_diff = int(int(time.time()) - state["content_last_updated"] / 1000)

    typing_aware_interupter_message = f"(Now the is speaking, but user is still typing on coding editor {time_diff} seconds ago. You only need to response if user is asking you a question or to do something explicitly.)"

    return {"messages": [HumanMessage(content=typing_aware_interupter_message)]}


# --------------------- conditional check functions --------------------- #
def check_user_activity(state: AgentState):

    nodes = []
    time_diff = int(int(time.time()) - state["content_last_updated"] / 1000)

    if state["interaction_type"] == "reminder_required":
        nodes.append("reminder")
    else:
        if state["run_test_case"]:
            nodes.append("run_test")
        if time_diff < 5:
            nodes.append("interupter")

    if not nodes:
        nodes.append("chatbot_coding")

    return nodes


def check_stage(state: AgentState):

    if state["stage"] == "background":  # Added colon here
        return "background"
    elif state["stage"] == "coding":
        return "coding"
    elif state["stage"] == "eval":
        return "eval"
    return "END"


# --------------------- Graph Construction --------------------- #

graph_builder = StateGraph(state_schema=AgentState, config_schema=AgentConfig)

# chatbot nodes
graph_builder.add_node("chatbot_eval", chatbot_eval)  # type: ignore
graph_builder.add_node("chatbot_bg", chatbot_bg)  # type: ignore
graph_builder.add_node("chatbot_coding", chatbot_coding)  # type: ignore


graph_builder.add_node("prepare_state", prepare_state)  # type: ignore
graph_builder.add_node("stage_tracker", stage_tracker)  # type: ignore
graph_builder.add_node("code_action_classifier", code_action_classifier)  # type: ignore
graph_builder.add_node("run_test", run_test)  # type: ignore
graph_builder.add_node("reminder", reminder)  # type: ignore
graph_builder.add_node("interupter", interupter)  # type: ignore
graph_builder.add_node("record_node", record_node)  # type: ignore

graph_builder.add_edge(START, "prepare_state")
graph_builder.add_edge("prepare_state", "record_node")
graph_builder.add_edge("prepare_state", "stage_tracker")

graph_builder.add_conditional_edges(
    "stage_tracker",
    check_stage,
    {
        "background": "chatbot_bg",
        "coding": "code_action_classifier",
        "eval": "chatbot_eval",
        "END": END,
    },
)
graph_builder.add_conditional_edges(
    "code_action_classifier",
    check_user_activity,
    {
        "reminder": "reminder",
        "run_test": "run_test",
        "interupter": "interupter",
        "chatbot_coding": "chatbot_coding",
    },
)

graph_builder.add_edge(["reminder", "run_test", "interupter"], "chatbot_coding")
graph_builder.add_edge("chatbot_coding", END)
graph_builder.add_edge("chatbot_bg", END)
graph_builder.add_edge("chatbot_eval", END)
graph_builder.add_edge("record_node", END)


graph = graph_builder.compile(checkpointer=MemorySaver())
