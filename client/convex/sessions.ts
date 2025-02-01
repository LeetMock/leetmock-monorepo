import { v } from "convex/values";

import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

import { CODE_TEMPLATES } from "@/lib/constants";
import { isDefined, minutesToMilliseconds } from "@/lib/utils";
import { internalMutation, internalQuery, query, userMutation, userQuery } from "./functions";
import { MutationCtx } from "./types";

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

export const getById_unauth = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    return await ctx.table("sessions").get(sessionId);
  },
});

export const getByIdInternal = internalQuery({
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
      await ctx.scheduler.runAfter(
        minutesToMilliseconds(session.timeLimit),
        internal.sessions.endSessionInternal,
        {
          sessionId,
        }
      );
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

    // compute time taken for session
    const session = await ctx.table("sessions").getX(sessionId);
    const startTime = session.sessionStartTime ?? Date.now();
    const endTime = session.sessionEndTime ?? Date.now();
    const timeTaken = endTime - startTime;
    const minutesTaken = Math.floor(timeTaken / 60000); // rounds up to nearest minute
    // deduct mins from user profile
    await ctx.runMutation(internal.userProfiles.decrementMinutesRemaining, {
      minutes: minutesTaken,
    });

    // schedule for evaluation
    const result = await ctx.runMutation(internal.jobs.create, {
      sessionId,
      status: "pending",
      lastUpdate: Date.now(),
      numRetries: 0,
    });

    if (result.status === "failed") {
      throw new Error(result.message);
    }

    return {
      success: true,
    };
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

export const createCodeSession = userMutation({
  args: {
    questionId: v.id("questions"),
    agentThreadId: v.string(),
    assistantId: v.string(),
    interviewType: v.union(
      v.literal("coding"),
      v.literal("system_design"),
      v.literal("behavioral")
    ),
    interviewMode: v.union(v.literal("practice"), v.literal("strict")),
    interviewFlow: v.array(v.string()),
    programmingLanguage: v.string(),
    timeLimit: v.number(),
    voice: v.string(),
    modelName: v.string(),
  },
  handler: async (
    ctx,
    {
      questionId,
      agentThreadId,
      assistantId,
      interviewMode,
      interviewType,
      interviewFlow,
      programmingLanguage,
      timeLimit,
      voice,
      modelName,
    }
  ) => {
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
      interviewMode,
      interviewType,
      timeLimit,
      evalReady: false,
      voice,
      interviewFlow,
      programmingLanguage,
      modelName,
      metadata: {},
    });

    const initialContent = CODE_TEMPLATES["python"](
      question.functionName,
      question.inputParameters["python"]
    );

    const testCases = question.tests
      .slice(0, 3) // Only take first 3 tests
      .map((test) => ({
        input: test.input,
        expectedOutput: test.output,
      }));

    const codeSessionStateId = await ctx.table("codeSessionStates").insert({
      sessionId,
      editor: {
        language: "python",
        content: initialContent,
        lastUpdated: Date.now(),
      },
      terminal: {
        output: "",
        isError: false,
      },
      currentStageIdx: 0,
      testcases: testCases,
      transitionTimestamps: [],
    });

    // Populate initial content changed event
    await ctx.table("codeSessionEvents").insert({
      codeSessionStateId,
      event: {
        type: "content_changed",
        data: {
          before: "",
          after: initialContent,
        },
      },
    });

    await ctx.table("agentStates").insert({
      sessionId,
      state: undefined,
      lastUpdated: Date.now(),
    });

    return sessionId;
  },
});

async function endSessionAction(ctx: MutationCtx, sessionId: Id<"sessions">) {
  const session = await ctx.table("sessions").getX(sessionId);

  const startTime = isDefined(session.sessionStartTime) ? session.sessionStartTime : Date.now();
  const endTime = isDefined(session.sessionEndTime) ? session.sessionEndTime : Date.now();

  await session.patch({
    sessionStatus: "completed",
    sessionStartTime: startTime,
    sessionEndTime: endTime,
  });

  // ctx.scheduler.runAfter(1000, internal.actions.triggerEval, {
  //   sessionId,
  // });
}
