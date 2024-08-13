import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getBySessionId = query({
  args: { session_id: v.string() },
  handler: async (ctx, args) => {
    const { db } = ctx;
    const { session_id } = args;

    return await db
      .query("sessions")
      .filter((q) => q.eq(q.field("session_id"), session_id))
      .first();
  },
});

// Upsert function
export const create = mutation({
  // Create or update a session
  args: {
    code_block: v.string(),
    session_id: v.string(),
    session_period: v.float64(),
    time_remain: v.number(),
    user_id: v.float64(),
    question_id: v.number(),
  },
  handler: async (ctx, args) => {
    const { code_block, session_id, session_period, time_remain, user_id, question_id } = args;

    // Check if a session with this ID already exists
    const existingSession = await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("session_id"), session_id))
      .first();

    if (existingSession) {
      throw new Error("Session already exists");
    }

    // Current timestamp in milliseconds
    const now = Date.now();

    // Insert new session
    const session = await ctx.db.insert("sessions", {
      code_block,
      last_code_update_timestamp: now,
      session_id,
      session_period,
      start_time: now,
      time_remain,
      user_id,
      question_id,
    });

    return session;
  },
});

export const update = mutation({
  args: {
    code_block: v.string(),
    session_id: v.string(),
    time_remain: v.float64(),
  },
  handler: async (ctx, args) => {
    const { code_block, session_id, time_remain } = args;

    // Find the existing session or create a new one
    const existingSession = await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("session_id"), session_id))
      .first();

    if (!existingSession) {
      throw new Error("Session not found");
    }

    // Update existing session
    await ctx.db.patch(existingSession._id, {
      code_block,
      last_code_update_timestamp: Date.now(),
      time_remain,
    });
  },
});
