import { Client } from "@langchain/langgraph-sdk";
import type { VideoGrant } from "livekit-server-sdk";

import { action } from "./_generated/server";
import { createToken, generateRandomAlphanumeric, getFileExtension, generateTestCode, executeCode } from "@/lib/utils";
import { TokenResult, CodeRunResult } from "@/lib/types";
import { v } from "convex/values";
import axios from "axios";
import { api } from "./_generated/api";
import { RunTestResult } from "@/lib/types";

function formatRuntimeError(stderr: string): string {
  const lines = stderr.split('\n');
  let formattedError = '';
  let isRelevantError = false;

  for (const line of lines) {
    if (line.startsWith('Traceback') || line.startsWith('  File "/solution.py"')) {
      isRelevantError = true;
    }
    if (isRelevantError) {
      if (line.startsWith('  File "tests.py"')) {
        isRelevantError = false;
        formattedError += '\n';
      } else {
        formattedError += line + '\n';
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
}

export const createAgentThread = action({
  args: {
    graphId: v.string(),
  },
  handler: async (ctx, { graphId }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

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
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

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
          console.log(parsedResults);
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

    return result ? {
      status: !result.isError,//true if API call was successful
      executionTime: result.executionTime,
      isError: !!result.stderr,//true if there's an error in the code
      output: result.stderr || result.stdout || '',
    } : undefined;
  },
});


type RunCodeResult = {
  status: boolean;
  executionTime: number;
  isError: boolean;
  output: string;
};

