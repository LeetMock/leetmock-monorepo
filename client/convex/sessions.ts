import { Id } from "./_generated/dataModel";
import { internalQuery, query } from "./_generated/server";
import { v } from "convex/values";
import { userMutation, userQuery } from "./functions";

export const exists = userQuery({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    try {
      const session = await ctx.db.get(sessionId as Id<"sessions">);
      return !!session;
    } catch (e) {
      return false;
    }
  },
});

export const getById = userQuery({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    return session;
  },
});

export const getByIdInternal = internalQuery({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    return session;
  },
});

export const create = userMutation({
  args: {
    questionId: v.id("questions"),
    agentThreadId: v.string(),
    assistantId: v.string(),
  },
  handler: async (ctx, { questionId, agentThreadId, assistantId }) => {
    const sessionId = await ctx.db.insert("sessions", {
      userId: ctx.user.subject,
      questionId,
      agentThreadId,
      assistantId,
      sessionStatus: "not_started",
    });

    await ctx.db.insert("editorSnapshots", {
      sessionId,
      editor: {
        language: "python",
        content: "",
        lastUpdated: Date.now(),
      },
      terminal: {
        output: "",
        isError: false,
      },
    });

    return sessionId;
  },
});
