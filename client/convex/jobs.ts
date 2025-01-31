import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

export const create = internalMutation({
    args: {
        status: v.union(
            v.literal("pending"),
            v.literal("inProgress"),
            v.literal("success"),
            v.literal("failed"),
            v.literal("timeOut")
        ),
        lastUpdate: v.number(),
        sessionId: v.id("sessions"),
        numRetries: v.number(),
    },
    handler: async (ctx, args) => {
        // Check if job already exists for this session
        const existing = await ctx.db
            .query("evalJobs")
            .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
            .first();

        if (existing) {
            console.log("Job already exists for this session, sessionId: ", args.sessionId);
            return { status: "failed" };
        }

        await ctx.db.insert("evalJobs", args);
        return { status: "success" };
    },
});

export const triggerEvalJobs = internalMutation({
    args: {},
    handler: async (ctx) => {
        // Get all pending jobs
        const pendingJobs = await ctx.db
            .query("evalJobs")
            .filter(q => q.eq(q.field("status"), "pending"))
            .take(400);

        const apiKey = process.env.LANGSMITH_API_KEY;
        if (!apiKey) throw new Error("LANGSMITH_API_KEY not found");
        const apiUrl = process.env.LANGGRAPH_API_URL;
        if (!apiUrl) throw new Error("LANGGRAPH_API_URL not found");

        // Process each job
        for (const job of pendingJobs) {
            // Update status to inProgress
            await ctx.db.patch(job._id, {
                status: "inProgress",
                lastUpdate: Date.now(),
            });

            // Trigger evaluation
            await ctx.scheduler.runAfter(0, internal.eval.triggerEvalAction, {
                sessionId: job.sessionId,
            });
        }

        return {
            success: true,
            processedCount: pendingJobs.length,
        };
    },
});
