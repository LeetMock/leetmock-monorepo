import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { minutesToMilliseconds } from "@/lib/utils";

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

// deprecated
export const triggerEvalJobs_Deprecated = internalMutation({
    args: {},
    handler: async (ctx) => {
        // Get all pending jobs
        const pendingJobs = await ctx.db
            .query("evalJobs")
            .filter((q) => q.eq(q.field("status"), "pending"))
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

export const triggerEvalJob = internalMutation({
    args: {
        sessionId: v.id("sessions"),
    },
    handler: async (ctx, args) => {

        // check for secrets
        const apiKey = process.env.LANGSMITH_API_KEY;
        if (!apiKey) throw new Error("LANGSMITH_API_KEY not found");
        const apiUrl = process.env.LANGGRAPH_API_URL;
        if (!apiUrl) throw new Error("LANGGRAPH_API_URL not found");

        // Update status to inProgress
        const evalJob = await ctx.db
            .query("evalJobs")
            .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
            .first();

        if (evalJob) {
            await ctx.db.patch(evalJob._id, {
                status: "inProgress",
                lastUpdate: Date.now(),
            });
        }

        // Trigger evaluation
        await ctx.scheduler.runAfter(0, internal.eval.triggerEvalAction, {
            sessionId: args.sessionId,
        });

        const timeLimit = 4; // 240 minutes in milliseconds
        // schedule check timeout
        await ctx.scheduler.runAfter(minutesToMilliseconds(timeLimit), internal.eval.checkTimeout, {
            sessionId: args.sessionId,
        });

    },
});
