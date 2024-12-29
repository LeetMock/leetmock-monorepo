import logging
import os
from collections import defaultdict
from typing import cast

import convex_client
from agent_graph.eval_agent.constant import (
    DEFAULT_CONFIG,
    INITIAL_AGENT_STATE,
    SCORE_GUIDELINES,
    AgentConfig,
    AgentState,
)
from agent_graph.eval_agent.prompts import overall_prompt
from agent_graph.eval_agent.sub_eval import EVALUATION_TESTS
from agent_graph.llms import get_model
from agent_graph.prompts import JOIN_CALL_MESSAGE
from agent_graph.storages.langgraph_cloud import LangGraphCloudStateStorage
from agent_graph.utils import get_configurable
from convex import ConvexClient
from langchain_core.messages import AnyMessage, HumanMessage
from agent_graph.storages.convex import ConvexStateStorage
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph, add_messages
from pydantic.v1 import BaseModel, Field
from libs.convex.api import ConvexApi

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


configuration = convex_client.Configuration(host=os.getenv("CONVEX_URL") or "")
CONVEX_URL = cast(str, os.getenv("CONVEX_URL"))

client = ConvexClient(CONVEX_URL)
convex_api = ConvexApi(convex_url=os.getenv("CONVEX_URL") or "")


async def initialize_agent(state: AgentState, config: RunnableConfig) -> dict:
    initial_state = INITIAL_AGENT_STATE.copy()
    session_id = state.session_id
    initial_state["session_id"] = session_id

    # Get session details using getById query

    session_details = client.query(
        "sessions:getById_unauth", args={"sessionId": session_id}
    )
    # logger.info(f"Session details: {session_details}")

    session_state = client.query(
        "codeSessionStates:getSessionStateBySessionId", args={"sessionId": session_id}
    )
    # logger.info(f"Session state: {session_state}")

    question_details = client.query(
        "questions:getById", args={"questionId": session_details["questionId"]}
    )
    # logger.info(f"Question details: {question_details}")

    state_storage = ConvexStateStorage(
        session_id=session_id,
        state_type=AgentState,
        convex_api=convex_api,
    )

    values = await state_storage.get_state()

    # Extracting the messages history from the state
    messages_history = values["messages"]
    messages = []
    for message in messages_history:
        if "<thinking>" not in message["kwargs"]["content"]:
            if "AIMessage" in message["id"]:
                messages.append(f"AI: {message['kwargs']['content']}")

            elif "HumanMessage" in message["id"]:
                messages.append(f"Human: {message['kwargs']['content']}")

            else:
                pass
    # logger.info(f"Messages history: {messages}")

    initial_state["SESSION"] = session_details
    initial_state["SESSION_STATE"] = session_state
    initial_state["QUESTION"] = question_details
    initial_state["messages"] = messages
    return initial_state


def final_evaluation(state: AgentState, config: RunnableConfig) -> dict:
    agent_config = get_configurable(AgentConfig, config)

    final_scores = defaultdict(dict)
    total_score = 0
    max_total_score = 0

    # Aggregate scores by category
    for score in state.scores:
        if score["testName"] in SCORE_GUIDELINES:
            category = SCORE_GUIDELINES[score["testName"]]["category"]
            final_scores[category][score["testName"]] = score
            total_score += score["score"]
            max_total_score += SCORE_GUIDELINES[score["testName"]]["maxScore"]

    logger.info(f"Final scores: {final_scores}")
    # Create prompt template
    prompt = PromptTemplate(
        template=overall_prompt, input_variables=["previous_evaluations"]
    )

    # Get model from config
    model = get_model(agent_config.smart_model, agent_config.temperature)

    # Create chain
    chain = prompt | model

    # Format previous evaluations for the prompt
    previous_evals = []
    for category, tests in final_scores.items():
        previous_evals.append(f"\n{category.upper()} EVALUATIONS:")
        for test_name, score_detail in tests.items():
            previous_evals.append(
                f"""
            Test: {test_name}
            Score: {score_detail['score']}/{score_detail['maxScore']}
            Comment: {score_detail['comment']}
            Examples: {', '.join(score_detail['examples'])}
            """
            )

    logger.info(f"Previous evaluations: {previous_evals}")

    # Execute chain
    feedback = chain.invoke({"previous_evaluations": "\n".join(previous_evals)})
    logger.info(f"Feedback: {feedback}")

    # write to convex db
    client.mutation(
        "eval:insertEvaluation",
        args={
            "sessionId": state.session_id,
            "overallFeedback": feedback.content,
            "totalScore": total_score,
            "scoreboards": final_scores,
        },
    )

    return {
        "overall_feedback": feedback.content,
        "total_score": total_score,
    }


def create_graph():
    graph_builder = StateGraph(state_schema=AgentState, config_schema=AgentConfig)

    # Add core nodes
    graph_builder.add_node("initialize_agent", initialize_agent)
    graph_builder.add_node("final_evaluation", final_evaluation)
    graph_builder.add_edge(START, "initialize_agent")

    # Add category nodes and their tests
    for category in EVALUATION_TESTS.keys():
        # Add category final evaluation node
        eval_node = EVALUATION_TESTS[category]["final"]
        graph_builder.add_node(category, eval_node)
        graph_builder.add_edge(category, "final_evaluation")

        # Add individual test nodes for this category
        for node_name, node in EVALUATION_TESTS[category]["tests"].items():
            graph_builder.add_node(node_name, node)
            # Connect test to initialize_agent (parallel execution)
            graph_builder.add_edge("initialize_agent", node_name)
            # Connect test to its category final
            graph_builder.add_edge(node_name, category)

    # Connect final evaluation to END
    graph_builder.add_edge("final_evaluation", END)

    return graph_builder


def create_compiled_graph():
    return create_graph().compile(checkpointer=MemorySaver())


graph = create_compiled_graph()
