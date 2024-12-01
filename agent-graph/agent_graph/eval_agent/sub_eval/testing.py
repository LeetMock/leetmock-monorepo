from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field
from typing import List
from agent_graph.eval_agent.prompts import (
    testCaseDesign_prompt, debugging_prompt
)
from agent_graph.eval_agent.constant import SCORE_GUIDELINES, AgentState, RunnableConfig, DEFAULT_CONFIG
from agent_graph.llms import get_model

class TestCaseDesignEvaluation(BaseModel):
    score: int = Field(description="Score for test case design ability")
    comment: str = Field(description="Detailed feedback on test case design")
    examples: List[str] = Field(description="Examples supporting the evaluation")

class DebuggingEvaluation(BaseModel):
    score: int = Field(description="Score for debugging skills")
    comment: str = Field(description="Detailed feedback on debugging process")
    examples: List[str] = Field(description="Examples of candidate's debugging approaches")

def evaluate_test_case_coverage(state: AgentState, config: RunnableConfig) -> dict:
    
    TEST = "testCaseCoverage"

    MAX_POINTS = SCORE_GUIDELINES[TEST]['maxScore']
    DESCRIPTION = SCORE_GUIDELINES[TEST]['description']
    score_detail = {
        'testName': TEST,
        'description': DESCRIPTION,
        'maxScore': MAX_POINTS,
        'comment': "This test is not yet supported for now.",
        'examples': [],
        'score': MAX_POINTS
    }

    return {"scores": [score_detail]}

def evaluate_debugging(state: AgentState, config: RunnableConfig) -> dict:
    TEST = "debugging"
    config = DEFAULT_CONFIG
    
    MAX_POINTS = SCORE_GUIDELINES[TEST]['maxScore']
    DESCRIPTION = SCORE_GUIDELINES[TEST]['description']
    
    prompt = PromptTemplate(
        template=debugging_prompt,
        input_variables=["conversation", "coding_problem", "candidate_code"]
    )
    
    parser = JsonOutputParser(pydantic_object=DebuggingEvaluation)
    model = get_model(config.smart_model, config.temperature)
    chain = prompt | model | parser
    
    result = chain.invoke({
        "conversation": '\n'.join(state.messages),
        "coding_problem": state.QUESTION['question'] if state.QUESTION else "",
        "candidate_code": state.SESSION_STATE['editor']['content'] if state.SESSION_STATE else "",
        "max_points": MAX_POINTS
    })
    
    score_detail = {
        'testName': TEST,
        'description': DESCRIPTION,
        'maxScore': MAX_POINTS,
        'comment': result.get('comment', "Failed to get comment"),
        'examples': result.get('examples', []),
        'score': result.get('score', 0)
    }
    
    return {"scores": [score_detail]}

def evaluate_test_case_design(state: AgentState, config: RunnableConfig) -> dict:
    TEST = "testCaseDesign"
    config = DEFAULT_CONFIG
    
    MAX_POINTS = SCORE_GUIDELINES[TEST]['maxScore']
    DESCRIPTION = SCORE_GUIDELINES[TEST]['description']
    
    prompt = PromptTemplate(
        template=testCaseDesign_prompt,
        input_variables=["conversation", "coding_problem"]
    )
    
    parser = JsonOutputParser(pydantic_object=TestCaseDesignEvaluation)
    model = get_model(config.smart_model, config.temperature)
    chain = prompt | model | parser
    
    result = chain.invoke({
        "conversation": '\n'.join(state.messages),
        "coding_problem": state.QUESTION['question'] if state.QUESTION else "",
        "max_points": MAX_POINTS
    })
    
    score_detail = {
        'testName': TEST,
        'description': DESCRIPTION,
        'maxScore': MAX_POINTS,
        'comment': result.get('comment', "Failed to get comment"),
        'examples': result.get('examples', []),
        'score': result.get('score', 0)
    }
    
    return {"scores": [score_detail]}

def testing_final_evaluation(state: AgentState, config: RunnableConfig) -> dict:
    TEST = "testingFinal"
    
    score_detail = {
        'testName': TEST,
        'description': 'Aggregate evaluation of testing abilities',
        'maxScore': 10,
        'comment': "Final evaluation of testing capabilities including test case design and debugging skills",
        'examples': [],
        'score': 0  # This will be calculated based on other testing scores
    }
    
    return {"scores": [score_detail]}