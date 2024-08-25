import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

// Schema definition
export default defineSchema({
  sessions: defineTable({
    userId: v.string(),
    questionId: v.id("questions"),
    agentThreadId: v.string(),
    sessionStatus: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
  }),
  editorSnapshots: defineTable({
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
  }).index("by_session_id", ["sessionId"]),
  questions: defineTable({
    category: v.array(v.string()),
    difficulty: v.float64(),
    question: v.string(),
    question_id: v.float64(),
    solutions: v.any(),
    title: v.string(),
  }),
});
