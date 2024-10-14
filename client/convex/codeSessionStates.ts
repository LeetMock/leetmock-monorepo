import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

import { internalQuery, query, userMutation, userQuery } from "./functions";
import { QueryCtx } from "./types";
import { isDefined } from "@/lib/utils";

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

// Get all code session states by session ID
export const getSessionStates = userQuery({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    return await ctx
      .table("codeSessionStates", "sessionId", (q) => q.eq("sessionId", sessionId))
      .order("asc");
  },
});

// Get latest code session state by session ID
export const getLatestSessionStateBySessionId = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    return await queryLatestSessionState(ctx, sessionId);
  },
});

// Same as getLatestSessionStateBySessionId, but for internal use
export const getLatestSessionStateBySessionIdInternal = internalQuery({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    return await queryLatestSessionState(ctx, sessionId);
  },
});

export const create = userMutation({
  args: {
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
  },
  handler: async (ctx, { sessionId, editor, terminal }) => {
    return await ctx.table("codeSessionStates").insert({
      sessionId,
      editor,
      terminal,
    });
  },
});

async function queryLatestSessionState(ctx: QueryCtx, sessionId: Id<"sessions">) {
  const sessionState = await ctx
    .table("codeSessionStates", "sessionId", (q) => q.eq("sessionId", sessionId))
    .order("desc")
    .firstX();

  return sessionState;
}
