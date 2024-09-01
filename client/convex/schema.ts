import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export const sessionSchema = {
  userId: v.string(),
  questionId: v.id("questions"),
  agentThreadId: v.string(),
  assistantId: v.string(),
  sessionStatus: v.union(
    v.literal("not_started"),
    v.literal("in_progress"),
    v.literal("completed")
  ),
};

export const editorSnapshotSchema = {
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
};

export const questionSchema = {
  category: v.array(v.string()),
  difficulty: v.float64(),
  question: v.string(),
  question_id: v.float64(),
  solutions: v.any(),
  function_name: v.string(),
  inputParameters: v.array(v.string()),
  tests: v.array(
    v.object({
      input: v.any(),
      output: v.any(),
    })
  ),
  title: v.string(),
};

// Schema definition
export default defineSchema({
  sessions: defineTable(sessionSchema),
  editorSnapshots: defineTable(editorSnapshotSchema).index("by_session_id", ["sessionId"]),
  questions: defineTable(questionSchema),
});
