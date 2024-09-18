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

export const getByUserId = userQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    return Promise.all(
      sessions.map(async (session) => {
        const question = await ctx.db.get(session.questionId);

        if (!question) {
          return { ...session, question: undefined };
        }

        const { title, difficulty, category } = question;
        return { ...session, question: { title, difficulty, category } };
      })
    );
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

export const changeStatus = userMutation({
  args: {
    sessionId: v.id("sessions"),
    status: v.union(v.literal("not_started"), v.literal("in_progress"), v.literal("completed")),
  },
  handler: async (ctx, { sessionId, status }) => {
    await ctx.db.patch(sessionId, { sessionStatus: status });
  },
});

export const create = userMutation({
  args: {
    questionId: v.id("questions"),
    agentThreadId: v.string(),
    assistantId: v.string(),
    functionName: v.string(),
    inputParameters: v.array(v.string()),
  },
  handler: async (
    ctx,
    { questionId, agentThreadId, assistantId, inputParameters, functionName }
  ) => {
    const sessionId = await ctx.db.insert("sessions", {
      userId: ctx.user.subject,
      questionId,
      agentThreadId,
      assistantId,
      sessionStatus: "not_started",
    });

    // Fetch the question data to get the startingCode
    const question = await ctx.db.get(questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    await ctx.db.insert("editorSnapshots", {
      sessionId,
      editor: {
        language: "python", // You might want to make this dynamic based on the question
        content: question.startingCode || "", // Use startingCode from the question
        lastUpdated: Date.now(),
        functionName: functionName,
        inputParameters: inputParameters,
      },
      terminal: {
        output: "",
        isError: false,
      },
    });

    return sessionId;
  },
});
