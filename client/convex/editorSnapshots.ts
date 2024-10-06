import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

import { internalQuery, query, userMutation, userQuery } from "./functions";
import { QueryCtx } from "./types";
import { isDefined } from "@/lib/utils";

// Get editor snapshot by ID
export const getById = userQuery({
  args: {
    snapshotId: v.optional(v.id("editorSnapshots")),
  },
  handler: async (ctx, { snapshotId }) => {
    if (!isDefined(snapshotId)) {
      return undefined;
    }

    return await ctx.table("editorSnapshots").get(snapshotId);
  },
});

// Get all editor snapshots by session ID
export const getSnapshots = userQuery({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    return await ctx
      .table("editorSnapshots", "by_session_id", (q) => q.eq("sessionId", sessionId))
      .order("asc");
  },
});

// Get latest snapshot by session ID
export const getLatestSnapshotBySessionId = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    return await queryLatestSnapshot(ctx, sessionId);
  },
});

// Same as getLatestSnapshotBySessionId, but for internal use
export const getLatestSnapshotBySessionIdInternal = internalQuery({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    return await queryLatestSnapshot(ctx, sessionId);
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
    return await ctx.table("editorSnapshots").insert({
      sessionId,
      editor,
      terminal,
    });
  },
});

async function queryLatestSnapshot(ctx: QueryCtx, sessionId: Id<"sessions">) {
  const snapshot = await ctx
    .table("editorSnapshots", "by_session_id", (q) => q.eq("sessionId", sessionId))
    .order("desc")
    .firstX();

  return snapshot;
}
