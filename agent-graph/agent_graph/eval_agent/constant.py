import operator
from typing import Annotated, Any, Dict, List, Literal, Optional, TypedDict

from pydantic.v1 import BaseModel, Field


class SessionMeta(TypedDict):
    interviewFlow: List[str]
    programmingLanguage: Optional[str]
    metaData: Dict[str, Any]


class Session(TypedDict):
    userId: str
    questionId: str  # Convex ID
    agentThreadId: str
    assistantId: str
    sessionStatus: Literal["not_started", "in_progress", "completed"]
    timeLimit: int
    voice: str
    sessionStartTime: Optional[int]
    sessionEndTime: Optional[int]
    interviewType: str
    evalReady: bool
    interviewMode: Literal["practice", "strict"]
    meta: SessionMeta


class EditorState(TypedDict):
    language: str
    content: str
    lastUpdated: int


class TerminalState(TypedDict):
    output: str
    isError: bool


class TestCase(TypedDict):
    input: Dict[str, Any]
    expectedOutput: Optional[Any]


class SessionState(TypedDict):
    stage: str
    editor: EditorState
    terminal: TerminalState
    testcases: List[TestCase]

class Question(TypedDict):
    category: List[str]
    difficulty: int
    question: str
    solutions: Dict[str, str]
    functionName: str
    inputParameters: Dict[str, Dict[str, str]]
    outputParameters: str
    evalMode: Literal["exactMatch", "listNodeIter", "sortedMatch"]
    tests: List[Dict[str, Any]]  # Each test has input and output fields
    title: str
    metaData: Dict[str, Any]


class ScoreDetail(TypedDict):
    testName: str
    description: str
    maxScore: int
    comment: str
    examples: List[str]
    score: int


class OverallFeedback(TypedDict):
    score: int
    maxScore: int
    decision: Literal["Strong Hire", "Hire", "No Hire", "Strong No Hire"]


# 4 aspects of coding interview performance
class CommunicationScore(TypedDict):
    clarification: ScoreDetail
    thoughtProcess: ScoreDetail


class ProblemSolvingScore(TypedDict):
    optimalSolution: ScoreDetail
    optimizationProcess: ScoreDetail
    questionSpecific: ScoreDetail


class TechnicalCompetencyScore(TypedDict):
    syntaxError: ScoreDetail
    codeQuality: ScoreDetail
    codingSpeed: ScoreDetail


class TestingScore(TypedDict):
    testCaseCoverage: ScoreDetail
    debugging: ScoreDetail
    testCaseDesign: ScoreDetail


class ScoreBoard(TypedDict):
    communication: CommunicationScore
    problemSolving: ProblemSolvingScore
    technicalCompetency: TechnicalCompetencyScore
    testing: TestingScore


class AgentConfig(BaseModel):
    """Config for the agent.

    - Used for agent-specific configurations.
    - Every single field should have a default value; otherwise, the agent will fail to start.
    """

    fast_model: str = Field(default="o1-mini")

    smart_model: str = Field(default="o1-preview-2024-09-12")

    temperature: float = Field(default=1)


DEFAULT_CONFIG = AgentConfig(
    fast_model="o1-mini", smart_model="o1-mini", temperature=1
)


class AgentState(BaseModel):
    """State of the agent."""

    messages: List[str] = Field(default_factory=list)

    session_id: str = Field(default="")

    QUESTION: Question | None = Field(default=None)

    SESSION_STATE: SessionState | None = Field(default=None)

    SESSION: Session | None = Field(default=None)

    total_score: int = Field(default=0)

    overall_feedback: str = Field(default="")

    scores: Annotated[list[ScoreDetail], operator.add] = Field(default=[])


SCORE_GUIDELINES = {
    # Communication
    "clarification": {
        "description": "We evaluate how well you ask questions before coding. Good questions about requirements, constraints, and edge cases show you're thorough. Don't hesitate to seek clarification - it's better to ask than to make incorrect assumptions!",
        "maxScore": 5,
        "category": "communication",
    },
    "thoughtProcess": {
        "description": "We look at how clearly you explain your thinking. Walk us through your approach, explain why you chose certain solutions, and share your reasoning as you code. Think of it as teaching someone else - the clearer you can explain, the better!",
        "maxScore": 20,
        "category": "communication",
    },
    # Problem Solving
    "optimalSolution": {
        "description": "This measures how efficient your final solution is. We look at both time and space complexity. Don't worry if your first solution isn't perfect - it's okay to start simple and optimize later.",
        "maxScore": 8,
        "category": "problemSolving",
    },
    "optimizationProcess": {
        "description": "We evaluate how you improve your code. Start with a working solution, then think about making it better. Explain what you're improving and why. It's great to discuss different approaches and their trade-offs!",
        "maxScore": 12,
        "category": "problemSolving",
    },
    "questionSpecific": {
        "description": "This checks if you've addressed all parts of the problem, including special requirements. Make sure to read the question carefully and handle all the specific cases mentioned.",
        "maxScore": 5,
        "category": "problemSolving",
    },
    # Technical Competency
    "syntaxError": {
        "description": "Don't worry too much about perfect syntax! We mainly check if you're comfortable with the programming language basics. Small typos are fine - we care more about your problem-solving ability.",
        "maxScore": 5,
        "category": "technicalCompetency",
    },
    "codeQuality": {
        "description": "We look at how clean and readable your code is. Use clear variable names, add helpful comments when needed, and structure your code well. Write code that others can easily understand and maintain.",
        "maxScore": 14,
        "category": "technicalCompetency",
    },
    "codingSpeed": {
        "description": "This isn't about racing! We look for steady progress and efficient coding once you have a plan. Take time to think before coding - rushing often leads to mistakes.",
        "maxScore": 6,
        "category": "technicalCompetency",
    },
    # Testing
    "testCaseCoverage": {
        "description": "We check how well your code handles different test cases. Try your solution with various inputs, including edge cases. Don't worry if you don't pass all tests immediately - debugging is part of the process!",
        "maxScore": 12,
        "category": "testing",
    },
    "debugging": {
        "description": "When something doesn't work, we look at how you find and fix the problem. Explain your debugging process - what you think went wrong and how you're fixing it. Good debugging skills are valuable!",
        "maxScore": 8,
        "category": "testing",
    },
    "testCaseDesign": {
        "description": "Bonus points for creating your own test cases! Think about edge cases, special situations, or unusual inputs. It shows you're thinking thoroughly about the problem.",
        "maxScore": 5,
        "category": "testing",
    },
}

INITIAL_AGENT_STATE: Dict[str, Any] = {
    "messages": [],
    "session_id": "",
    "QUESTION": None,
    "SESSION_STATE": None,
    "SESSION": None,
    "total_score": 0,
    "overall_feedback": "",
    "scores": [],
}


"""
For Future refactor Reference
def initialize_agent(state: AgentState, config: RunnableConfig) -> dict:
    initial_state = INITIAL_AGENT_STATE.copy()
    session_id = state.session_id
    initial_state['session_id'] = session_id

    # Get session details using getById query
    session_request = RequestSessionsGetById(
        args=RequestSessionsEndSessionArgs(
            session_id=session_id
        )
    )
    session_details = query_api.api_run_sessions_get_by_id_post(
        request_sessions_get_by_id=session_request
    )
    print(session_details)
    if session_details.status == "error":
        raise Exception(f"Failed to get session details: {session_details.error_message}")

    # Get session state using getSessionStateBySessionId query
    session_state_request = RequestCodeSessionStatesGetSessionStateBySessionId(
        sessionId=session_id
    )
    session_state = query_api.api_run_code_session_states_get_session_state_by_session_id_post(
        request_code_session_states_get_session_state_by_session_id=session_state_request
    )
    if session_state.status == "error":
        raise Exception(f"Failed to get session state: {session_state.error_message}")

    # Get question details using getById query
    session_data = session_details.value
    # question_request = RequestQuestionsGetById(
    #     questionId=session_data.get("questionId")
    # )
    # question_details = cast(ResponseQuestionsGetById,
    #     query_api.api_run_questions_get_by_id_post(
    #         request_questions_get_by_id=question_request
    #     ))
    # if question_details.status == "error":
    #     raise Exception(f"Failed to get question details: {question_details.error_message}")

    # Update state with typed responses
    initial_state["SESSION"] = session_data
    # initial_state["QUESTION"] = question_details.value
    initial_state["SESSION_STATE"] = session_state.value

    return initial_state
"""
