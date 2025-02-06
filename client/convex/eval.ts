import { v } from "convex/values";
import { internalAction, mutation, userQuery } from "./functions";
import { scoreDetailSchema } from "./schema";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

// Category schema type for communication
const communicationSchema = v.object({
  clarification: v.object(scoreDetailSchema),
  thoughtProcess: v.object(scoreDetailSchema),
});

// Category schema type for problem solving
const problemSolvingSchema = v.object({
  optimalSolution: v.object(scoreDetailSchema),
  optimizationProcess: v.object(scoreDetailSchema),
  questionSpecific: v.object(scoreDetailSchema),
});

// Category schema type for technical competency
const technicalCompetencySchema = v.object({
  syntaxError: v.object(scoreDetailSchema),
  codeQuality: v.object(scoreDetailSchema),
  codingSpeed: v.object(scoreDetailSchema),
});

// Category schema type for testing
const testingSchema = v.object({
  testCaseCoverage: v.object(scoreDetailSchema),
  debugging: v.object(scoreDetailSchema),
  testCaseDesign: v.object(scoreDetailSchema),
});

export const insertEvaluation = mutation({
  args: {
    sessionId: v.id("sessions"),
    overallFeedback: v.string(),
    totalScore: v.number(),
    scoreboards: v.object({
      communication: communicationSchema,
      problemSolving: problemSolvingSchema,
      technicalCompetency: technicalCompetencySchema,
      testing: testingSchema,
    }),
  },
  handler: async (ctx, args) => {
    const evaluation = await ctx.table("evaluations").insert({
      sessionId: args.sessionId,
      overallFeedback: args.overallFeedback,
      totalScore: args.totalScore,
      scoreboards: args.scoreboards,
    });

    // update evalJob status to completed
    const evalJob = await ctx
      .table("evalJobs", "by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (evalJob) {
      await evalJob.patch({
        status: "success",
        lastUpdate: Date.now(),
      });
    }

    // Update session evalReady flag
    const session = await ctx.table("sessions").getX(args.sessionId);
    await session.patch({
      evalReady: true,
    });

    return evaluation;
  },
});

export const getBySessionId = userQuery({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    return await ctx
      .table("evaluations", "by_session_id", (q) => q.eq("sessionId", sessionId))
      .first();
  },
});

export const triggerEvalAction = internalAction({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    const apiKey = process.env.LANGSMITH_API_KEY;
    if (!apiKey) throw new Error("LANGSMITH_API_KEY not found");
    const apiUrl = process.env.LANGGRAPH_API_URL;

    await fetch(apiUrl + "/runs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({
        assistant_id: "eval-agent",
        input: {
          session_id: sessionId,
        },
      }),
    });
  },
});

export const checkTimeout = internalMutation({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const timeoutThreshold = 15 * 1000; // 15 seconds in milliseconds
    const currentTime = Date.now();

    // Update status to inProgress
    const evalJob = await ctx.db
      .query("evalJobs")
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .first();

    if (!evalJob || !ctx.db) return;

    if (evalJob.status === "success") {
      await ctx.db.delete(evalJob._id);
    } else if (evalJob.status === "inProgress") {
      if (evalJob.numRetries > 2) {
        await ctx.db.patch(evalJob._id, {
          status: "failed",
          lastUpdate: currentTime,
        });
        // TODO: initiate alert for admin
      } else {
        await ctx.db.patch(evalJob._id, {
          status: "pending",
          lastUpdate: currentTime,
          numRetries: evalJob.numRetries + 1,
        });
        // schedule retry
        await ctx.scheduler.runAfter(timeoutThreshold, internal.jobs.triggerEvalJob, {
          sessionId: args.sessionId,
        });
      }
    }

  },
});
