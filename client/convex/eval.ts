import { v } from "convex/values";
import { mutation, userQuery, internalMutation, internalAction } from "./functions";
import { scoreDetailSchema } from "./schema";
import { isDefined } from "@/lib/utils";
import { internal } from "./_generated/api";

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
    const now = Date.now();
    const sessions = await ctx.table("sessions", "by_eval_ready_and_status", (q) =>
      q.eq("evalReady", false).eq("sessionStatus", "completed")
    );

    for (const session of sessions) {
      await ctx.scheduler.runAfter(0, internal.eval.triggerEvalAction, {
        sessionId: session._id,
      });
    }
  },
});
