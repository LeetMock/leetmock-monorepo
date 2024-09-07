import axios from "axios";
import { Client } from "@langchain/langgraph-sdk";
import type { VideoGrant } from "livekit-server-sdk";

import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";

import {
  createToken,
  generateRandomAlphanumeric,
  getFileExtension,
  generateTestCode,
  isDefined,
} from "@/lib/utils";
import { TokenResult, CodeRunResult, RunCodeResult } from "@/lib/types";
import { ConvexError, v } from "convex/values";

function formatRuntimeError(stderr: string): string {
  const lines = stderr.split("\n");
  let formattedError = "";
  let isRelevantError = false;

  for (const line of lines) {
    if (line.startsWith("Traceback") || line.startsWith('  File "/solution.py"')) {
      isRelevantError = true;
    }
    if (isRelevantError) {
      if (line.startsWith('  File "tests.py"')) {
        isRelevantError = false;
        formattedError += "\n";
      } else {
        formattedError += line + "\n";
      }
    }
  }

  return formattedError.trim();
}

async function executeCode(payload: any): Promise<CodeRunResult> {
  const url = "https://onecompiler-apis.p.rapidapi.com/api/v1/run";
  const headers = {
    "Content-Type": "application/json",
    "x-rapidapi-host": "onecompiler-apis.p.rapidapi.com",
    "x-rapidapi-key": process.env.RAPIDAPI_KEY,
  };

  try {
    const response = await axios.post(url, payload, { headers });
    const data = response.data;
    return {
      status: data.status,
      executionTime: data.executionTime,
      stdout: data.stdout || null,
      stderr: data.stderr || null,
      isError: data.status !== "success",
      exception: data.exception || null,
    };
  } catch (error) {
    console.error("Error running code:", error);
    return {
      status: "error",
      executionTime: 0,
      stdout: null,
      stderr: null,
      isError: true,
      exception: "Failed to run code",
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
          content: code,
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

// ============================================================================
// Below are actions used for agent server
// ============================================================================

// TODO: should check user identity, but this api is used by the agent server so we skip that for now
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

// TODO: should check user identity, but this api is used by the agent server so we skip that for now
export const getEditorSnapshot = action({
  args: {
    sessionId: v.id("sessions"),
  },
  returns: v.object({
    sessionId: v.id("sessions"),
    editor: v.object({
      language: v.string(),
      content: v.string(),
      lastUpdated: v.number(),
    }),
    terminal: v.object({
      output: v.string(),
      isError: v.boolean(),
      executionTime: v.optional(v.number()),
    }),
  }),
  handler: async (ctx, { sessionId }) => {
    const snapshot = await ctx.runQuery(
      internal.editorSnapshots.getLatestSnapshotBySessionIdInternal,
      { sessionId }
    );

    if (!isDefined(snapshot)) {
      throw new ConvexError({ name: "NoSnapshotFound", message: "No snapshot found" });
    }

    const { _id, _creationTime, ...rest } = snapshot;
    return rest;
  },
});

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
    };
  },
});
