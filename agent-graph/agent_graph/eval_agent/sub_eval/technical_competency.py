from typing import List

from agent_graph.eval_agent.constant import DEFAULT_CONFIG, SCORE_GUIDELINES, AgentState
from agent_graph.eval_agent.prompts import (
    codeQuality_prompt,
    codingSpeed_prompt,
    syntaxError_prompt,
)
from agent_graph.eval_agent.utils import time_diff_in_minutes
from agent_graph.llms import get_model
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_core.runnables import RunnableConfig


class SyntaxErrorEvaluation(BaseModel):
    score: int = Field(description="Score for syntax accuracy")
    comment: str = Field(description="Detailed feedback on syntax errors")
    examples: List[str] = Field(description="Examples of syntax issues found")


class CodeQualityEvaluation(BaseModel):
    score: int = Field(description="Score for code quality")
    comment: str = Field(description="Detailed feedback on code quality")
    examples: List[str] = Field(description="Examples of code quality aspects")


class CodingSpeedEvaluation(BaseModel):
    score: int = Field(description="Score for coding speed")
    comment: str = Field(description="Detailed feedback on coding speed")
    examples: List[str] = Field(description="Examples of speed-related observations")


def evaluate_syntax_error(state: AgentState, config: RunnableConfig) -> dict:
    TEST = "syntaxError"
    config = DEFAULT_CONFIG

    MAX_POINTS = SCORE_GUIDELINES[TEST]["maxScore"]
    DESCRIPTION = SCORE_GUIDELINES[TEST]["description"]

    prompt = PromptTemplate(
        template=syntaxError_prompt,
        input_variables=["coding_problem", "candidate_code", "max_points"],
    )

    parser = JsonOutputParser(pydantic_object=SyntaxErrorEvaluation)
    model = get_model(config.smart_model, config.temperature)
    chain = prompt | model | parser

    result = chain.invoke(
        {
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


def evaluate_code_quality(state: AgentState, config: RunnableConfig) -> dict:
    TEST = "codeQuality"
    config = DEFAULT_CONFIG

    MAX_POINTS = SCORE_GUIDELINES[TEST]["maxScore"]
    DESCRIPTION = SCORE_GUIDELINES[TEST]["description"]

    prompt = PromptTemplate(
        template=codeQuality_prompt,
        input_variables=["coding_problem", "candidate_code", "max_points"],
    )

    parser = JsonOutputParser(pydantic_object=CodeQualityEvaluation)
    model = get_model(config.smart_model, config.temperature)
    chain = prompt | model | parser

    result = chain.invoke(
        {
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


def evaluate_coding_speed(state: AgentState, config: RunnableConfig) -> dict:
    TEST = "codingSpeed"
    config = DEFAULT_CONFIG

    MAX_POINTS = SCORE_GUIDELINES[TEST]["maxScore"]
    DESCRIPTION = SCORE_GUIDELINES[TEST]["description"]

    prompt = PromptTemplate(
        template=codingSpeed_prompt,
        input_variables=[
            "coding_problem",
            "candidate_code",
            "max_points",
            "interview_duration",
        ],
    )

    parser = JsonOutputParser(pydantic_object=CodingSpeedEvaluation)
    model = get_model(config.smart_model, config.temperature)
    chain = prompt | model | parser

    interview_duration = time_diff_in_minutes(
        state.SESSION["sessionStartTime"], state.SESSION["sessionEndTime"]
    )
    result = chain.invoke(
        {
            "coding_problem": state.QUESTION["question"] if state.QUESTION else "",
            "candidate_code": (
                state.SESSION_STATE["editor"]["content"] if state.SESSION_STATE else ""
            ),
            "max_points": MAX_POINTS,
            "interview_duration": interview_duration,
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


def technical_competency_final_evaluation(
    state: AgentState, config: RunnableConfig
) -> dict:
    TEST = "technicalCompetencyFinal"

    TEST = "problemSolvingFinal"
    # will add more details later
    score_detail = {
        "testName": TEST,
        "description": "Empty For Now",
        "maxScore": 10,
        "comment": "",
        "examples": [],
        "score": 0,
    }

    return {"scores": [score_detail]}
