from questions import Question, Test
from typing import List, Dict, Union, Any
from endpoint_request import *
import anthropic
from utils import extract_function_name
import json

client = anthropic.Anthropic(api_key='Your API Key')
MODEL = "claude-3-5-sonnet-20240620"

def generate_function_name(question: Question) -> str:
    print("generating function name")
    prompt = f"Generate a concise and informative function name for the following LeetCode question:\n\n{question.title}\n\n{question.question}\n\n return in this schema <functionName>[generated function Name]</functionName>"

    response = client.messages.create(
        model=MODEL,
        max_tokens=50,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    raw_response = response.content[0].text
    function_name = extract_function_name(raw_response, "functionName")
    print(function_name)
    return function_name



def generate_input_parameters(question: Question) -> dict:
    print("\ngenerating input parameters")
    example_params = [
        {
            "cpp": ["s", "string", "k", "int"],
            "java": ["s", "String", "k", "int"],
            "javascript": ["s", "string", "k", "number"],
            "python": ["s", "str", "k", "int"],
        },
        {
            "cpp": ["l1", "ListNode*", "l2", "ListNode*"],
            "java": ["l1", "ListNode", "l2", "ListNode"],
            "javascript": ["l1", "ListNode", "l2", "ListNode"],
            "python": [
                "l1",
                "Optional[ListNode]",
                "l2",
                "Optional[ListNode]",
            ],
        }
    ]
    prompt = f"""You are a LeetCode expert. Generate input parameters for this question:

Title: {question.title}

Question: {question.question}

Example outputs:
{example_params}

Provide input parameters for each language as shown above. Don't output anything else, just output an json like object contains the inputParamter for those languages"""

    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        temperature=0,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    raw_response = response.content[0].text
    format_response = json.loads(raw_response)
    
    if isinstance(format_response, list) and format_response:
        format_response = format_response[0]
        # function_name = extract_function_name(raw_response, "functionName")
    print(format_response)
    return format_response

def generate_tests(question: Question) -> List[Test]:

    print('\n generating test cases')
    example = [
        { 'input': { 'nums': [3, 1, 5, 8] }, 'output': 167 },
        { 'input': { 'nums': [1, 5] }, 'output': 10 },
    ]
    prompt = f"""Generate 10 test cases for the following LeetCode question:

Question Title: {question.title}

Question Description: {question.question}

Input Parameter: {question.inputParameters}

Example Testcases for MaxCoin:
{example} 

Instructions:
1. Strictly follow testcase requirment in question description
2. use parameter name in Input Parameters
3. Make sure to generate good quality testcases, try to test different aspect of the code
4. Most importantly, Provide the test cases in the following format:
[{{"input": {{...}}, "output": ...}}, ...]

Don't output anything else, just output a JSON-like list of test cases."""

    response = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        temperature=0.1,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    raw_response = response.content[0].text
    print(raw_response)
    test_cases = json.loads(raw_response)
    
    if isinstance(test_cases, list) and test_cases:
        result = [Test(**test) for test in test_cases]
        print(result)
        return result
    else:
        raise ValueError("Invalid response format for test cases")

def generate_evalMode(question: Question) -> str:
    print('\n generating eval mode')
    prompt = f"""Determine the appropriate evaluation mode this problen should use when comparing user code output with testcase ground truth output for the code evaluation (code testing):

Title: {question.title}

Question: {question.question}

Input Parameters: {question.inputParameters}

tests : {question.tests}

Possible evaluation modes:
1. "sortedMatch" - The ground truth output is an array, and could be in any order, we need to sort both actual output and ground output array, then assert them equal to determine if user's code is correct
2. "exactMatch" - the ground truth output should be exactly the same as the actual output
3. "listNodeIter" - The output is of type Listnode, which is linkedlist, and we need to compare the iteration of linkedlist value to see if it is user output is equal to groundtruth
4. "other" - if none of those fit the description

Return only one of these modes as a string, without any additional text or explanation. return in this schema <evalMode>[generated eval Mode]</evalMode>"""

    response = client.messages.create(
        model=MODEL,
        max_tokens=40,
        temperature=0,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    raw_response = response.content[0].text.strip()
    
    eval_mode = extract_function_name(raw_response, "evalMode")

    # Validate the response
    valid_modes = ["sortedMatch", "exactMatch", "listNodeIter", "other"]
    if eval_mode not in valid_modes:
        raise ValueError(f"Invalid eval mode: {eval_mode}")
    print("evalMode: ", eval_mode)
    return eval_mode