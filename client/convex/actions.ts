import { Client } from "@langchain/langgraph-sdk";
import type { VideoGrant } from "livekit-server-sdk";

import { action } from "./_generated/server";
import { createToken, generateRandomAlphanumeric } from "@/lib/utils";
import { TokenResult } from "@/lib/types";

export const createAgentThread = action({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const apiKey = process.env.LANGSMITH_API_KEY;
    const apiUrl = process.env.LANGGRAPH_API_URL;
    const client = new Client({ apiKey, apiUrl });

    const thread = await client.threads.create();
    return thread.thread_id;
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
