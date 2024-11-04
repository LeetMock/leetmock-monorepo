import { Client } from "@langchain/langgraph-sdk";
import axios from "axios";
import type { VideoGrant } from "livekit-server-sdk";

import { api, internal } from "./_generated/api";
import { action } from "./_generated/server";

import { DATA_STRUCTURES } from "@/lib/constants";
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
import { getEditorState, getTestCasesState } from "./codeSessionStates";


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
          content: `from data_structure import *\n\n${code}`,
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

export const runTests = action({
  args: {
    language: v.string(),
    sessionId: v.id("sessions"),
    questionId: v.id("questions"),
  },
  handler: async (ctx, { language, sessionId, questionId }): Promise<CodeRunResult> => {

    // Retrieve editor state and test cases state using internal queries
    const editorState = await ctx.runQuery(internal.codeSessionStates.getEditorStateInternal, { sessionId });
    const testCasesState = await ctx.runQuery(internal.codeSessionStates.getTestCasesStateInternal, { sessionId });

    console.log(testCasesState);
    if (!editorState || !testCasesState) {
      throw new Error("Failed to retrieve code or test cases");
    }

    // check if testcase State has expectedOutput
    const question = await ctx.runQuery(api.questions.getById, { questionId });
    if (!question) {
      throw new Error("Question not found");
    }

    // const inputParameters = question.inputParameters[language];
    // validate test cases state
    // const validationResult = validateTestCasesState(testCasesState, inputParameters);

    // if (!validationResult.isValid) {
    //   return {
    //     status: "testcases_invalid",
    //     executionTime: 0,
    //     stdout: undefined,
    //     stderr: undefined,
    //     isError: true,
    //     exception: validationResult.errors.join(', '),
    //   };
    // }

    const testCode = generateTestCode(question, language, testCasesState);

    const payload = {
      language,
      stdin: "",
      files: [
        {
          name: `tests.${getFileExtension(language)}`,
          content: `from data_structure import *\n\n${testCode}`,
        },
        {
          name: `data_structure.${getFileExtension(language)}`,
          content: DATA_STRUCTURES[language],
        },
        {
          name: `solution.${getFileExtension(language)}`,
          content: `from data_structure import *\n\n${editorState.content}`,
        },
      ],
    };

    const result = await executeCode(payload);
    if (result.status === "success" && result.stdout) {
      try {
        const jsonMatch = result.stdout.match(/START_RESULTS_JSON\n([\s\S]*?)\nEND_RESULTS_JSON/);
        if (jsonMatch && jsonMatch[1]) {
          const parsedResults: RunTestResult = JSON.parse(jsonMatch[1]);
          return {
            ...result,
            testResults: parsedResults,
          };
        }
      } catch (error) {
        console.error("Error parsing test results:", error);
      }
    }

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
    session_id: v.id("sessions"),
    question_title: v.string(),
    question_content: v.string(),
    agent_thread_id: v.string(),
    assistant_id: v.string(),
    session_status: v.string(),
    question_id: v.id("questions"),
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

    return {
      session_id: sessionId,
      question_title: question.title,
      question_content: question.question,
      agent_thread_id: session.agentThreadId,
      assistant_id: session.assistantId,
      session_status: session.sessionStatus,
      question_id: question._id,
    };
  },
});
