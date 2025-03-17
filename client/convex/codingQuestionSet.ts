import { v } from "convex/values";
import { internalAction, mutation, userMutation, userQuery } from "./functions";
import { scoreDetailSchema } from "./schema";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { defineTable } from "convex/server";

export const codingQuestionSets = defineTable({
    name: v.string(),
    questions: v.array(v.id("questions")),
});

export const createCodingQuestionSet = userMutation({
    args: {
        name: v.string(),
        questions: v.array(v.id("questions")),
    },
    handler: async (ctx, args) => {
        // Check if a question set with this name already exists
        const existingSet = await ctx.table("codingQuestionSets")
            .filter(q => q.eq(q.field("name"), args.name))
            .first();

        if (existingSet) {
            return false;
        }

        // Insert the new question set
        const questionSetId = await ctx.table("codingQuestionSets").insert({
            name: args.name,
            questions: args.questions,
        });

        return questionSetId;
    },
});

export const addQuestionToCodingQuestionSet = userMutation({
    args: {
        codingQuestionSetName: v.string(),
        questionId: v.id("questions"),
    },
    handler: async (ctx, args) => {
        // Find the coding question set by name
        const questionSet = await ctx.table("codingQuestionSets")
            .filter(q => q.eq(q.field("name"), args.codingQuestionSetName))
            .first();

        if (!questionSet) {
            throw new Error(`Coding question set with name "${args.codingQuestionSetName}" not found`);
        }

        // Add question to question set's questions array
        const questions = questionSet.questions || [];
        if (!questions.includes(args.questionId)) {
            await questionSet.patch({
                questions: [...questions, args.questionId]
            });
        }

        return { success: true, questionSetId: questionSet._id };
    },
});

export const removeQuestionFromCodingQuestionSet = mutation({
    args: {
        codingQuestionSetName: v.string(),
        questionId: v.id("questions"),
    },
    handler: async (ctx, args) => {
        // Find the coding question set by name
        const questionSet = await ctx.table("codingQuestionSets")
            .filter(q => q.eq(q.field("name"), args.codingQuestionSetName))
            .first();

        if (!questionSet) {
            throw new Error(`Coding question set with name "${args.codingQuestionSetName}" not found`);
        }

        // Remove question from question set's questions array
        const questions = questionSet.questions || [];
        const updatedQuestions = questions.filter(id => id !== args.questionId);

        await questionSet.patch({
            questions: updatedQuestions
        });

        return { success: true };
    },
});

export const getCodingQuestionSets = userQuery({
    args: {
        name: v.string(),
    },
    handler: async (ctx, args) => {
        // Fetch all coding question sets
        const questionSets = await ctx.table("codingQuestionSets").filter(q => q.eq(q.field("name"), args.name)).first();

        // Return an array of sets with id and name for selection in UI
        return questionSets?.questions;
    },
});

export const getAllCodingQuestionSets = userQuery({
    args: {},
    handler: async (ctx) => {
        // Fetch all coding question sets
        const questionSets = await ctx.table("codingQuestionSets");
        return questionSets;
    },
});

// Get a study set by ID
export const getSetById = userQuery({
    args: { id: v.string() },
    handler: async (ctx, args) => {
        // First, try to fetch by unique ID (assuming you store it in a field like "setId")
        const studySet = await ctx.table("codingQuestionSets")
            .filter((q) => q.eq(q.field("_id"), args.id))
            .first();

        if (studySet) {
            return studySet;
        }

        // If not found by setId, try to find sby name (for backward compatibility)
        return await ctx.table("codingQuestionSets")
            .filter((q) => q.eq(q.field("name"), args.id))
            .first();
    },
});

export const getStudyPlanByName = userQuery({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        return await ctx.table("codingQuestionSets").filter((q) => q.eq(q.field("name"), args.name)).first();
    },
});
