from typing import Any, Dict, List

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
