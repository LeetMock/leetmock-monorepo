import { v } from "convex/values";
import { mutation, userQuery } from "./functions";
import { scoreDetailSchema } from "./schema"



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
            evalReady: true
        });

        return evaluation;
    },
});


export const getBySessionId = userQuery({
    args: {
        sessionId: v.id("sessions"),
    },
    handler: async (ctx, { sessionId }) => {
        return await ctx.table("evaluations", "by_session_id", (q) =>
            q.eq("sessionId", sessionId)
        ).first();
    },
});

