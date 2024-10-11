from typing import List, Dict, Any
from langchain_core.prompts import PromptTemplate

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


def format_test_context(testcases: List[Dict[str, Any]]) -> str:
    failed_tests = [test for test in testcases if not test["passed"]]

    if len(failed_tests) == 0:
        return TESTCASE_SUCCESS_PROMPT

    num_tests, num_failed = len(testcases), len(failed_tests)
    testcases = [
        {
            "index": i,
            "input": test["input"],
            "expected": test["expected"],
            "actual": test["actual"],
            "has_error": test["error"] is not None,
            "error": test["error"],
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

STAGE_TASKS: Dict[str, List[str]] = {
    "background": [
        "Introduce yourself to the interviewee and ask for their name.",
        # "Ask the interviewee about their background and experience.",
        # "Ask the interviewee about their career goals.",
        # "Ask the interviewee about their strengths and weaknesses.",
        # "Discuss the interviewee's past projects and their role in them.",
    ],
    "coding": [
        "describe the problem to the user",
        "answer any clarifying questions the user has",
        "let user write the code to solve the problem",
        "Ask the user to explain their code and the approach they took to solve the problem",
        "if user's code can be optimized, ask them if they can think of a better solution",
        "finish the question",
    ],
    "eval": [
        "Tell user how they did in the interview.",
        "Tell user what they did well and what they could improve on.",
        "Give user suggestions on how to improve their coding skills.",
        "Ask user if they have any questions for you.",
    ],
}
