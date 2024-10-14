import { v } from "convex/values";

import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

import { MutationCtx } from "./types";
import { userMutation, userQuery, internalMutation, internalQuery } from "./functions";
import { isDefined, minutesToMilliseconds } from "@/lib/utils";
import { CODE_TEMPLATES } from "@/lib/constants";

export const exists = userQuery({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    try {
      await ctx.table("sessions").getX(sessionId as Id<"sessions">);
      return true;
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
    return await ctx.table("sessions").get(sessionId);
  },
});

export const getByUserId = userQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    const sessions = await ctx.table("sessions", "by_user_id", (q) => q.eq("userId", userId));

    return Promise.all(
      sessions.map(async (session) => {
        const { title, difficulty, category } = await ctx
          .table("questions")
          .getX(session.questionId);

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
    return ctx.table("sessions").getX(sessionId);
  },
});

export const startSession = userMutation({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.table("sessions").getX(sessionId);

    if (session.sessionStatus === "completed") {
      throw new Error("Session already completed");
    }

    // update start time if it's not already set
    const startTime = session.sessionStartTime ? session.sessionStartTime : Date.now();

    if (session.sessionStatus === "not_started") {
      await ctx.scheduler.runAfter(minutesToMilliseconds(5), internal.sessions.endSessionInternal, {
        sessionId,
      });
    }

    await session.patch({
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
    const session = await ctx
      .table("sessions", "by_user_id", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.or(
          q.eq(q.field("sessionStatus"), "not_started"),
          q.eq(q.field("sessionStatus"), "in_progress")
        )
      )
      .first();

    if (!isDefined(session)) {
      return undefined;
    }

    return session;
  },
});

export const createCodeSession = userMutation({
  args: {
    questionId: v.id("questions"),
    agentThreadId: v.string(),
    assistantId: v.string(),
  },
  handler: async (ctx, { questionId, agentThreadId, assistantId }) => {
    const activeSession = await ctx
      .table("sessions", "by_user_id", (q) => q.eq("userId", ctx.user.subject))
      .filter((q) =>
        q.or(
          q.eq(q.field("sessionStatus"), "not_started"),
          q.eq(q.field("sessionStatus"), "in_progress")
        )
      )
      .first();

    if (isDefined(activeSession)) {
      throw new Error("You already have an active session");
    }

    const question = await ctx.table("questions").getX(questionId);
    const sessionId = await ctx.table("sessions").insert({
      userId: ctx.user.subject,
      questionId,
      agentThreadId,
      assistantId,
      sessionStatus: "not_started",
    });

    await ctx.table("codeSessionStates").insert({
      sessionId,
      editor: {
        language: "python",
        content: CODE_TEMPLATES["python"](
          question.functionName,
          question.inputParameters["python"]
        ),
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

async function endSessionAction(ctx: MutationCtx, sessionId: Id<"sessions">) {
  const session = await ctx.table("sessions").getX(sessionId);

  const endTime = session.sessionEndTime ? session.sessionEndTime : Date.now();
  await session.patch({
    sessionStatus: "completed",
    sessionEndTime: endTime,
  });
}
