import { v } from "convex/values";
import { query } from "./_generated/server";

export const getByQuestionId = query({
  args: { question_id: v.number() },
  handler: async (ctx, args) => {
    const { db } = ctx;
    const { question_id } = args;
    console.log("question_id", question_id);
    const question = await db
      .query("questions")
      .filter((q) => q.eq(q.field("question_id"), question_id))
      .first();

    if (!question) {
      return null; // or throw an error if you prefer
    }

    // Return the entire question object
    return question;
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const { db } = ctx;

    const questions = await db.query("questions").collect();

    return questions.map((q) => ({
      question_id: q.question_id,
      title: q.title,
      difficulty: q.difficulty,
      category: q.category,
    }));
  },
});
