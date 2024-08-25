import { query } from "./_generated/server";
import { v } from "convex/values";

// Get editor snapshot by ID
export const getById = query({
  args: {
    id: v.id("editorSnapshots"),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// Get all editor snapshots by session ID
export const getSnapshots = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db
      .query("editorSnapshots")
      .withIndex("by_session_id", (q) => q.eq("sessionId", sessionId))
      .order("asc")
      .collect();
  },
});

// Get latest snapshot by session ID
export const getLatestSnapshotBySessionId = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    const snapshot = await ctx.db
      .query("editorSnapshots")
      .withIndex("by_session_id", (q) => q.eq("sessionId", sessionId))
      .order("desc")
      .first();

    if (!snapshot) {
      throw new Error("No snapshot found");
    }

    return snapshot;
  },
});
