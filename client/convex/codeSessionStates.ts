import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

import { isDefined } from "@/lib/utils";
import { internalQuery, query, userQuery } from "./functions";
import { QueryCtx } from "./types";

// Get code session state by ID
export const getById = userQuery({
  args: {
    sessionStateId: v.optional(v.id("codeSessionStates")),
  },
  handler: async (ctx, { sessionStateId }) => {
    if (!isDefined(sessionStateId)) {
      return undefined;
    }

    return await ctx.table("codeSessionStates").get(sessionStateId);
  },
});

export const getEditorState = userQuery({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    const sessionState = await querySessionStateBySessionId(ctx, sessionId);
    return sessionState?.editor;
  },
});

export const getTerminalState = userQuery({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    const sessionState = await querySessionStateBySessionId(ctx, sessionId);
    return sessionState?.terminal;
  },
});

// Get latest code session state by session ID
export const getLatestSessionStateBySessionId = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    return await querySessionStateBySessionId(ctx, sessionId);
  },
});

// Same as getLatestSessionStateBySessionId, but for internal use
export const getLatestSessionStateBySessionIdInternal = internalQuery({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    return await querySessionStateBySessionId(ctx, sessionId);
  },
});

async function querySessionStateBySessionId(ctx: QueryCtx, sessionId: Id<"sessions">) {
  return await ctx.table("sessions").getX(sessionId).edgeX("codeSessionState");
}
