import { isDefined } from "@/lib/utils";
import { v } from "convex/values";
import { internalQuery, mutation, query, userMutation } from "./functions";

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

export const updateStarred = userMutation({
  args: {
    questionId: v.id("questions"),
    starred: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { questionId, starred } = args;
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Skip question validation to reduce database operations
    // We only need to check if the profile exists and update it

    const profile = await ctx.table("userProfiles").get("userId", identity.subject);
    if (!profile) throw new Error("User profile not found");

    const currentStarred = profile.starredQuestions ?? [];
    const isAlreadyStarred = currentStarred.includes(questionId);

    // Only update if there's an actual change to make
    if (starred && !isAlreadyStarred) {
      // Add to starred
      await profile.patch({
        starredQuestions: [...currentStarred, questionId]
      });
    } else if (!starred && isAlreadyStarred) {
      // Remove from starred
      await profile.patch({
        starredQuestions: currentStarred.filter(id => id !== questionId)
      });
    }
    // If no change needed (already in desired state), do nothing

    return { questionId, success: true };
  },
});

export const updateStatus = userMutation({
  args: {
    questionId: v.id("questions"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const { questionId, status } = args;
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Skip question validation to reduce database operations
    // We only need to check if the profile exists and update it

    const profile = await ctx.table("userProfiles").get("userId", identity.subject);
    if (!profile) throw new Error("User profile not found");

    const currentCompleted = profile.completedQuestions ?? [];
    const isAlreadyCompleted = currentCompleted.includes(questionId);

    // Only update if there's an actual change to make
    if (status === "complete" && !isAlreadyCompleted) {
      // Add to completed
      await profile.patch({
        completedQuestions: [...currentCompleted, questionId]
      });
    } else if (status !== "complete" && isAlreadyCompleted) {
      // Remove from completed
      await profile.patch({
        completedQuestions: currentCompleted.filter(id => id !== questionId)
      });
    }
    // If no change needed (already in desired state), do nothing

    return { questionId, success: true };
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
    companies: v.array(v.string()),
    questionSets: v.array(v.string()),
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
    companies: v.optional(v.array(v.string())),
    questionSets: v.optional(v.array(v.string())),
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

export const listBySetId = query({
  args: { setId: v.string() },
  handler: async (ctx, args) => {
    const studySet = await ctx.table("codingQuestionSets")
      .filter((q) => q.eq(q.field("_id"), args.setId) || q.eq(q.field("name"), args.setId))
      .first();

    if (!studySet || !studySet.questions || studySet.questions.length === 0) {
      return [];
    }

    // Use a more efficient batch get operation instead of Promise.all with individual gets
    const questions = await ctx.table("questions").getMany(studySet.questions);

    // Filter out any null values (in case some questions were deleted)
    return questions.filter(q => q !== null);
  },
});



