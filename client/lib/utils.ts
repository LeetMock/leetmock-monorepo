import { clsx, type ClassValue } from "clsx";
import type { AccessTokenOptions, VideoGrant } from "livekit-server-sdk";
import { AccessToken } from "livekit-server-sdk";
import { twMerge } from "tailwind-merge";
import { BG_COLORS } from "./constants";
import {
  JsonValue,
  SpecialObject,
  type DefinedObject,
  type Testcase,
} from "./types";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFileExtension(language: string): string {
  const extensionMap: { [key: string]: string } = {
    python: "py",
    javascript: "js",
    java: "java",
    cpp: "cpp",
  };
  return extensionMap[language] || "txt";
}

export function generateRandomAlphanumeric(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export function encode(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

export function getCurrentUnixTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export function getTimeDurationSeconds(
  startTime: number,
  endTime: number
): number {
  return Math.floor((endTime - startTime) / 1000);
}

export function minutesToSeconds(minutes: number): number {
  return minutes * 60;
}

export function minutesToMilliseconds(minutes: number): number {
  return minutes * 60 * 1000;
}

export function secondsToMilliseconds(seconds: number): number {
  return seconds * 1000;
}

export function getInitials(
  firstName: string | null | undefined,
  lastName: string | null | undefined
) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`;
}

export function getFirstLetter(name: string | null | undefined) {
  return name?.[0] ?? "U";
}

export const getRandomColor = () => {
  return BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)];
};

export const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export const toUpperCase = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const createToken = (
  apiKey: string,
  apiSecret: string,
  userInfo: AccessTokenOptions,
  grant: VideoGrant
) => {
  const at = new AccessToken(apiKey, apiSecret, userInfo);
  at.addGrant(grant);
  return at.toJwt();
};

interface InputParameters {
  cpp: string[];
  java: string[];
  javascript: string[];
  python: string[];
}

interface TestCase {
  input: Record<string, any>;
  output: any;
}

interface Question {
  functionName: string;
  inputParameters: InputParameters;
  tests: TestCase[];
  evalMode: string;
  outputParameters: string;
  metaData: Record<string, any>;
}

export function generateTestCode(
  question: any,
  language: string,
  testCasesState: Testcase[]
): string {
  switch (language) {
    case "python":
      return generatePythonTestCode(question, testCasesState);
    case "java":
      return generateJavaTestCode(question);
    case "cpp":
      return generateCppTestCode(question);
    case "javascript":
      return generateJavaScriptTestCode(question);
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}

function toPythonBoolean(value: any): string {
  if (typeof value === "string") {
    return value.toLowerCase() === "true" ? "True" : "False";
  }

  return value ? "True" : "False";
}

export const isSpecialObject = (value: any): value is SpecialObject => {
  return (
    value &&
    typeof value === "object" &&
    "lc" in value &&
    "type" in value &&
    "id" in value &&
    "kwargs" in value
  );
};

export const isPrimitive = (value: any) => {
  return typeof value !== "object" || value === null;
};

export const unwrapSpecialObject = (value: any): JsonValue => {
  if (isSpecialObject(value)) {
    return value.kwargs;
  }

  if (isPrimitive(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => unwrapSpecialObject(item));
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, value]) => [
      key,
      unwrapSpecialObject(value),
    ])
  );
};

function generatePythonTestCode(
  question: Question,
  testCasesState: Testcase[]
): string {
  const { functionName, inputParameters, evalMode, outputParameters, metaData } =
    question;
  const params = inputParameters["python"];

  let testCode = `
import unittest
import json
import traceback
import sys
from io import StringIO
from typing import List, Dict, Any

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def arrayToListNode(arr):
    if not arr:
        return None
    head = ListNode(arr[0])
    current = head
    for val in arr[1:]:
        current.next = ListNode(val)
        current = current.next
    return head

def listToArray(head):
    result = []
    current = head
    while current:
        result.append(current.val)
        current = current.next
    return result

def compare_lists(list1, list2):
    if list1 is None and list2 is None:
        return True
    if list1 is None or list2 is None:
        return False
    if len(list1) != len(list2):
        return False
    return all(str(a) == str(b) for a, b in zip(list1, list2))

class CaptureOutput:
    def __init__(self):
        self.stdout = StringIO()
        self.original_stdout = sys.stdout

    def __enter__(self):
        sys.stdout = self.stdout
        return self.stdout

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout = self.original_stdout

class TestSolution(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.results = []

    @classmethod
    def tearDownClass(cls):
        print("START_RESULTS_JSON")
        print(json.dumps(cls.results))
        print("END_RESULTS_JSON")
`;

  testCasesState.forEach((test, index) => {
    // Determine if we're using compareInPlace mode
    const isCompareInPlace = evalMode === "compareInPlace";
    // Get the parameter to compare for in-place changes
    const compareParameter = isCompareInPlace ? (metaData?.compareParameter || Object.keys(params)[0]) : "";

    // Define expected output for all cases
    const expectedOutput = outputParameters === "boolean"
      ? toPythonBoolean(test.expectedOutput)
      : JSON.stringify(test.expectedOutput);

    // Generate test case
    testCode += `
    def test_case_${index + 1}(self):
        with CaptureOutput() as output:
            try:
                from solution import Solution
                sol = Solution()
`;

    if (isCompareInPlace) {
      // For compareInPlace, we need to define variables first
      const paramVariables = Object.entries(params).map(([paramName, paramType]) => {
        const inputValue = test.input[paramName];
        let valueExpr = inputValue === "" ? '""' : JSON.stringify(inputValue);

        // Handle special case for list nodes
        if (paramType === "Optional[ListNode]" || paramType === "ListNode") {
          valueExpr = `arrayToListNode(${JSON.stringify(inputValue)})`;
        }

        return `                ${paramName} = ${valueExpr}`;
      }).join("\n");

      // Generate function call using variable names directly
      const functionCallArgs = Object.keys(params).join(", ");

      testCode += `
${paramVariables}

                # Call the function with the variables
                result = sol.${functionName}(${functionCallArgs})
                expected = ${expectedOutput}
                
                # For compare in-place, check if the parameter was modified correctly
                passed = compare_lists(${compareParameter}, expected)
                
                self.__class__.results.append({
                    "caseNumber": ${index + 1},
                    "passed": passed,
                    "input": ${JSON.stringify(test.input)},
                    "expected": expected,
                    "actual": ${compareParameter},
                    "error": None,
                    "stdout": output.getvalue()
                })
`;
    } else {
      // Original approach for other evaluation modes
      const inputArgs = Object.entries(params)
        .map(([param, paramType]) => {
          const inputValue = test.input[param];
          if (inputValue === "") return '""';
          if (paramType === "Optional[ListNode]" || paramType === "ListNode") {
            return `arrayToListNode(${JSON.stringify(inputValue)})`;
          }
          return JSON.stringify(inputValue);
        })
        .join(", ");

      let comparisonCode;
      if (outputParameters === "boolean") {
        comparisonCode = `passed = (bool(result) == expected)`;
      } else {
        switch (evalMode) {
          case "exactMatch":
            comparisonCode = `passed = (result == expected)`;
            break;
          case "listNodeIter":
            comparisonCode = `passed = listToArray(result) == expected`;
            break;
          case "sortedMatch":
            comparisonCode = `passed = compare_lists(sorted(result), sorted(expected))`;
            break;
          default:
            comparisonCode = `passed = compare_lists(result, expected)`;
        }
      }

      testCode += `
                result = sol.${functionName}(${inputArgs})
                expected = ${expectedOutput}
                ${comparisonCode}
                
                self.__class__.results.append({
                    "caseNumber": ${index + 1},
                    "passed": passed,
                    "input": ${JSON.stringify(test.input)},
                    "expected": expected,
                    "actual": listToArray(result) if isinstance(result, ListNode) else result,
                    "error": None,
                    "stdout": output.getvalue()
                })
`;
    }

    testCode += `            except Exception as e:
                self.__class__.results.append({
                    "caseNumber": ${index + 1},
                    "passed": False,
                    "input": ${JSON.stringify(test.input)},
                    "expected": ${expectedOutput},
                    "actual": None,
                    "error": traceback.format_exc(),
                    "stdout": output.getvalue()
                })
`;
  });

  testCode += `
if __name__ == '__main__':
    unittest.main(argv=[''], exit=False)
`;

  return testCode;
}

function generateJavaTestCode(question: Question): string {
  const { functionName, inputParameters, tests } = question;
  const params = inputParameters["java"];

  let testCode = `
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import com.fasterxml.jackson.databind.ObjectMapper;

class SolutionTest {
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final Solution solution = new Solution();
`;

  tests.forEach((test, index) => {
    const inputArgs = params
      .filter((_, i) => i % 2 === 0)
      .map((param) => JSON.stringify(test.input[param]))
      .join(", ");

    testCode += `
    @Test
    void testCase${index + 1}() throws Exception {
        var result = solution.${functionName}(${inputArgs});
        var expected = ${JSON.stringify(test.output)};
        assertEquals(expected, result);
        System.out.println(objectMapper.writeValueAsString(new TestResult(${index + 1}, true, ${JSON.stringify(test.input)}, expected, result, null)));
    }
`;
  });

  testCode += `
}

class TestResult {
    public int caseNumber;
    public boolean passed;
    public Object input;
    public Object expected;
    public Object actual;
    public String error;

    public TestResult(int caseNumber, boolean passed, Object input, Object expected, Object actual, String error) {
        this.caseNumber = caseNumber;
        this.passed = passed;
        this.input = input;
        this.expected = expected;
        this.actual = actual;
        this.error = error;
    }
}
`;

  return testCode;
}

function generateCppTestCode(question: Question): string {
  const { functionName, inputParameters, tests } = question;
  const params = inputParameters["cpp"];

  let testCode = `
#include <iostream>
#include <vector>
#include <string>
#include <nlohmann/json.hpp>
#include "solution.h"

using json = nlohmann::json;

int main() {
    Solution solution;
    std::vector<json> results;
`;

  tests.forEach((test, index) => {
    const inputArgs = params
      .filter((_, i) => i % 2 === 0)
      .map((param) => JSON.stringify(test.input[param]))
      .join(", ");

    testCode += `
    try {
        auto result = solution.${functionName}(${inputArgs});
        auto expected = ${JSON.stringify(test.output)};
        bool passed = (result == expected);
        results.push_back({
            {"caseNumber", ${index + 1}},
            {"passed", passed},
            {"input", ${JSON.stringify(test.input)}},
            {"expected", expected},
            {"actual", result},
            {"error", nullptr}
        });
    } catch (const std::exception& e) {
        results.push_back({
            {"caseNumber", ${index + 1}},
            {"passed", false},
            {"input", ${JSON.stringify(test.input)}},
            {"expected", ${JSON.stringify(test.output)}},
            {"actual", nullptr},
            {"error", e.what()}
        });
    }
`;
  });

  testCode += `
    std::cout << "START_RESULTS_JSON" << std::endl;
    std::cout << json(results).dump() << std::endl;
    std::cout << "END_RESULTS_JSON" << std::endl;
    return 0;
}
`;

  return testCode;
}

function generateJavaScriptTestCode(question: Question): string {
  const { functionName, inputParameters, tests } = question;
  const params = inputParameters["javascript"];

  let testCode = `
const assert = require('assert');
const Solution = require('./solution');

const solution = new Solution();
const results = [];

`;

  tests.forEach((test, index) => {
    const inputArgs = params
      .filter((_, i) => i % 2 === 0)
      .map((param) => JSON.stringify(test.input[param]))
      .join(", ");

    testCode += `
try {
    const result = solution.${functionName}(${inputArgs});
    const expected = ${JSON.stringify(test.output)};
    const passed = JSON.stringify(result) === JSON.stringify(expected);
    results.push({
        caseNumber: ${index + 1},
        passed,
        input: ${JSON.stringify(test.input)},
        expected,
        actual: result,
        error: null
    });
} catch (error) {
    results.push({
        caseNumber: ${index + 1},
        passed: false,
        input: ${JSON.stringify(test.input)},
        expected: ${JSON.stringify(test.output)},
        actual: null,
        error: error.message
    });
}
`;
  });

  testCode += `
console.log("START_RESULTS_JSON");
console.log(JSON.stringify(results));
console.log("END_RESULTS_JSON");
`;

  return testCode;
}

export const isDefined = <T>(
  value: T
): value is Exclude<T, undefined | null> => {
  return value !== undefined && value !== null;
};

export const allDefined = <T extends object>(
  obj: T
): obj is DefinedObject<T> => {
  return Object.values(obj).every(isDefined);
};

export const get30DaysFromNowInSeconds = (
  current_time: number = Date.now()
) => {
  return current_time + 30 * 24 * 60 * 60;
};

export function formatEpochTimeMilliseconds(epochTime: number) {
  const date = new Date(epochTime);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
