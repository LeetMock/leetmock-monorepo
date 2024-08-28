import { action, query } from "./_generated/server";
import { v } from "convex/values";
import axios from 'axios';
import { api } from "./_generated/api";

function getFileExtension(language: string): string {
  const extensionMap: { [key: string]: string } = {
    python: "py",
    javascript: "js",
    java: "java",
    cpp: "cpp"
  };
  return extensionMap[language] || "txt";
}

export const runCode = action({
  args: {
    language: v.string(),
    code: v.string(),
    questionId: v.id("questions"),
  },
  handler: async (ctx, { language, code, questionId }) => {
    const question = await ctx.runQuery(api.questions.getById, { questionId });
    if (!question) {
      throw new Error("Question not found");
    }

    const url = "https://onecompiler-apis.p.rapidapi.com/api/v1/run";

    const testCode = generateTestCode(question);
    // console.log(testCode);

    const payload = {
      language,
      stdin: "",
      files: [
        {
            name: "tests.py",
            content: testCode
        },
        {
          name: `solution.${getFileExtension(language)}`,
          content: code
        }
      ]
    };

    const headers = {
      'Content-Type': 'application/json',
      'x-rapidapi-host': 'onecompiler-apis.p.rapidapi.com',
      'x-rapidapi-key': process.env.RAPIDAPI_KEY
    };

    try {
      const response = await axios.post(url, payload, { headers });
      console.log(response);
      return response.data;
    } catch (error) {
      console.error('Error running code:', error);
      throw new Error('Failed to run code');
    }
  },
});

function generateTestCode(question: any): string {
  const { function_name, inputParameters, tests } = question;
  
  let testCode = `
import unittest
from solution import ${function_name}

class TestSolution(unittest.TestCase):
`;

  tests.forEach((test: any, index: number) => {
    const inputArgs = inputParameters.map((param: string) => JSON.stringify(test.input[param])).join(", ");
    testCode += `
    def test_case_${index + 1}(self):
        self.assertEqual(${function_name}(${inputArgs}), ${JSON.stringify(test.output)})
        print("testcase ${index + 1} passed!!")
`;
  });

  testCode += `
if __name__ == '__main__':
    unittest.main()
`;

  return testCode;
}
