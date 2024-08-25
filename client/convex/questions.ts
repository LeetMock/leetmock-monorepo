import { v } from "convex/values";
import { query } from "./_generated/server";

export const getById = query({
  args: { questionId: v.optional(v.id("questions")) },
  handler: async (ctx, { questionId }) => {
    if (!questionId) {
      return undefined;
    }

    return await ctx.db.get(questionId);
  },
});

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("questions").collect();
  },
});
