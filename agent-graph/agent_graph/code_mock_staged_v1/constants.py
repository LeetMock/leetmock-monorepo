from enum import Enum
from typing import List

from agent_graph.types import Observation, Task


class StageTypes(str, Enum):
    INTRO = "intro"
    CODING = "coding"
    EVAL = "eval"
    END = "end"


def get_next_stage(stage: StageTypes) -> StageTypes:
    """Get the next stage."""

    if stage == StageTypes.INTRO:
        return StageTypes.CODING
    elif stage == StageTypes.CODING:
        return StageTypes.EVAL
    elif stage == StageTypes.EVAL:
        return StageTypes.END
    else:
        raise ValueError(f"Invalid stage: {stage}")


INTRO_TASKS: List[Task] = [
    Task.from_info(
        name="introduce_self",
        desc="Introduce yourself to the candidate.",
        done_definition="Interviewer has finished introducing themselves.",
        required=True,
    ),
    Task.from_info(
        name="ask_background",
        desc="Ask the candidate about their background and experience.",
        done_definition="Interviewer has finished asking about the candidate's background and experience.",
        required=True,
    ),
    Task.from_info(
        name="ask_goals",
        desc="Ask the candidate about their career goals.",
        done_definition="Interviewer has finished asking about the candidate's career goals.",
        required=True,
    ),
    Task.from_info(
        name="discuss_projects",
        desc="Discuss the candidate's past projects and their role in them.",
        done_definition="Interviewer has finished discussing the candidate's past projects and their role in them.",
        required=True,
    ),
]

INTRO_OBSERVATIONS: List[Observation] = [
    Observation.from_info(
        name="candidate_intro_done",
        desc="The candidate has introduced themselves about their background.",
        required=True,
    ),
    Observation.from_info(
        name="candidate_goals_done",
        desc="The candidate has finished talking about their career goals.",
        required=False,
    ),
    Observation.from_info(
        name="candidate_projects_done",
        desc="The candidate has finished talking about their past projects and their role in them.",
        required=False,
    ),
]

CODING_TASKS: List[Task] = [
    Task.from_info(
        name="describe_problem",
        desc="Describe the problem to the candidate.",
        done_definition="Interviewer has finished describing the problem.",
        required=True,
    ),
    Task.from_info(
        name="prompt_coding",
        desc="Let the candidate start writing the code to solve the problem.",
        done_definition="Interviewer has finished prompting the candidate to start writing the code, or the candidate has started writing the code without prompting.",
        required=True,
    ),
    Task.from_info(
        name="monitor_coding",
        desc="Monitor the candidate's coding progress, respond accordingly if they need help, clarification, or if they are stuck and need hints.",
        done_definition="Candidate has finished writing the complete code solution, not necessarily passed all test cases.",
        required=True,
    ),
    Task.from_info(
        name="prompt_explain_code",
        desc="Let the candidate explain their code and the approach they took to solve the problem.",
        done_definition="Interviewer has finished prompting the candidate to explain their code, or the candidate has finished explaining their code without prompting.",
        required=True,
    ),
    Task.from_info(
        name="prompt_test_case",
        desc="Let the candidate write the test cases for their code.",
        done_definition="Interviewer has finished prompting the candidate to write the test cases, or the candidate has finished writing the test cases without prompting.",
        required=True,
    ),
    Task.from_info(
        name="prompt_optimization",
        desc="If candidate's code can be optimized, ask them if they can think of a better solution",
        done_definition="Interviewer has finished prompting the candidate to optimize their code.",
        required=False,
    ),
]

CODING_OBSERVATIONS: List[Observation] = [
    Observation.from_info(
        name="clarifying_questions",
        desc="The candidate has asked clarifying questions about the problem.",
        required=False,
    ),
    Observation.from_info(
        name="thought_process",
        desc="The candidate has finished explaining their high-level thought process for solving the problem.",
        required=False,
    ),
    Observation.from_info(
        name="code_finished",
        desc="The candidate has finished writing the code.",
        required=True,
    ),
    Observation.from_info(
        name="passed_all_tests",
        desc="The candidate has explained their code.",
        required=False,
    ),
]

EVAL_TASKS: List[Task] = [
    Task.from_info(
        name="tell_overall_perf",
        desc="Tell candidate how they did in the interview.",
        done_definition="Interviewer has finished telling candidate how they did in the interview.",
        required=True,
    ),
    Task.from_info(
        name="tell_strength",
        desc="Tell candidate what they did well and what they could improve on.",
        done_definition="Interviewer has finished telling candidate what they did well and what they could improve on.",
        required=True,
    ),
    Task.from_info(
        name="suggest_improve",
        desc="Give candidate suggestions on how to improve their coding skills.",
        done_definition="Interviewer has finished giving candidate suggestions on how to improve their coding skills.",
        required=True,
    ),
    Task.from_info(
        name="ask_question_back",
        desc="Ask candidate if they have any questions for you.",
        done_definition="Interviewer has finished asking candidate if they have any questions for you.",
        required=True,
    ),
    Task.from_info(
        name="answer_user_question",
        desc="Answer related questions user might have",
        done_definition="Interviewer has finished answering related questions user might have",
        required=False,
    ),
]

EVAL_OBSERVATIONS: List[Observation] = [
    Observation.from_info(
        name="user_questions",
        desc="User has asked questions about the interview process or the candidate.",
        required=False,
    ),
]
