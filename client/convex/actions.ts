import { Client } from "@langchain/langgraph-sdk";
import axios from "axios";
import type { VideoGrant } from "livekit-server-sdk";

import { api, internal } from "./_generated/api";
import { userAction } from "./functions";
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

export const createAgentThread = action({
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

export const triggerEval = userAction({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    const apiKey = process.env.LANGSMITH_API_KEY;
    if (!apiKey) throw new Error("LANGSMITH_API_KEY not found");
    const apiUrl = process.env.LANGGRAPH_API_URL;

    const response = await fetch(apiUrl + "/runs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({
        assistant_id: "eval-agent",
        input: {
          session_id: sessionId,
        },
      }),
    });
  },
});

export const getToken = action({
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

// a function that run groundtruh test on canidate's code
export const runGroundTruthTest = action({
  args: {
    language: v.string(),
    canidateCode: v.string(),
    questionId: v.id("questions"),
  },
  handler: async (ctx, { language, canidateCode, questionId }) => {
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

    const BATCH_SIZE = 4;
    const allTestResults: RunTestResult[] = [];

    // Process test cases in batches
    for (let i = 0; i < testCases.length; i += BATCH_SIZE) {
      const batchTestCases = testCases.slice(i, i + BATCH_SIZE);
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
            content: `${CODE_PREFIX[language]}\n${canidateCode}`,
          },
        ],
      };

      const maxRetries = 3;
      let retryCount = 0;
      let result;

      while (retryCount < maxRetries) {
        result = await executeCode(payload);
        if (result.status === "success" && result.stdout) {
          try {
            const jsonMatch = result.stdout.match(/START_RESULTS_JSON\n([\s\S]*?)\nEND_RESULTS_JSON/);
            if (jsonMatch && jsonMatch[1]) {
              const batchResults: RunTestResult[] = JSON.parse(jsonMatch[1]);
              allTestResults.push(...batchResults);
              break; // Success, exit the retry loop
            }
          } catch (error) {
            console.error("Error parsing test results:", error);
          }
        }

        // If we get here, either the execution failed or parsing failed
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`Retrying test execution (attempt ${retryCount + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        }
      }
    }

    return allTestResults

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

    const result = await executeCode(payload);
    if (result.status === "success" && result.stdout) {
      try {
        const jsonMatch = result.stdout.match(/START_RESULTS_JSON\n([\s\S]*?)\nEND_RESULTS_JSON/);
        if (jsonMatch && jsonMatch[1]) {
          const parsedResults: RunTestResult = JSON.parse(jsonMatch[1]);
          console.log({
            ...result,
            testResults: parsedResults,
          });
          return {
            ...result,
            testResults: parsedResults,
          };
        }
      } catch (error) {
        console.error("Error parsing test results:", error);
      }
    }

    console.log("result", result);
    return result;
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
    metadata: v.record(v.string(), v.any()),
  }),
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.runQuery(internal.sessions.getByIdInternal, { sessionId });
    if (!isDefined(session)) {
      throw new ConvexError({ name: "SessionNotFound", message: "Session not found" });
    }

    const question = await ctx.runQuery(internal.questions.getByIdInternal, {
      questionId: session.questionId,
    });
    if (!isDefined(question)) {
      throw new ConvexError({ name: "QuestionNotFound", message: "Question not found" });
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
      metadata,
    };
  },
});
