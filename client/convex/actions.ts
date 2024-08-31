import { Client } from "@langchain/langgraph-sdk";
import type { VideoGrant } from "livekit-server-sdk";

import { createToken, generateRandomAlphanumeric } from "@/lib/utils";
import { TokenResult } from "@/lib/types";
import { v } from "convex/values";
import { userAction } from "./functions";

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
