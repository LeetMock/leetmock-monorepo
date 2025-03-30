import { v } from "convex/values";

import { Id } from "./_generated/dataModel";
import { internalQuery, query, userMutation, userQuery } from "./functions";
import { QueryCtx } from "./types";

export const get = query({
  args: {
    sessionId: v.id("sessions"),
  },
  returns: v.object({
    _id: v.id("codeSessionStates"),
    _creationTime: v.number(),
    sessionId: v.id("sessions"),
    currentStageIdx: v.number(),
    transitionTimestamps: v.array(v.number()),
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
    testcases: v.array(
      v.object({
        input: v.record(v.string(), v.any()),
        expectedOutput: v.optional(v.any()),
      })
    ),
  }),
  handler: async (ctx, { sessionId }) => {
    return await querySessionStateBySessionId(ctx, sessionId);
  },
});

export const set = userMutation({
  args: {
    sessionId: v.id("sessions"),
    patch: v.object({
      currentStageIdx: v.optional(v.number()),
      editor: v.optional(
        v.object({
          language: v.string(),
          content: v.string(),
          lastUpdated: v.number(),
        })
      ),
      terminal: v.optional(
        v.object({
          output: v.string(),
          isError: v.boolean(),
          executionTime: v.optional(v.number()),
        })
      ),
      testcases: v.optional(
        v.array(
          v.object({
            input: v.record(v.string(), v.any()),
            expectedOutput: v.optional(v.any()),
          })
        )
      ),
    }),
  },
  handler: async (ctx, { sessionId, patch: rest }) => {
    const sessionState = await ctx.table("sessions").getX(sessionId).edgeX("codeSessionState");

    const patch = Object.fromEntries(
      Object.entries(rest).filter(([_, value]) => value !== undefined)
    );

    await sessionState.patch(patch);
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

export const getTestCasesState = userQuery({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    const sessionState = await querySessionStateBySessionId(ctx, sessionId);
    return sessionState?.testcases;
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

export const getEditorStateInternal = internalQuery({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    const sessionState = await querySessionStateBySessionId(ctx, sessionId);
    return sessionState?.editor;
  },
});

export const getTestCasesStateInternal = internalQuery({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    const sessionState = await querySessionStateBySessionId(ctx, sessionId);
    return sessionState?.testcases;
  },
});

async function querySessionStateBySessionId(ctx: QueryCtx, sessionId: Id<"sessions">) {
  return await ctx.table("sessions").getX(sessionId).edgeX("codeSessionState");
}
