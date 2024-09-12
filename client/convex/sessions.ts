import { Id } from "./_generated/dataModel";
import { internalMutation, internalQuery, MutationCtx, QueryCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { userMutation, userQuery } from "./functions";
import { internal } from "./_generated/api";
import { isDefined, minutesToMilliseconds } from "../lib/utils";

export const exists = userQuery({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    try {
      const session = await ctx.db.get(sessionId as Id<"sessions">);
      return isDefined(session);
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

    if (!isDefined(session)) {
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

        if (!isDefined(question)) {
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

    if (!isDefined(session)) {
      throw new Error("Session not found");
    }

    return session;
  },
});

export const startSession = userMutation({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);

    if (!isDefined(session)) {
      throw new Error("Session not found");
    }

    if (session.sessionStatus === "completed") {
      throw new Error("Session already completed");
    }

    // update start time if it's not already set
    const startTime = session.sessionStartTime ? session.sessionStartTime : Date.now();

    if (session.sessionStatus === "not_started") {
      await ctx.scheduler.runAfter(
        minutesToMilliseconds(10),
        internal.sessions.endSessionInternal,
        {
          sessionId,
        }
      );
    }

    await ctx.db.patch(sessionId, {
      sessionStatus: "in_progress",
      sessionStartTime: startTime,
    });
  },
});

export const endSession = userMutation({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    await endSessionAction(ctx, sessionId);
  },
});

export const endSessionInternal = internalMutation({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    await endSessionAction(ctx, sessionId);
  },
});

export const getActiveSession = userQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    const session = await getActiveSessionQuery(ctx, userId);
    return session;
  },
});

export const create = userMutation({
  args: {
    questionId: v.id("questions"),
    agentThreadId: v.string(),
    assistantId: v.string(),
  },
  handler: async (
    ctx,
    { questionId, agentThreadId, assistantId}
  ) => {
    const activeSession = await getActiveSessionQuery(ctx, ctx.user.subject);

    if (activeSession) {
      return new ConvexError({
        name: "ActiveSessionAlreadyExists",
        message: "You already have an active session",
      });
    }

    const sessionId = await ctx.db.insert("sessions", {
      userId: ctx.user.subject,
      questionId,
      agentThreadId,
      assistantId,
      sessionStatus: "not_started",
    });

    // Fetch the question data to get the startingCode
    const question = await ctx.db.get(questionId);
    if (!isDefined(question)) {
      throw new Error("Question not found");
    }

    await ctx.db.insert("editorSnapshots", {
      sessionId,
      editor: {
        language: "python", // will be selected by user later on
        content: question.startingCode["python"] || "", // Use startingCode from the question
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

async function getActiveSessionQuery(ctx: QueryCtx, userId: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_user_id", (q) => q.eq("userId", userId))
    .filter((q) =>
      q.or(
        q.eq(q.field("sessionStatus"), "not_started"),
        q.eq(q.field("sessionStatus"), "in_progress")
      )
    )
    .first();

  return session;
}

async function endSessionAction(ctx: MutationCtx, sessionId: Id<"sessions">) {
  const session = await ctx.db.get(sessionId);

  if (!isDefined(session)) {
    throw new Error("Session not found");
  }

  const endTime = session.sessionEndTime ? session.sessionEndTime : Date.now();
  await ctx.db.patch(sessionId, {
    sessionStatus: "completed",
    sessionEndTime: endTime,
  });
}
