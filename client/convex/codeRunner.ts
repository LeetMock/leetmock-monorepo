import { action, query } from "./_generated/server";
import { v } from "convex/values";
import axios from "axios";
import { api } from "./_generated/api";

interface CodeRunResult {
  status: string;
  executionTime: number;
  stdout: string | null;
  stderr: string | null;
  isError: boolean;
  exception: string | null;
}

function getFileExtension(language: string): string {
  const extensionMap: { [key: string]: string } = {
    python: "py",
    javascript: "js",
    java: "java",
    cpp: "cpp",
  };
  return extensionMap[language] || "txt";
}

export const runTests = action({
  args: {
    language: v.string(),
    code: v.string(),
    questionId: v.id("questions"),
  },
  handler: async (ctx, { language, code, questionId }): Promise<CodeRunResult> => {
    const question = await ctx.runQuery(api.questions.getById, { questionId });
    if (!question) {
      throw new Error("Question not found");
    }

    const url = "https://onecompiler-apis.p.rapidapi.com/api/v1/run";

    const testCode = generateTestCode(question);

    const payload = {
      language,
      stdin: "",
      files: [
        {
          name: "tests.py",
          content: testCode,
        },
        {
          name: `solution.${getFileExtension(language)}`,
          content: code,
        },
      ],
    };

    const headers = {
      "Content-Type": "application/json",
      "x-rapidapi-host": "onecompiler-apis.p.rapidapi.com",
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
    };

    try {
      const response = await axios.post(url, payload, { headers });
      const data = response.data;
      console.log(data);
      return {
        status: data.status,
        executionTime: data.executionTime,
        stdout: data.stdout || null,
        stderr: data.stderr || null,
        isError: data.status !== 'success',
        exception: data.exception || null,
      };
    } catch (error) {
      console.error("Error running code:", error);
      return {
        status: 'error',
        executionTime: 0,
        stdout: null,
        stderr: null,
        isError: true,
        exception: 'Failed to run code',
      };
    }
  },
});

export const runCode = action({
  args: {
    language: v.string(),
    code: v.string(),
  },
  handler: async (ctx, { language, code }): Promise<CodeRunResult> => {
    const url = "https://onecompiler-apis.p.rapidapi.com/api/v1/run";

    const payload = {
      language,
      stdin: "",
      files: [
        {
          name: `solution.${getFileExtension(language)}`,
          content: code,
        },
      ],
    };

    const headers = {
      "Content-Type": "application/json",
      "x-rapidapi-host": "onecompiler-apis.p.rapidapi.com",
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
    };

    try {
      const response = await axios.post(url, payload, { headers });
      const data = response.data;
      console.log(data);
      return {
        status: data.status,
        executionTime: data.executionTime,
        stdout: data.stdout || null,
        stderr: data.stderr || null,
        isError: data.status !== 'success',
        exception: data.exception || null,
      };
    } catch (error) {
      console.log("error", error);
      return {
        status: 'error',
        executionTime: 0,
        stdout: null,
        stderr: null,
        isError: true,
        exception: 'Failed to run code',
      };
    }
  },
});

function generateTestCode(question: any): string {
  const { functionName, inputParameters, tests } = question;

  let testCode = `
import unittest
from solution import Solution

class TestSolution(unittest.TestCase):
`;

  tests.forEach((test: any, index: number) => {
    const selectedParams = inputParameters.filter((_, i) => i % 2 === 0);
    const inputArgs = selectedParams
      .map((param: string) => JSON.stringify(test.input[param]))
      .join(", ");

    testCode += `
    def test_case_${index + 1}(self):
        solution = Solution()
        result = solution.${functionName}(${inputArgs})
        try:
            self.assertEqual(result, ${JSON.stringify(test.output)})
            print("Test case ${index + 1} passed!")
        except AssertionError:
            print("Test case ${index + 1} failed:")
            print("Input:", ${inputArgs})
            print("Expected output:", ${JSON.stringify(test.output)})
            print("Your output:", result)
        print("-" * 40)  # Dividing line
`;
  });

  testCode += `
if __name__ == '__main__':
    unittest.main()
`;

  return testCode;
}
