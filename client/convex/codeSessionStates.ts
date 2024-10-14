import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

import { query, userQuery } from "./functions";
import { QueryCtx } from "./types";

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
export const getSessionStateBySessionId = query({
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
