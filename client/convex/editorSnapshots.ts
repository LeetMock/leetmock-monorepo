import { internalQuery, QueryCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { userMutation, userQuery } from "./functions";
import { Id } from "./_generated/dataModel";
import { isDefined } from "@/lib/utils";

// Get editor snapshot by ID
export const getById = userQuery({
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
export const getSnapshots = userQuery({
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
export const getLatestSnapshotBySessionId = userQuery({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    const snapshot = await queryLatestSnapshot(ctx, sessionId);

    if (!isDefined(snapshot)) {
      throw new ConvexError({ name: "NoSnapshotFound", message: "No snapshot found" });
    }

    return snapshot;
  },
});

// Same as getLatestSnapshotBySessionId, but for internal use
export const getLatestSnapshotBySessionIdInternal = internalQuery({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    const snapshot = await queryLatestSnapshot(ctx, sessionId);

    if (!isDefined(snapshot)) {
      throw new ConvexError({ name: "NoSnapshotFound", message: "No snapshot found" });
    }

    return snapshot;
  },
});

export const create = userMutation({
  args: {
    sessionId: v.id("sessions"),
    editor: v.object({
      language: v.string(),
      content: v.string(),
      lastUpdated: v.number(),
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

const queryLatestSnapshot = (ctx: QueryCtx, sessionId: Id<"sessions">) => {
  const snapshot = ctx.db
    .query("editorSnapshots")
    .withIndex("by_session_id", (q) => q.eq("sessionId", sessionId))
    .order("desc")
    .first();

  return snapshot;
};
