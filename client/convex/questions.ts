import { v } from "convex/values";
import { internalQuery, query } from "./_generated/server";
import { isDefined } from "@/lib/utils";

export const getById = query({
  args: { questionId: v.optional(v.id("questions")) },
  handler: async (ctx, { questionId }) => {
    if (!isDefined(questionId)) return null;

    return await ctx.db.get(questionId);
  },
});

export const getByIdInternal = internalQuery({
  args: { questionId: v.id("questions") },
  handler: async (ctx, { questionId }) => {
    return await ctx.db.get(questionId);
  },
});

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("questions").collect();
  },
});
