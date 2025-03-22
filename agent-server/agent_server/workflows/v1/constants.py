from typing import List, OrderedDict, TypeVar

from agent_graph.event_descriptors import CodingEventType
from agent_graph.types import NamedEntity, Signal, Step
from agent_graph.utils import wrap_xml
from agent_server.workflows.types import CodingEventType
from agent_server.workflows.v1.types import EventDescriptor, StageType, Step
from langchain_core.messages import AIMessage, AnyMessage, HumanMessage
from langchain_core.prompts import PromptTemplate

from libs.convex.convex_types import (
    CodeSessionContentChangedEvent,
    CodeSessionTestcaseChangedEvent,
    CodeSessionUserTestcaseExecutedEvent,
    Testcase,
    TestcaseResult,
)
from libs.diffs import get_unified_diff

TEntity = TypeVar("TEntity", bound=NamedEntity)

from loguru import logger

JOIN_CALL_MESSAGE = (
    "(User just joined the call, please welcome and introduce yourself:)"
)

RECONNECT_MESSAGE = "(User got disconnected and just reconnected, you would say:)"


TESTCASE_INTERNAL_ERROR_PROMPT = """
Below are the test results for the code candidate wrote.

[INFO]
Something went wrong while running the tests.
[/INFO]
"""


TESTCASE_SUCCESS_PROMPT = """
Below are the test results for the code candidate wrote.

[INFO]
All Tests Passed!
[/INFO]
"""

TESTCASE_STATIC_CHECK_ERROR_PROMPT = """
Below are the test results for the code candidate wrote.

[INFO]
There are some static check errors in the code.
{{ static_check_error }}
[/INFO]
"""

TESTCASE_FAILURE_PROMPT = """
Below are the test results for the code candidate wrote.

[INFO]
{{ num_failed }} / {{ num_tests }} test cases failed.
[/INFO]

{% for testcase in testcases %}
[FAILED_CASE_{{ testcase.index }}]
Input:
{{ testcase.input }}
Expected:
{{ testcase.expected }}
{% if testcase.has_error %}
Error:
{{ testcase.error }}
{% else %}
Got:
{{ testcase.actual }}
{% endif %}
[/FAILED_CASE_{{ testcase.index }}]
{% endfor %}
"""


START_ASK_BACKGROUND_QUESTION_PROMPT = """\
I have finished all the necessary introduction questions. \
From now on, I will stop asking any further introduction questions immediately!!!! \
Now, I MUST make a smooth transition to the background stage. \
(Try to inform candidate about the transition and kick off the conversation of background questions.)"""


START_ASK_CODING_QUESTION_PROMPT = """\
I have finished all the necessary background questions. \
From now on, I will stop asking any further background questions immediately!!!! \
Now, I MUST make a smooth transition to the coding stage. \
(Try to inform candidate about the transition and kick off the conversation of coding problem.)"""


FINISH_EVAL_PROMPT = """\
Now I have finished evaluating the candidate's code. I will give them some feedback and ask if they have any questions for me."""


FINISH_INTERVIEW_PROMPT = """\
Now candidate has finished the interview. Thank them for their time and interact for any questions they might have.
"""

STAGE_TRANSITION_MESSAGES = {
    StageType.CODING: START_ASK_CODING_QUESTION_PROMPT,
    StageType.EVAL: FINISH_EVAL_PROMPT,
    StageType.END: FINISH_INTERVIEW_PROMPT,
}


INTRO_STEPS: List[Step] = [
    Step.from_info(
        name="introduce_self",
        desc="Concisely introduce yourself, brief talk about your background (feel free to make things up about your background, just be consistent throughout the interview).",
        done_definition="Interviewer has finished introducing themselves.",
        required=True,
    ),
    Step.from_info(
        name="ask_candidate_name",
        desc="Ask the candidate about their name.",
        done_definition="Interviewer has finished asking about the candidate's name.",
        required=True,
    ),
    Step.from_info(
        name="ask_company_and_role",
        desc="Ask the candidate about their current company and role. DO NOT ask about anything else.",
        done_definition="Interviewer has finished asking about the candidate's current company and role.",
        required=True,
    ),
]

BACKGROUND_STEPS: List[Step] = [
    Step.from_info(
        name="ask_goals",
        desc="Ask the candidate about their career goals.",
        done_definition="Interviewer has finished asking about the candidate's career goals.",
        required=True,
    ),
    Step.from_info(
        name="discuss_projects",
        desc="Discuss the candidate's past projects and their role in them. Remember to praise interviewee on their achievement.",
        done_definition="Interviewer has finished asking the questions about the candidate's past projects and their role in them.",
        required=True,
    ),
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


EVENT_DESCRIPTORS = [
    EventDescriptor(
        name=CodingEventType.CODE_EDITOR_CONTENT_CHANGED,
        description="The candidate has changed the code in the editor (shown in diff format).",
    ),
    EventDescriptor(
        name=CodingEventType.USER_DEFINED_TEST_CASE_SET_UPDATED,
        description="The candidate has updated the user-defined test cases set.",
    ),
    EventDescriptor(
        name=CodingEventType.USER_DEFINED_TEST_CASE_EXECUTED,
        description="The candidate has executed the user-defined test cases. Results will be shown in the console.",
    ),
]


def format_static_check_error(error: str) -> str:
    prompt = PromptTemplate.from_template(
        TESTCASE_STATIC_CHECK_ERROR_PROMPT, template_format="jinja2"
    )

    return prompt.invoke(
        {
            "static_check_error": error,
        }
    ).to_string()


def format_test_context(test_results: List[TestcaseResult]) -> str:
    failed_tests = [test for test in test_results if not test.passed]

    if len(failed_tests) == 0:
        return TESTCASE_SUCCESS_PROMPT

    num_tests, num_failed = len(test_results), len(failed_tests)
    testcases = [
        {
            "index": i,
            "input": test.input,
            "expected": test.expected,
            "actual": test.actual,
            "has_error": test.error is not None,
            "error": test.error,
        }
        for i, test in enumerate(failed_tests)
    ]

    prompt = PromptTemplate.from_template(
        TESTCASE_FAILURE_PROMPT, template_format="jinja2"
    )

    return prompt.invoke(
        {
            "num_tests": num_tests,
            "num_failed": num_failed,
            "testcases": testcases,
        }
    ).to_string()


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


def format_stage_transition_messages(curr_stage: StageType):
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
    diff = get_unified_diff(before, after).strip()

    if len(diff) == 0:
        return []

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


def format_end_of_session_thought_messages() -> List[AIMessage]:
    content = """\
I need to decide if I can properly end the interview session. \
This should only be proceeded after interviewer and candidate say goodbye to each other, or some closing statements like that.
"""
    return [AIMessage(content=wrap_xml(tag="thinking", content=content))]


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


def get_stage_confirmation_tool_call_state_patch(
    stage_type: StageType, function_name: str, state
):
    logger.info(f"Tool call detected: {function_name}")

    return dict(
        tool_call_detected=True,
        completed_steps=[step.name for step in state.steps[stage_type]],
        current_stage_idx=state.current_stage_idx + 1,
        round_until_next_confirmation=5,
    )


def create_transition_confirmation_step(
    curr_stage: StageType, next_stage: StageType
) -> Step:
    logger.info(
        f"Creating transition confirmation step for {curr_stage} -> {next_stage}"
    )

    step_map = {
        StageType.INTRO: Step.from_info(
            name=f"ask_candidate_readiness_for_coding_stage",
            desc=f"Ask the candidate if they are ready to start coding.",
            done_definition=f"Interviewer has finished asking the candidate if they are ready to start coding.",
            required=True,
        ),
        StageType.CODING: Step.from_info(
            name=f"ask_candidate_readiness_for_evaluation_and_feedback_stage",
            desc=f"Ask the candidate if they are comfortable with their current code and if they are ready to wrap up the interview.",
            done_definition=f"Interviewer has finished asking the candidate if they are comfortable with their current code and if they are ready to wrap up the interview.",
            required=True,
        ),
        StageType.EVAL: Step.from_info(
            name=f"ask_candidate_ready_to_end_stage",
            desc=f"Ask the candidate if they are OK to end the interview, and say closing statements.",
            done_definition=f"Interviewer has finished asking the candidate if they are OK to end the interview, and say closing statements.",
            required=True,
        ),
    }

    if curr_stage not in step_map:
        raise ValueError(f"Invalid stage: {curr_stage}")

    return step_map[curr_stage]


def get_step_map(interview_flow: List[str]) -> OrderedDict[StageType, List[Step]]:
    """Get step map based on interview flow.

    Args:
        interview_flow: List of stage names in the interview flow

    Returns:
        OrderedDict mapping stages to their steps
    """
    # Map string stage names to enum values
    stage_name_to_enum = {
        "introduction": StageType.INTRO,
        "coding": StageType.CODING,
        "evaluation": StageType.EVAL,
        "end": StageType.END,
    }

    # Map enum values to step lists
    stage_to_steps = {
        StageType.INTRO: INTRO_STEPS,
        StageType.CODING: CODING_STEPS,
        StageType.EVAL: EVAL_STEPS,
    }

    # Build ordered dict with only stages in interview flow
    step_map = OrderedDict()
    for stage_name in interview_flow:
        if stage_name == "end":
            continue
        stage_enum = stage_name_to_enum[stage_name]
        step_map[stage_enum] = stage_to_steps[stage_enum]

    return step_map
