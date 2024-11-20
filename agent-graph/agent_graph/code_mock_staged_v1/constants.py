from enum import Enum
from typing import List, OrderedDict, TypeVar

from agent_graph.event_descriptors import CodingEventType
from agent_graph.types import NamedEntity, Signal, Step
from agent_graph.utils import wrap_xml
from langchain_core.messages import AIMessage, AnyMessage, HumanMessage
from pydantic.v1 import BaseModel, Field

from libs.convex.convex_types import (
    CodeSessionContentChangedEvent,
    CodeSessionTestcaseChangedEvent,
    CodeSessionUserTestcaseExecutedEvent,
    Testcase,
    TestcaseResult,
)
from libs.diffs import get_unified_diff

TEntity = TypeVar("TEntity", bound=NamedEntity)


class StageTypes(str, Enum):
    INTRO = "intro"
    CODING = "coding"
    EVAL = "eval"
    END = "end"


class AgentConfig(BaseModel):
    """Config for the agent.

    - Used for agent-specific configurations.
    - Every single field should have a default value; otherwise, the agent will fail to start.
    """

    convex_url: str = Field(default="")

    fast_model: str = Field(default="gpt-4o-mini")

    smart_model: str = Field(default="gpt-4o")

    temperature: float = Field(default=0.2)


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


def get_new_entities(
    entities: List[TEntity], seen_names: List[str], new_names: List[str]
) -> List[str]:
    valid_entity_names = {e.name for e in entities}
    return [n for n in new_names if n in valid_entity_names and n not in seen_names]


def get_first_unseen_entity(entities: List[TEntity], seen: List[str]) -> TEntity | None:
    seen_names = set(seen)

    for e in entities:
        if e.name not in seen_names:
            return e

    return None


def format_stage_transition_messages(curr_stage: StageTypes):
    return [
        AIMessage(
            content=wrap_xml("thinking", STAGE_TRANSITION_MESSAGES[curr_stage]),
        )
    ]


def format_step_notification_messages(
    entities: List[TEntity], seen_names: List[str], completed_names: List[str]
) -> List[AnyMessage]:
    if len(completed_names) == 0:
        return []

    step_name = get_first_unseen_entity(entities=entities, seen=seen_names)

    if step_name is None:
        message = "I have finished all the steps."
    else:
        message = f"I have finished the step(s): {", ".join(completed_names)}. Now I will move on to the next step: {step_name.name}."

    return [AIMessage(content=wrap_xml("thinking", message))]


def format_signal_notification_messages(
    entities: List[Signal], seen_names: List[str], completed_names: List[str]
) -> List[AIMessage]:
    if len(completed_names) == 0:
        return []

    signal_name = get_first_unseen_entity(entities=entities, seen=seen_names)
    if signal_name is None:
        message = "All candidate signals have been caught."
    else:
        message = f"I have caught the signal(s): {", ".join(completed_names)}."

    return [AIMessage(content=wrap_xml("thinking", message))]


def format_content_changed_notification_messages(
    event_data: CodeSessionContentChangedEvent,
) -> List[AnyMessage]:
    before, after = event_data.event.data.before, event_data.event.data.after
    diff = get_unified_diff(before, after)
    return [
        HumanMessage(
            content=wrap_xml(
                tag="system-event",
                content=diff,
                args={"name": CodingEventType.CODE_EDITOR_CONTENT_CHANGED.value},
            )
        )
    ]


def format_testcase_changed_notification_messages(
    event_data: CodeSessionTestcaseChangedEvent,
) -> List[AnyMessage]:
    before, after = event_data.event.data.before, event_data.event.data.after

    def format_testcase(testcase: Testcase):
        input_str = ", ".join(f"{k}={v}" for k, v in testcase.input.items())
        return f"({input_str}) -> {testcase.expected_output}"

    before_str = "; ".join(format_testcase(t) for t in before)
    after_str = "; ".join(format_testcase(t) for t in after)

    content = (
        f"Testcases updated from {len(before)} to {len(after)} cases.\n"
        f"Before: {before_str}\n"
        f"After: {after_str}"
    )

    return [
        HumanMessage(
            content=wrap_xml(
                tag="system-event",
                content=content,
                args={"name": CodingEventType.USER_DEFINED_TEST_CASE_SET_UPDATED.value},
            )
        )
    ]


def format_user_testcase_executed_notification_messages(
    event_data: CodeSessionUserTestcaseExecutedEvent,
) -> List[AnyMessage]:
    test_results = event_data.event.data.test_results

    def format_test_result(result: TestcaseResult):
        input_str = ", ".join(f"{k}={v}" for k, v in result.input.items())
        status = "✅ PASS" if result.passed else "❌ FAIL"

        parts = [f"Case {result.case_number}: ({input_str})"]
        parts.append(f"Expected: {result.expected}")
        parts.append(f"Got: {result.actual}")

        if result.error:
            parts.append(f"Error: {result.error}")

        if result.stdout:
            parts.append(f"Output: {result.stdout}")

        parts.append(status)
        return " | ".join(parts)

    content = "\n".join(
        [
            f"Test Results ({len(test_results)} cases):",
            "=" * 40,
            *[format_test_result(result) for result in test_results],
            "=" * 40,
            f"Summary: {sum(1 for r in test_results if r.passed)} passed, {sum(1 for r in test_results if not r.passed)} failed",
        ]
    )

    return [
        HumanMessage(
            content=wrap_xml(
                tag="system-event",
                content=content,
                args={"name": CodingEventType.USER_DEFINED_TEST_CASE_EXECUTED.value},
            )
        )
    ]


START_ASK_CODING_QUESTION_PROMPT = """\
I have finished all the necessary background questions. \
From now on, I will stop asking any further background questions immediately!!!! \
Now, I MUST make a smooth transition to the coding stage. \
(Try to inform candidate about the transition and kick off the conversation of coding problem.)"""


FINISH_EVAL_PROMPT = """\
Now I have finished evaluating the candidate's code. I will give them some feedback and ask if they have any questions for me."""


STAGE_TRANSITION_MESSAGES = {
    StageTypes.CODING: START_ASK_CODING_QUESTION_PROMPT,
    StageTypes.EVAL: FINISH_EVAL_PROMPT,
}


INTRO_STEPS: List[Step] = [
    Step.from_info(
        name="introduce_self",
        desc="Concisely introduce yourself, brief talk about your background (feel free to make things up about your background, just be consistent throughout the interview).",
        done_definition="Interviewer has finished introducing themselves.",
        required=True,
    ),
    Step.from_info(
        name="ask_background",
        desc="Ask the candidate about their background and experience.",
        done_definition="Interviewer has finished asking about the candidate's background and experience.",
        required=True,
    ),
    # Step.from_info(
    #     name="ask_goals",
    #     desc="Ask the candidate about their career goals.",
    #     done_definition="Interviewer has finished asking about the candidate's career goals.",
    #     required=True,
    # ),
    # Step.from_info(
    #     name="discuss_projects",
    #     desc="Discuss the candidate's past projects and their role in them. Remember to praise interviewee on their achievement.",
    #     done_definition="Interviewer has finished asking the questions about the candidate's past projects and their role in them.",
    #     required=True,
    # ),
]

INTRO_SIGNALS: List[Signal] = [
    Signal.from_info(
        name="candidate_intro_done",
        desc="The candidate has introduced themselves about their background.",
    ),
    Signal.from_info(
        name="candidate_goals_done",
        desc="The candidate has finished talking about their career goals.",
    ),
    Signal.from_info(
        name="candidate_projects_done",
        desc="The candidate has finished talking about their past projects and their role in them.",
    ),
]

CODING_STEPS: List[Step] = [
    Step.from_info(
        name="describe_problem",
        desc="Describe the problem to the candidate.",
        done_definition="Interviewer has finished describing the problem.",
        required=True,
    ),
    Step.from_info(
        name="prompt_coding",
        desc="Let the candidate start writing the code to solve the problem.",
        done_definition="Interviewer has finished prompting the candidate to start writing the code, or the candidate has started writing the code without prompting.",
        required=True,
    ),
    Step.from_info(
        name="monitor_coding",
        desc="Monitor the candidate's coding progress, respond accordingly if they need help, clarification, or if they are stuck and need hints.",
        done_definition="Monitoring step isn't done until candidate has finished writing the complete code solution (not necessarily passed all test cases).",
        required=True,
    ),
    Step.from_info(
        name="prompt_explain_code",
        desc="Let the candidate explain their finished code and the approach they took to solve the problem.",
        done_definition="Code must be finished before performing this step. Interviewer has finished prompting the candidate to explain their code.",
        required=True,
    ),
    Step.from_info(
        name="prompt_test_case",
        desc="Let the candidate write the test cases for their code.",
        done_definition="Interviewer has finished prompting the candidate to write the test cases, or the candidate has finished writing the test cases without prompting.",
        required=True,
    ),
    Step.from_info(
        name="prompt_optimization",
        desc="If candidate's code can be optimized, ask them if they can think of a better solution",
        done_definition="Interviewer has finished prompting the candidate to optimize their code.",
        required=False,
    ),
]

CODING_SIGNALS: List[Signal] = [
    Signal.from_info(
        name="ask_for_clarification",
        desc="The candidate asks for clarification about the problem. The clarification questions MUST be directly related to the problem, such as asking for more details about the input/output, asking for constraints, etc.",
    ),
    Signal.from_info(
        name="thought_process",
        desc="The candidate explains their high-level thought process for solving the problem.",
    ),
    Signal.from_info(
        name="code_finished",
        desc="The candidate has finished writing the code.",
    ),
    Signal.from_info(
        name="passed_all_tests",
        desc="The candidate has passed all test cases.",
    ),
]

EVAL_STEPS: List[Step] = [
    Step.from_info(
        name="tell_overall_perf",
        desc="Tell candidate how they did in the interview.",
        done_definition="Interviewer has finished telling candidate how they did in the interview.",
        required=True,
    ),
    Step.from_info(
        name="tell_strength",
        desc="Tell candidate what they did well and what they could improve on.",
        done_definition="Interviewer has finished telling candidate what they did well and what they could improve on.",
        required=True,
    ),
    Step.from_info(
        name="suggest_improve",
        desc="Give candidate suggestions on how to improve their coding skills.",
        done_definition="Interviewer has finished giving candidate suggestions on how to improve their coding skills.",
        required=True,
    ),
    Step.from_info(
        name="ask_question_back",
        desc="Ask candidate if they have any questions for you.",
        done_definition="Interviewer has finished asking candidate if they have any questions for you.",
        required=True,
    ),
    Step.from_info(
        name="answer_user_question",
        desc="Answer related questions user might have",
        done_definition="Interviewer has finished answering related questions user might have",
        required=False,
    ),
]

EVAL_SIGNALS: List[Signal] = [
    Signal.from_info(
        name="user_questions",
        desc="User has asked questions about the interview process or the candidate.",
    ),
]


def get_step_map() -> OrderedDict[StageTypes, List[Step]]:
    return OrderedDict(
        [
            (StageTypes.INTRO, INTRO_STEPS),
            (StageTypes.CODING, CODING_STEPS),
            # (StageTypes.EVAL, EVAL_STEPS),
        ]
    )
