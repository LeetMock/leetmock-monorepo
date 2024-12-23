import { isDefined } from "@/lib/utils";
import { v } from "convex/values";
import { internalQuery, query, mutation } from "./functions";

export const getById = query({
  args: { questionId: v.optional(v.id("questions")) },
  handler: async (ctx, { questionId }) => {
    if (!isDefined(questionId)) return null;

    return await ctx.table("questions").get(questionId);
  },
});

export const getByIdInternal = internalQuery({
  args: { questionId: v.id("questions") },
  handler: async (ctx, { questionId }) => {
    return await ctx.table("questions").get(questionId);
  },
});

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.table("questions");
  },
});

export const createQuestion = mutation({
  args: {
    title: v.string(),
    question: v.string(),
    difficulty: v.number(),
    category: v.array(v.string()),
    functionName: v.string(),
    inputParameters: v.record(v.string(), v.record(v.string(), v.string())),
    outputParameters: v.string(),
    evalMode: v.union(v.literal("exactMatch"), v.literal("listNodeIter"), v.literal("sortedMatch")),
    tests: v.array(
      v.object({
        input: v.any(),
        output: v.any(),
      })
    ),
    solutions: v.record(v.string(), v.string()),
    metaData: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const questionId = await ctx.table("questions").insert({
      ...args,
      metaData: args.metaData ?? {},
    });
    
    return { questionId };
  },
});

export const updateQuestion = mutation({
  args: {
    questionId: v.id("questions"),
    title: v.optional(v.string()),
    question: v.optional(v.string()),
    difficulty: v.optional(v.number()),
    category: v.optional(v.array(v.string())),
    functionName: v.optional(v.string()),
    inputParameters: v.optional(v.record(v.string(), v.record(v.string(), v.string()))),
    outputParameters: v.optional(v.string()),
    evalMode: v.optional(
      v.union(v.literal("exactMatch"), v.literal("listNodeIter"), v.literal("sortedMatch"))
    ),
    tests: v.optional(
      v.array(
        v.object({
          input: v.any(),
          output: v.any(),
        })
      )
    ),
    solutions: v.optional(v.record(v.string(), v.string())),
    metaData: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const { questionId, ...updates } = args;
    const question = await ctx.table("questions").get(questionId);
    
    if (!question) {
      throw new Error("Question not found");
    }

    await (await ctx.table("questions").get(questionId))?.patch(updates);
    return { questionId };
  },
});

export const deleteQuestion = mutation({
  args: { questionId: v.id("questions") },
  handler: async (ctx, { questionId }) => {
    const question = await ctx.table("questions").get(questionId);
    
    if (!question) {
      throw new Error("Question not found");
    }

    await (await ctx.table("questions").get(questionId))?.delete();
    return { questionId };
  },
});
