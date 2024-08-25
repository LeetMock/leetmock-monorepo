import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getById = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db.get(sessionId);
  },
});

export const create = mutation({
  args: {
    questionId: v.id("questions"),
    agentThreadId: v.string(),
  },
  handler: async (ctx, { questionId, agentThreadId }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const sessionId = await ctx.db.insert("sessions", {
      userId,
      questionId,
      agentThreadId,
      sessionStatus: "not_started",
    });

    await ctx.db.insert("editorSnapshots", {
      sessionId,
      language: "python",
      content: "",
      output: "",
    });

    return sessionId;
  },
});
