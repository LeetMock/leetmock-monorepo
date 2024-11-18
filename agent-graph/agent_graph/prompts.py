from typing import List

from langchain_core.prompts import PromptTemplate

from libs.convex.convex_types import TestcaseResult

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
