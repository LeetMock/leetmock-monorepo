import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
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

export const getSessionMetadata = query({
  args: {
    sessionId: v.id("sessions"),
  },
  returns: v.object({
    session_id: v.id("sessions"),
    question_title: v.string(),
    question_content: v.string(),
    agent_thread_id: v.string(),
    assistant_id: v.string(),
    session_status: v.string(),
  }),
  handler: async (ctx, { sessionId }) => {
    console.log("session", sessionId);

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
