from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field
from typing import List
from agent_graph.eval_agent.prompts import testCaseDesign_prompt, debugging_prompt
from agent_graph.eval_agent.constant import SCORE_GUIDELINES, AgentState, DEFAULT_CONFIG
from langchain_core.runnables import RunnableConfig
from agent_graph.llms import get_model
from convex import ConvexClient
import os
from typing import cast
import convex_client
from math import ceil


class TestCaseDesignEvaluation(BaseModel):
    score: int = Field(description="Score for test case design ability")
    comment: str = Field(description="Detailed feedback on test case design")
    examples: List[str] = Field(description="Examples supporting the evaluation")


class DebuggingEvaluation(BaseModel):
    score: int = Field(description="Score for debugging skills")
    comment: str = Field(description="Detailed feedback on debugging process")
    examples: List[str] = Field(
        description="Examples of candidate's debugging approaches"
    )

configuration = convex_client.Configuration(host=os.getenv("CONVEX_URL") or "")
CONVEX_URL = cast(str, os.getenv("CONVEX_URL"))

client = ConvexClient(CONVEX_URL)

def evaluate_test_case_coverage(state: AgentState, config: RunnableConfig) -> dict:

    TEST = "testCaseCoverage"

    test_results = client.action(
        "actions:runGroundTruthTest",
        args={
            "language": state.SESSION_STATE["editor"]["language"],
            "canidateCode": state.SESSION_STATE["editor"]["content"],
            "questionId": state.SESSION["questionId"],
        },
    )

    total_points = len(test_results)
    incorrect_testcases = []
    correct_points = 0
    for test_result in test_results:
        if test_result["passed"]:
            correct_points += 1
        else:
            incorrect_testcases.append(test_result)

    percentage = correct_points / total_points


    MAX_POINTS = SCORE_GUIDELINES[TEST]["maxScore"]
    DESCRIPTION = SCORE_GUIDELINES[TEST]["description"]
    score_detail = {
        "testName": TEST,
        "description": DESCRIPTION,
        "maxScore": MAX_POINTS,
        "comment": "You Passed {} out of {} evaluation testcases.".format(correct_points, total_points),
        "examples": [],
        "score": ceil(MAX_POINTS * percentage),
    }

    return {"scores": [score_detail]}


def evaluate_debugging(state: AgentState, config: RunnableConfig) -> dict:
    TEST = "debugging"
    config = DEFAULT_CONFIG

    MAX_POINTS = SCORE_GUIDELINES[TEST]["maxScore"]
    DESCRIPTION = SCORE_GUIDELINES[TEST]["description"]

    prompt = PromptTemplate(
        template=debugging_prompt,
        input_variables=["conversation", "coding_problem", "candidate_code"],
    )

    parser = JsonOutputParser(pydantic_object=DebuggingEvaluation)
    model = get_model(config.smart_model, config.temperature)
    chain = prompt | model | parser

    result = chain.invoke(
        {
            "conversation": "\n".join(state.messages),
            "coding_problem": state.QUESTION["question"] if state.QUESTION else "",
            "candidate_code": (
                state.SESSION_STATE["editor"]["content"] if state.SESSION_STATE else ""
            ),
            "max_points": MAX_POINTS,
        }
    )

    score_detail = {
        "testName": TEST,
        "description": DESCRIPTION,
        "maxScore": MAX_POINTS,
        "comment": result.get("comment", "Failed to get comment"),
        "examples": result.get("examples", []),
        "score": result.get("score", 0),
    }

    return {"scores": [score_detail]}


def evaluate_test_case_design(state: AgentState, config: RunnableConfig) -> dict:
    TEST = "testCaseDesign"
    config = DEFAULT_CONFIG

    MAX_POINTS = SCORE_GUIDELINES[TEST]["maxScore"]
    DESCRIPTION = SCORE_GUIDELINES[TEST]["description"]

    prompt = PromptTemplate(
        template=testCaseDesign_prompt,
        input_variables=["conversation", "coding_problem"],
    )

    parser = JsonOutputParser(pydantic_object=TestCaseDesignEvaluation)
    model = get_model(config.smart_model, config.temperature)
    chain = prompt | model | parser

    result = chain.invoke(
        {
            "conversation": "\n".join(state.messages),
            "coding_problem": state.QUESTION["question"] if state.QUESTION else "",
            "max_points": MAX_POINTS,
        }
    )

    score_detail = {
        "testName": TEST,
        "description": DESCRIPTION,
        "maxScore": MAX_POINTS,
        "comment": result.get("comment", "Failed to get comment"),
        "examples": result.get("examples", []),
        "score": result.get("score", 0),
    }

    return {"scores": [score_detail]}


def testing_final_evaluation(state: AgentState, config: RunnableConfig) -> dict:
    TEST = "testingFinal"

    score_detail = {
        "testName": TEST,
        "description": "Aggregate evaluation of testing abilities",
        "maxScore": 10,
        "comment": "Final evaluation of testing capabilities including test case design and debugging skills",
        "examples": [],
        "score": 0,  # This will be calculated based on other testing scores
    }

    return {"scores": [score_detail]}
