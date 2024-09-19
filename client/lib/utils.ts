import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AccessTokenOptions, VideoGrant } from "livekit-server-sdk";
import { AccessToken } from "livekit-server-sdk";
import { BG_COLORS } from "./constants";
import { type DefinedObject, type Defined } from "./types";
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
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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

export function getTimeDurationSeconds(startTime: number, endTime: number): number {
  return Math.floor((endTime - startTime) / 1000);
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
}

export function generateTestCode(question: any, language: string): string {
  switch (language) {
    case 'python':
      return generatePythonTestCode(question);
    case 'java':
      return generateJavaTestCode(question);
    case 'cpp':
      return generateCppTestCode(question);
    case 'javascript':
      return generateJavaScriptTestCode(question);
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}

function generatePythonTestCode(question: Question): string {
  const { functionName, inputParameters, tests, evalMode } = question;
  const params = inputParameters['python'];

  let testCode = `
import unittest
import json
import traceback

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def arrayToListNode(arr):
    dummy = ListNode(0)
    current = dummy
    for val in arr:
        current.next = ListNode(val)
        current = current.next
    return dummy.next

def listToArray(node):
    result = []
    while node:
        result.append(node.val)
        node = node.next
    return result

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

  tests.slice(0,5).forEach((test, index) => {
    const inputArgs = params
      .filter((_, i) => i % 2 === 0)
      .map((param, i) => {
        const paramType = params[i * 2 + 1];
        if (paramType === 'Optional[ListNode]' || paramType === 'ListNode') {
          return `arrayToListNode(${JSON.stringify(test.input[param])})`;
        }
        return JSON.stringify(test.input[param]);
      })
      .join(", ");

    let comparisonCode;
    switch (evalMode) {
      case "exactMatch":
        comparisonCode = `passed = (result == expected)`;
        break;
      case "ListNodeIter":
        comparisonCode = `passed = (listToArray(result) == expected)`;
        break;
      case "SortedMatch":
        comparisonCode = `passed = (sorted(result) == sorted(expected))`;
        break;
      default:
        comparisonCode = `passed = (result == expected)`;
    }

    testCode += `
    def test_case_${index + 1}(self):
        try:
            from solution import Solution
            sol = Solution()
            result = sol.${functionName}(${inputArgs})
            expected = ${JSON.stringify(test.output)}
            ${comparisonCode}
            self.__class__.results.append({
                "caseNumber": ${index + 1},
                "passed": passed,
                "input": ${JSON.stringify(test.input)},
                "expected": expected,
                "actual": listToArray(result) if isinstance(result, ListNode) else result,
                "error": None
            })
        except Exception as e:
            self.__class__.results.append({
                "caseNumber": ${index + 1},
                "passed": False,
                "input": ${JSON.stringify(test.input)},
                "expected": ${JSON.stringify(test.output)},
                "actual": None,
                "error": traceback.format_exc()
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
  const params = inputParameters['java'];

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
      .map(param => JSON.stringify(test.input[param]))
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
  const params = inputParameters['cpp'];

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
      .map(param => JSON.stringify(test.input[param]))
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
  const params = inputParameters['javascript'];

  let testCode = `
const assert = require('assert');
const Solution = require('./solution');

const solution = new Solution();
const results = [];

`;

  tests.forEach((test, index) => {
    const inputArgs = params
      .filter((_, i) => i % 2 === 0)
      .map(param => JSON.stringify(test.input[param]))
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

export const isDefined = <T>(value: T): value is Exclude<T, undefined | null> => {
  return value !== undefined && value !== null;
};

export const allDefined = <T extends object>(obj: T): obj is DefinedObject<T> => {
  return Object.values(obj).every(isDefined);
};
