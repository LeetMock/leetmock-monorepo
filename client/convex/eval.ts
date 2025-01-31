import { v } from "convex/values";
import { internalAction, internalMutation, mutation, userQuery } from "./functions";
import { scoreDetailSchema } from "./schema";

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

export const checkPendingEvaluationsInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    const timeoutThreshold = 240 * 1000; // 240 seconds in milliseconds
    const currentTime = Date.now();

    // Use the "status" index instead
    const timedOutJobs = await ctx.table("evalJobs", "status", (q) =>
      q
        .eq("status", "inProgress")
        .lt("lastUpdate", currentTime - timeoutThreshold)
    );

    // Update each timed out job
    for (const job of timedOutJobs) {
      await job.patch({
        status: job.numRetries >= 2 ? "failed" : "pending", // Will be "failed" on 3rd retry
        lastUpdate: currentTime,
        numRetries: job.numRetries + 1,
      });
    }
  },
});
