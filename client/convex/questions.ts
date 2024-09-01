import { v } from "convex/values";
import { internalQuery, query } from "./_generated/server";

export const getById = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, { questionId }) => {
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
