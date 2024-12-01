from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field
from typing import List
from agent_graph.eval_agent.prompts import clarification_prompt, thoughtProcess_prompt
from agent_graph.eval_agent.constant import SCORE_GUIDELINES, AgentState, RunnableConfig, DEFAULT_CONFIG
from agent_graph.llms import get_model

class ClarificationEvaluation(BaseModel):
    score: int = Field(description="Score candidate will receive for how well they asked relevant questions and seek clarification about requirements")
    comment: str = Field(description="Detailed feedback on clarification skills")
    examples: List[str] = Field(description="Specific examples from the conversation to support the score and comment")

class ThoughtProcessEvaluation(BaseModel):
    score: int = Field(description="Score candidate will receive for how well they explained their thought process")
    comment: str = Field(description="Detailed feedback on thought process clarity")
    examples: List[str] = Field(description="Specific examples from the conversation to support the score and comment")

def evaluate_clarification(state: AgentState, config: RunnableConfig) -> dict:
    TEST = "clarification"
    config = DEFAULT_CONFIG

    MAX_POINTS = SCORE_GUIDELINES[TEST]['maxScore']
    DESCRIPTION = SCORE_GUIDELINES[TEST]['description']
    
    # Create prompt template
    prompt = PromptTemplate(
        template=clarification_prompt,
        input_variables=["conversation", "coding_problem", "max_points"]
    )

    # Create parser
    parser = JsonOutputParser(pydantic_object=ClarificationEvaluation)

    # Get model from config
    model = get_model(config.smart_model, config.temperature)

    # Create chain
    chain = (
        prompt 
        | model
        | parser
    )

    # Prepare inputs
    conversation = '\n'.join(state.messages)
    coding_problem = state.QUESTION['question'] if state.QUESTION else ""

    # Execute chain
    result = chain.invoke({
        "conversation": conversation,
        "coding_problem": coding_problem,
        "max_points": MAX_POINTS
    })

    # Format output
    score_detail = {
        'testName': TEST,
        'description': DESCRIPTION,
        'maxScore': MAX_POINTS,
        'comment': result['comment'] if result['comment'] else "Failed to get comment",
        'examples': result['examples'] if result['examples'] else "Failed to get examples",
        'score': result['score'] if result['score'] else 0
    }

    return {"scores": [score_detail]}

def evaluate_thought_process(state: AgentState, config: RunnableConfig) -> dict:
    TEST = "thoughtProcess"
    config = DEFAULT_CONFIG

    MAX_POINTS = SCORE_GUIDELINES[TEST]['maxScore']
    DESCRIPTION = SCORE_GUIDELINES[TEST]['description']
    
    # Create prompt template
    prompt = PromptTemplate(
        template=thoughtProcess_prompt,
        input_variables=["conversation", "coding_problem", "max_points"]
    )

    # Create parser
    parser = JsonOutputParser(pydantic_object=ThoughtProcessEvaluation)

    # Get model from config
    model = get_model(config.smart_model, config.temperature)

    # Create chain
    chain = (
        prompt 
        | model
        | parser
    )

    # Prepare inputs
    conversation = '\n'.join(state.messages)
    coding_problem = state.QUESTION['question'] if state.QUESTION else ""

    # Execute chain
    result = chain.invoke({
        "conversation": conversation,
        "coding_problem": coding_problem,
        "max_points": MAX_POINTS
    })

    # Format output
    score_detail = {
        'testName': TEST,
        'description': DESCRIPTION,
        'maxScore': MAX_POINTS,
        'comment': result['comment'] if result['comment'] else "Failed to get comment",
        'examples': result['examples'] if result['examples'] else "Failed to get examples",
        'score': result['score'] if result['score'] else 0
    }

    return {"scores": [score_detail]}

def communication_final_evaluation(state: AgentState, config: RunnableConfig) -> dict:

    TEST = "CommunicationFinal"
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