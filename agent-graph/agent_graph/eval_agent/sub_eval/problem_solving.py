from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field
from typing import List
from agent_graph.eval_agent.prompts import optimalSolution_prompt, optimizationProcess_prompt, questionSpecific_prompt
from agent_graph.eval_agent.constant import SCORE_GUIDELINES, AgentState, RunnableConfig, DEFAULT_CONFIG
from agent_graph.llms import get_model

class OptimalSolutionEvaluation(BaseModel):
    score: int = Field(description="Score candidate will receive for how well they provide an optimal solution")
    comment: str = Field(description="Detailed feedback on optimal solution clarity")
    examples: List[str] = Field(description="Examples from code supporting the evaluation")

class OptimizationProcessEvaluation(BaseModel):
    score: int = Field(description="Score candidate will receive for their optimization process")
    comment: str = Field(description="Detailed feedback on optimization process")
    examples: List[str] = Field(description="Examples from conversation supporting the evaluation")

class QuestionSpecificEvaluation(BaseModel):
    score: int = Field(description="Score for addressing problem-specific requirements")
    comment: str = Field(description="Detailed feedback on problem-specific handling")
    examples: List[str] = Field(description="Examples from conversation supporting the evaluation")

def evaluate_optimal_solution(state: AgentState, config: RunnableConfig) -> dict:
    TEST = "optimalSolution"
    config = DEFAULT_CONFIG

    MAX_POINTS = SCORE_GUIDELINES[TEST]['maxScore']
    DESCRIPTION = SCORE_GUIDELINES[TEST]['description']
    
    prompt = PromptTemplate(
        template=optimalSolution_prompt,
        input_variables=["coding_problem", "candidate_code", "max_points"]
    )
    
    parser = JsonOutputParser(pydantic_object=OptimalSolutionEvaluation)
    model = get_model(config.smart_model, config.temperature)
    chain = prompt | model | parser
    
    result = chain.invoke({
        "coding_problem": state.QUESTION['question'] if state.QUESTION else "",
        "candidate_code": state.SESSION_STATE['editor']['content'] if state.SESSION_STATE else "",
        "max_points": MAX_POINTS
    })
    
    score_detail = {
        'testName': TEST,
        'description': DESCRIPTION,
        'maxScore': MAX_POINTS,
        'comment': result['comment'] if result['comment'] else "Failed to get comment",
        'examples': result['examples'] if result['examples'] else "Failed to get examples",
        'score': result['score'] if result['score'] else 0
    }
    
    return {"scores": [score_detail]}

def evaluate_optimization_process(state: AgentState, config: RunnableConfig) -> dict:
    TEST = "optimizationProcess"
    config = DEFAULT_CONFIG

    MAX_POINTS = SCORE_GUIDELINES[TEST]['maxScore']
    DESCRIPTION = SCORE_GUIDELINES[TEST]['description']
    
    prompt = PromptTemplate(
        template=optimizationProcess_prompt,
        input_variables=["conversation", "coding_problem", "candidate_code", "max_points"]
    )
    
    parser = JsonOutputParser(pydantic_object=OptimizationProcessEvaluation)
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

def evaluate_question_specific(state: AgentState, config: RunnableConfig) -> dict:
    TEST = "questionSpecific"
    config = DEFAULT_CONFIG

    MAX_POINTS = SCORE_GUIDELINES[TEST]['maxScore']
    DESCRIPTION = SCORE_GUIDELINES[TEST]['description']
    
    prompt = PromptTemplate(
        template=questionSpecific_prompt,
        input_variables=["conversation", "coding_problem", "candidate_code", "max_points"]
    )
    
    parser = JsonOutputParser(pydantic_object=QuestionSpecificEvaluation)
    model = get_model(config.smart_model, config.temperature)
    chain = prompt | model | parser
    
    result = chain.invoke({
        "conversation": '\n'.join(state.messages),
        "coding_problem": state.QUESTION['question'] if state.QUESTION else "",
        "candidate_code": state.SESSION_STATE['editor']['content'] if state.SESSION_STATE  else "",
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

def problem_solving_final_evaluation(state: AgentState, config: RunnableConfig) -> dict:
    # Aggregate scores from other evaluations
    
    TEST = "problemSolvingFinal"
    # will add more details later
    score_detail = {
        'testName': TEST,
        'description': 'Empty For Now',
        'maxScore': 10,
        'comment': "",
        'examples': [],
        'score': 0
    }
    

    return {"scores": [score_detail]}

    
