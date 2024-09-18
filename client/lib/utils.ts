import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AccessTokenOptions, VideoGrant } from "livekit-server-sdk";
import { AccessToken } from "livekit-server-sdk";

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

export const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
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

export function generateTestCode(question: any): string {
  const { functionName, inputParameters, tests } = question;

  let testCode = `
import unittest
import json
from solution import Solution

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

  tests.forEach((test: any, index: number) => {
    const selectedParams = inputParameters.filter((_, i) => i % 2 === 0);
    const inputArgs = selectedParams
      .map((param: string) => JSON.stringify(test.input[param]))
      .join(", ");

    testCode += `
    def test_case_${index + 1}(self):
        try:
            solution = Solution()
            result = solution.${functionName}(${inputArgs})
            expected = ${JSON.stringify(test.output)}
            passed = result == expected
            self.__class__.results.append({
                "caseNumber": ${index + 1},
                "passed": passed,
                "input": ${JSON.stringify(test.input)},
                "expected": expected,
                "actual": result,
                "error": None
            })
        except Exception as e:
            self.__class__.results.append({
                "caseNumber": ${index + 1},
                "passed": False,
                "input": ${JSON.stringify(test.input)},
                "expected": ${JSON.stringify(test.output)},
                "actual": None,
                "error": str(e)
            })
`;
  });

  testCode += `
if __name__ == '__main__':
    unittest.main(argv=[''], exit=False)
`;

  return testCode;
}

export const isDefined = <T>(value: T): value is Exclude<T, undefined | null> => {
  return value !== undefined && value !== null;
};
