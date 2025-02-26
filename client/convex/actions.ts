import { Client } from "@langchain/langgraph-sdk";
import axios from "axios";
import type { VideoGrant } from "livekit-server-sdk";

import { api, internal } from "./_generated/api";
import { action } from "./_generated/server";

import { CODE_PREFIX, DATA_STRUCTURES } from "@/lib/constants";
import { CodeRunResult, RunCodeResult, RunTestResult, TokenResult } from "@/lib/types";
import {
  createToken,
  generateRandomAlphanumeric,
  generateTestCode,
  getFileExtension,
  isDefined,
} from "@/lib/utils";
import { ConvexError, v } from "convex/values";

import { retry } from "@lifeomic/attempt";
import { userAction } from "./functions";

async function executeCode(payload: any, maxRetries = 3): Promise<CodeRunResult> {
  const url = "https://onecompiler-apis.p.rapidapi.com/api/v1/run";
  const headers = {
    "Content-Type": "application/json",
    "x-rapidapi-host": "onecompiler-apis.p.rapidapi.com",
    "x-rapidapi-key": process.env.RAPIDAPI_KEY,
  };

  try {
    const result = await retry(
      async () => {
        const response = await axios.post(url, payload, { headers });
        const data = response.data;
        return {
          status: data.status,
          executionTime: data.executionTime,
          stdout: data.stdout || undefined,
          stderr: data.stderr || undefined,
          isError: data.status !== "success",
          exception: data.exception || undefined,
        };
      },
      {
        maxAttempts: maxRetries,
        delay: 1000,
        factor: 2,
        jitter: true,
        handleError: (err, context) => {
          console.error(`Attempt ${context.attemptNum + 1} failed:`, err);
        },
      }
    );

    return result;
  } catch (error) {
    console.error("Error running code after max retries:", error);
    return {
      status: "error",
      executionTime: 0,
      stdout: undefined,
      stderr: undefined,
      isError: true,
      exception: "Failed to run code after multiple attempts",
    };
  }
}

export const createAgentThread = userAction({
  args: {
    graphId: v.string(),
  },
  handler: async (ctx, { graphId }) => {
    const apiKey = process.env.LANGSMITH_API_KEY;
    const apiUrl = process.env.LANGGRAPH_API_URL;
    const client = new Client({ apiKey, apiUrl });

    const thread = await client.threads.create();
    const assistants = await client.assistants.search({ graphId });

    if (assistants.length === 0) {
      throw new Error("No assistants found");
    }

    const assistant = assistants[0];

    return {
      threadId: thread.thread_id,
      assistantId: assistant.assistant_id,
    };
  },
});

export const scheduleEval = userAction({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    const result = await ctx.runMutation(internal.jobs.create, {
      sessionId,
      status: "pending",
      lastUpdate: Date.now(),
      numRetries: 0,
    });

    if (result.status === "failed") {
      throw new Error(result.status);
    }

    return {
      success: true,
    };
  },
});

export const getToken = userAction({
  handler: async (ctx) => {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    if (!apiKey || !apiSecret) {
      throw new Error("Environment variables aren't set up correctly");
    }

    // TODO: May change these
    const roomName = `room-${generateRandomAlphanumeric(4)}-${generateRandomAlphanumeric(4)}`;
    const userIdentity = `identity-${generateRandomAlphanumeric(4)}`;

    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    };

    const token = await createToken(apiKey, apiSecret, { identity: userIdentity }, grant);
    const result: TokenResult = {
      identity: userIdentity,
      accessToken: token,
    };

    return result;
  },
});

export const runCode = action({
  args: {
    language: v.string(),
    code: v.string(),
  },
  handler: async (ctx, { language, code }): Promise<RunCodeResult | undefined> => {
    const payload = {
      language,
      stdin: "",
      files: [
        {
          name: `solution.${getFileExtension(language)}`,
          content: `${CODE_PREFIX[language]}\n${code}`,
        },
        {
          name: `data_structure.${getFileExtension(language)}`,
          content: DATA_STRUCTURES[language],
        },
      ],
    };

    const result = await executeCode(payload);

    return result
      ? {
        status: !result.isError, //true if API call was successful
        executionTime: result.executionTime,
        isError: !!result.stderr, //true if there's an error in the code
        output: result.stderr || result.stdout || "",
      }
      : undefined;
  },
});

// a function that run groundtruh test on candidate's code
export const runGroundTruthTest = action({
  args: {
    language: v.string(),
    code: v.string(),
    questionId: v.id("questions"),
  },
  returns: v.array(
    v.object({
      caseNumber: v.number(),
      passed: v.boolean(),
      input: v.record(v.string(), v.any()),
      expected: v.any(),
      actual: v.any(),
      error: v.union(v.string(), v.null()),
      stdout: v.union(v.string(), v.null()),
    })
  ),
  handler: async (ctx, { language, code, questionId }) => {
    // access question test cases
    const question = await ctx.runQuery(api.questions.getById, { questionId });
    if (!question) {
      throw new Error("Question not found");
    }

    // change 'output' to 'expectedOutput'
    const testCases = question.tests.map((test) => {
      const { output, ...rest } = test;
      return {
        ...rest,
        expectedOutput: output,
      };
    });

    let currentBatchSize = 4; // Start with original batch size
    const allTestResults: RunTestResult = [];
    let globalCaseNumber = 0; // Track the overall test case number

    // Process test cases with dynamic batch size
    for (let i = 0; i < testCases.length;) {
      const batchTestCases = testCases.slice(i, i + currentBatchSize);
      const testCode = generateTestCode(question, language, batchTestCases);
      const payload = {
        language,
        stdin: "",
        files: [
          {
            name: `tests.${getFileExtension(language)}`,
            content: `${CODE_PREFIX[language]}\n${testCode}`,
          },
          {
            name: `data_structure.${getFileExtension(language)}`,
            content: DATA_STRUCTURES[language],
          },
          {
            name: `solution.${getFileExtension(language)}`,
            content: `${CODE_PREFIX[language]}\n${code}`,
          },
        ],
      };

      const maxRetries = 3;
      let retryCount = 0;
      let success = false;

      while (retryCount < maxRetries) {
        const result = await executeCode(payload);
        if (result.status === "success" && result.stdout) {
          try {
            const jsonMatch = result.stdout.match(
              /START_RESULTS_JSON\n([\s\S]*?)\nEND_RESULTS_JSON/
            );
            if (jsonMatch && jsonMatch[1]) {
              const batchResult: RunTestResult = JSON.parse(jsonMatch[1]);
              // Adjust case numbers to be consecutive
              const adjustedResults = batchResult.map((result) => ({
                ...result,
                caseNumber: ++globalCaseNumber,
              }));
              allTestResults.push(...adjustedResults);
              success = true;
              break;
            }
          } catch (error) {
            console.error("Error parsing test results:", error);
          }
        }

        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`Retrying test execution (attempt ${retryCount + 1}/${maxRetries})...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      if (success) {
        // Move to next batch if successful
        i += currentBatchSize;
      } else {
        // Reduce batch size and retry from current position if all retries failed
        currentBatchSize = Math.max(1, Math.floor(currentBatchSize / 2));
        console.log(`Reducing batch size to ${currentBatchSize} and retrying...`);

        if (currentBatchSize === 1 && retryCount === maxRetries) {
          // If we're already at batch size 1 and still failing, move to next test case
          console.error(`Failed to process test case at index ${i} even with batch size 1`);
          i += 1;
        }
      }
    }

    return allTestResults;
  },
});

export const runTests = action({
  args: {
    language: v.string(),
    sessionId: v.id("sessions"),
    questionId: v.id("questions"),
  },
  returns: v.object({
    status: v.string(),
    executionTime: v.optional(v.number()),
    stdout: v.optional(v.string()),
    stderr: v.optional(v.string()),
    isError: v.boolean(),
    exception: v.optional(v.string()),
    testResults: v.optional(
      v.array(
        v.object({
          caseNumber: v.number(),
          passed: v.boolean(),
          input: v.record(v.string(), v.any()),
          expected: v.any(),
          actual: v.any(),
          error: v.union(v.string(), v.null()),
          stdout: v.union(v.string(), v.null()),
        })
      )
    ),
  }),
  handler: async (ctx, { language, sessionId, questionId }) => {
    // Retrieve editor state and test cases state using internal queries
    const editorState = await ctx.runQuery(internal.codeSessionStates.getEditorStateInternal, {
      sessionId,
    });
    const testCasesState = await ctx.runQuery(
      internal.codeSessionStates.getTestCasesStateInternal,
      { sessionId }
    );

    if (!editorState || !testCasesState) {
      throw new Error("Failed to retrieve code or test cases");
    }

    // check if testcase State has expectedOutput
    const question = await ctx.runQuery(api.questions.getById, { questionId });
    if (!question) {
      throw new Error("Question not found");
    }

    const testCode = generateTestCode(question, language, testCasesState);
    const payload = {
      language,
      stdin: "",
      files: [
        {
          name: `tests.${getFileExtension(language)}`,
          content: `${CODE_PREFIX[language]}\n${testCode}`,
        },
        {
          name: `data_structure.${getFileExtension(language)}`,
          content: DATA_STRUCTURES[language],
        },
        {
          name: `solution.${getFileExtension(language)}`,
          content: `${CODE_PREFIX[language]}\n${editorState.content}`,
        },
      ],
    };

    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      const execResult = await executeCode(payload);
      if (execResult.status === "success" && execResult.stdout) {
        try {
          const jsonMatch = execResult.stdout.match(
            /START_RESULTS_JSON\n([\s\S]*?)\nEND_RESULTS_JSON/
          );
          if (jsonMatch && jsonMatch[1]) {
            const parsedResults: RunTestResult = JSON.parse(jsonMatch[1]);
            return {
              status: execResult.status,
              executionTime: execResult.executionTime,
              stdout: execResult.stdout,
              stderr: execResult.stderr,
              isError: execResult.isError,
              exception: execResult.exception,
              testResults: parsedResults,
            };
          }
        } catch (error) {
          console.error("Error parsing test results:", error);
        }
      }

      retryCount++;
      if (retryCount < maxRetries) {
        console.log(`Retrying test execution (attempt ${retryCount + 1}/${maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Return a properly structured error response when all retries fail
    return {
      status: "error",
      isError: true,
      exception: "Failed to execute tests after all retries",
    };
  },
});

// ============================================================================
// Below are actions used for agent server
// ============================================================================
// TODO: should check user identity, but this api is used by the agent server so we skip that for now
export const getSessionMetadata = action({
  args: {
    sessionId: v.id("sessions"),
  },
  returns: v.object({
    sessionId: v.id("sessions"),
    questionId: v.id("questions"),
    questionTitle: v.string(),
    questionContent: v.string(),
    agentThreadId: v.string(),
    assistantId: v.string(),
    sessionStatus: v.string(),
    voice: v.string(),
    interviewType: v.string(),
    interviewMode: v.string(),
    interviewFlow: v.array(v.string()),
    programmingLanguage: v.union(v.string(), v.null()),
    modelName: v.string(),
    metadata: v.record(v.string(), v.any()),
  }),
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.runQuery(internal.sessions.getByIdInternal, {
      sessionId,
    });
    if (!isDefined(session)) {
      throw new ConvexError({
        name: "SessionNotFound",
        message: "Session not found",
      });
    }

    const question = await ctx.runQuery(internal.questions.getByIdInternal, {
      questionId: session.questionId,
    });
    if (!isDefined(question)) {
      throw new ConvexError({
        name: "QuestionNotFound",
        message: "Question not found",
      });
    }

    const {
      agentThreadId,
      assistantId,
      sessionStatus,
      voice,
      interviewType,
      interviewMode,
      interviewFlow,
      programmingLanguage,
      modelName,
      metadata,
    } = session;
    const { _id: questionId, title: questionTitle, question: questionContent } = question;

    return {
      sessionId,
      questionId,
      questionTitle,
      questionContent,
      agentThreadId,
      assistantId,
      sessionStatus,
      voice,
      interviewType,
      interviewMode,
      interviewFlow,
      programmingLanguage,
      modelName,
      metadata,
    };
  },
});

export const scrapeQuestion = action({
  args: {
    titleSlug: v.string()
  },
  returns: v.object({
    companyTagStats: v.string(),
    difficulty: v.string(),
    dislikes: v.number(),
    exampleTestcases: v.string(),
    hints: v.array(v.any()),
    isPaidOnly: v.boolean(),
    likes: v.number(),
    link: v.string(),
    question: v.string(),
    questionFrontendId: v.string(),
    questionId: v.string(),
    questionTitle: v.string(),
    similarQuestions: v.string(),
    solution: v.object({
      canSeeDetail: v.boolean(),
      hasVideoSolution: v.boolean(),
      id: v.string(),
      paidOnly: v.boolean(),
      paidOnlyVideo: v.boolean()
    }),
    titleSlug: v.string(),
    topicTags: v.array(v.object({
      name: v.string(),
      slug: v.string(),
      translatedName: v.union(v.string(), v.null())
    }))
  }),
  handler: async (ctx, { titleSlug }) => {
    // Process the title: replace spaces with hyphens, then convert to lowercase
    const processedTitleSlug = titleSlug
      .replace(/\s+/g, '-')  // First replace spaces with hyphens
      .toLowerCase();        // Convert to lowercase

    console.log(`Attempting to fetch question data for: ${processedTitleSlug}`);

    // Implement retry logic
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Set a timeout for the fetch operation
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        // Call the external API
        const response = await fetch(
          `https://leet-code-api-d5hd.vercel.app/select?titleSlug=${processedTitleSlug}`,
          { signal: controller.signal }
        );

        // Clear the timeout
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Successfully fetched question data on attempt ${attempt}`);
        return data;
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt}/${maxRetries} failed:`, error);

        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // If we've exhausted all retries, throw a more descriptive error
    throw new Error(`Failed to fetch question data after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  },
});

export const generateQuestion = action({
  args: {
    questionTitle: v.string(),
    questionContent: v.string(),
  },
  returns: v.object({
    functionName: v.string(),
    inputParameters: v.record(v.string(), v.record(v.string(), v.string())),
    tests: v.array(v.object({
      input: v.record(v.string(), v.any()),
      output: v.any()
    })),
    evalMode: v.string()
  }),
  handler: async (ctx, { questionTitle, questionContent }) => {
    // Set up Anthropic client
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }

    // Use axios instead of Anthropic SDK
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    };

    // Generate function name
    const functionNamePrompt = `Generate a concise and informative function name for the following LeetCode question:\n\n${questionTitle}\n\n${questionContent}\n\n return in this schema <functionName>[generated function Name]</functionName>`;

    const functionNameResponse = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 50,
        messages: [{ role: "user", content: functionNamePrompt }]
      },
      { headers }
    );

    const functionNameRaw = functionNameResponse.data.content[0].text;
    const functionNameMatch = functionNameRaw.match(/<functionName>(.*?)<\/functionName>/);
    const functionName = functionNameMatch ? functionNameMatch[1] : "solution";

    // Generate input parameters
    const exampleParams = [
      {
        "cpp": { "k": "int", "nums": "vector<int>" },
        "java": { "k": "int", "nums": "int[]" },
        "javascript": { "k": "number", "nums": "number[]" },
        "python": { "k": "int", "nums": "List[int]" },
      },
      {
        "cpp": { "l1": "ListNode*", "l2": "ListNode*" },
        "java": { "l1": "ListNode", "l2": "ListNode" },
        "javascript": { "l1": "ListNode", "l2": "ListNode" },
        "python": {
          "l1": "Optional[ListNode]",
          "l2": "Optional[ListNode]",
        },
      }
    ];

    const inputParamsPrompt = `You are a LeetCode expert. Generate input parameters for this question:

Title: ${questionTitle}

Question: ${questionContent}

Example outputs:
${JSON.stringify(exampleParams, null, 2)}

Provide input parameters for each language as shown above. Don't output anything else, just output an json like object contains the inputParamter for those languages`;

    const inputParamsResponse = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        temperature: 0,
        messages: [{ role: "user", content: inputParamsPrompt }]
      },
      { headers }
    );

    let inputParameters = JSON.parse(inputParamsResponse.data.content[0].text);
    if (Array.isArray(inputParameters) && inputParameters.length > 0) {
      inputParameters = inputParameters[0];
    }

    // Generate test cases
    const exampleTests = [
      { 'input': { 'nums': [3, 1, 5, 8] }, 'output': 167 },
      { 'input': { 'nums': [1, 5] }, 'output': 10 },
    ];

    const testsPrompt = `Generate 10 test cases for the following LeetCode question:

Question Title: ${questionTitle}

Question Description: ${questionContent}

Input Parameter: ${JSON.stringify(inputParameters)}

Example Testcases for MaxCoin:
${JSON.stringify(exampleTests)} 

Instructions:
1. Strictly follow testcase requirment in question description
2. use parameter name in Input Parameters
3. Make sure to generate good quality testcases, try to test different aspect of the code
4. Most importantly, Provide the test cases in the following format:
[{"input": {...}, "output": ...}, ...]

Don't output anything else, just output a JSON-like list of test cases.`;

    const testsResponse = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 2048,
        temperature: 0.1,
        messages: [{ role: "user", content: testsPrompt }]
      },
      { headers }
    );

    const tests = JSON.parse(testsResponse.data.content[0].text);

    // Generate eval mode
    const evalModePrompt = `Determine the appropriate evaluation mode this problen should use when comparing user code output with testcase ground truth output for the code evaluation (code testing):

Title: ${questionTitle}

Question: ${questionContent}

Input Parameters: ${JSON.stringify(inputParameters)}

tests : ${JSON.stringify(tests)}

Possible evaluation modes:
1. "sortedMatch" - The ground truth output is an array, and could be in any order, we need to sort both actual output and ground output array, then assert them equal to determine if user's code is correct
2. "exactMatch" - the ground truth output should be exactly the same as the actual output
3. "listNodeIter" - The output is of type Listnode, which is linkedlist, and we need to compare the iteration of linkedlist value to see if it is user output is equal to groundtruth
4. "other" - if none of those fit the description

Return only one of these modes as a string, without any additional text or explanation. return in this schema <evalMode>[generated eval Mode]</evalMode>`;

    const evalModeResponse = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 40,
        temperature: 0,
        messages: [{ role: "user", content: evalModePrompt }]
      },
      { headers }
    );

    const evalModeRaw = evalModeResponse.data.content[0].text.trim();
    const evalModeMatch = evalModeRaw.match(/<evalMode>(.*?)<\/evalMode>/);
    const evalMode = evalModeMatch ? evalModeMatch[1] : "exactMatch";

    // Validate the eval mode
    const validModes = ["sortedMatch", "exactMatch", "listNodeIter", "other"];
    if (!validModes.includes(evalMode)) {
      throw new Error(`Invalid eval mode: ${evalMode}`);
    }

    return {
      functionName,
      inputParameters,
      tests,
      evalMode
    };
  },
});

export const generateSolution = action({
  args: {
    questionTitle: v.string(),
    questionContent: v.string(),
    functionName: v.string(),
    inputParameters: v.record(v.string(), v.record(v.string(), v.string())),
    outputType: v.string(),
    language: v.string(),
  },
  returns: v.object({
    solution: v.string()
  }),
  handler: async (ctx, { questionTitle, questionContent, functionName, inputParameters, outputType, language }) => {
    // Set up Anthropic client
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }

    // Use axios instead of Anthropic SDK
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    };

    // Format input parameters for the selected language
    const langParams = inputParameters[language] || {};
    const paramString = Object.entries(langParams)
      .map(([name, type]) => `${name}: ${type}`)
      .join(", ");

    // Customize prompt based on language
    let prompt;
    if (language === "python") {
      prompt = `You are an expert Python programmer. Write a solution for the following coding problem:

Question Title: ${questionTitle}

Problem Description:
${questionContent}

Write your solution inside a class named 'Solution' with a method named '${functionName}' that takes the following parameters:
self, ${paramString}

The method should return: ${outputType}

IMPORTANT: 
1. Always include 'self' as the first parameter in the method definition
2. Format your solution exactly like this:
\`\`\`python
class Solution:
    def ${functionName}(self, ${paramString}):
        # Your solution code here
\`\`\`

Please provide only the solution code without explanations. Make sure your solution is:
1. Correct and handles all edge cases
2. Efficient in terms of time and space complexity
3. Well-commented to explain the approach`;
    } else {
      // For other languages
      prompt = `You are an expert programmer. Write a solution for the following coding problem in ${language}:

Question Title: ${questionTitle}

Problem Description:
${questionContent}

Write a function named '${functionName}' that takes the following parameters:
${paramString}

The function should return: ${outputType}

Please provide only the solution code without explanations. Make sure your solution is:
1. Correct and handles all edge cases
2. Efficient in terms of time and space complexity
3. Well-commented to explain the approach
4. Following best practices for ${language}`;
    }

    try {
      const response = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 4000,
          temperature: 0.2,
          messages: [{ role: "user", content: prompt }]
        },
        { headers }
      );

      // Extract code from response
      const content = response.data.content[0].text;

      // Clean up the response to extract just the code
      // This handles cases where Claude might add markdown code blocks
      let solution = content;
      const codeBlockMatch = content.match(/```[\w]*\n([\s\S]*?)```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        solution = codeBlockMatch[1];
      }

      // For Python, ensure the solution has a class structure if not already present
      if (language === "python" && !solution.includes("class Solution:")) {
        solution = `class Solution:\n    def ${functionName}(self, ${paramString}):\n${solution.split('\n').map(line => '        ' + line).join('\n')}`;
      }

      return { solution };
    } catch (error) {
      console.error("Error generating solution:", error);
      throw new Error(`Failed to generate solution: ${error}`);
    }
  },
});