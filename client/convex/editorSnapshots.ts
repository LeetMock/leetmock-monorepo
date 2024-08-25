import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get editor snapshot by ID
export const getById = query({
  args: {
    snapshotId: v.optional(v.id("editorSnapshots")),
  },
  handler: async (ctx, { snapshotId }) => {
    if (!snapshotId) {
      return undefined;
    }
    return await ctx.db.get(snapshotId);
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

export const create = mutation({
  args: {
    sessionId: v.id("sessions"),
    editor: v.object({
      language: v.string(),
      content: v.string(),
    }),
    terminal: v.object({
      output: v.string(),
      isError: v.boolean(),
      executionTime: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { sessionId, editor, terminal }) => {
    return await ctx.db.insert("editorSnapshots", {
      sessionId,
      editor,
      terminal,
    });
  },
});
