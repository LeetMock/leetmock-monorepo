from typing import List

from agent_graph.types import Task

INTRO_TASKS: List[Task] = [
    Task.from_info(
        name="introduce_self",
        desc="Introduce yourself to the candidate and ask for their name.",
    ),
    Task.from_info(
        name="ask_background",
        desc="Ask the candidate about their background and experience.",
    ),
    Task.from_info(
        name="ask_goals",
        desc="Ask the candidate about their career goals.",
    ),
    Task.from_info(
        name="discuss_projects",
        desc="Discuss the candidate's past projects and their role in them.",
    ),
]

CODING_TASKS: List[Task] = [
    Task.from_info(
        name="describe_problem",
        desc="Describe the problem to the candidate.",
    ),
    Task.from_info(
        name="clarify_questions",
        desc="Answer any clarifying questions the candidate may have.",
        required=False,
    ),
    Task.from_info(
        name="thought_process",
        desc="Ask the candidate to explain their high-level thought process for solving the problem.",
    ),
    Task.from_info(
        name="complete_code",
        desc="Let the candidate complete the code to solve the problem.",
    ),
    Task.from_info(
        name="explain_code",
        desc="If the candidate's code can be optimized, ask them if they can think of a better solution.",
    ),
    Task.from_info(
        name="optimize_code",
        desc="If candidate's code can be optimized, ask them if they can think of a better solution",
        required=False,
    ),
]

EVAL_TASKS: List[Task] = [
    Task.from_info(
        name="overall_performance",
        desc="Tell candidate how they did in the interview.",
    ),
    Task.from_info(
        name="strengths_improvements",
        desc="Tell candidate what they did well and what they could improve on.",
    ),
    Task.from_info(
        name="improvement_suggestions",
        desc="Give candidate suggestions on how to improve their coding skills.",
    ),
    Task.from_info(
        name="prompt_user_for_questions",
        desc="Ask candidate if they have any questions for you.",
        required=False,
    ),
    Task.from_info(
        name="answer_user_questions", desc="Answer related questions user might have"
    ),
]
