import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const exists = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    try {
      const session = await ctx.db.get(sessionId as Id<"sessions">);

      if (!session) {
        return false;
      }

      return session.userId === identity.subject;
    } catch (e) {
      return false;
    }
  },
});

export const getById = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const session = await ctx.db.get(sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.userId !== userId) {
      throw new Error("Not authorized");
    }

    return session;
  },
});

export const create = mutation({
  args: {
    questionId: v.id("questions"),
    agentThreadId: v.string(),
    assistantId: v.string(),
  },
  handler: async (ctx, { questionId, agentThreadId, assistantId }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const sessionId = await ctx.db.insert("sessions", {
      userId,
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

export const getSessionMetadata = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    // TODO: should check user identity, but this api is used by the agent server
    // so we skip that for now
    const session = await ctx.db.get(sessionId);
    const question = await ctx.db.get(session!.questionId);

    if (!session || !question) {
      throw new Error("Session not found");
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