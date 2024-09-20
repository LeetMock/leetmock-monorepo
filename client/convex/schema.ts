import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

// Schema definition
export default defineSchema({
  users: defineTable({
    userId: v.string(),
    role: v.union(v.literal("admin"), v.literal("user"), v.literal("waitlist")),
  }),
  sessions: defineTable({
    userId: v.string(),
    questionId: v.id("questions"),
    agentThreadId: v.string(),
    assistantId: v.string(),
    sessionStatus: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
    sessionStartTime: v.optional(v.number()),
    sessionEndTime: v.optional(v.number()),
  }).index("by_user_id", ["userId"]),
  editorSnapshots: defineTable({
    sessionId: v.id("sessions"),
    editor: v.object({
      language: v.string(),
      content: v.string(),
      lastUpdated: v.number(),
      functionName: v.string(),
      inputParameters: v.array(v.string()),
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
    solutions: v.any(),
    functionName: v.string(),
    inputParameters: v.array(v.string()),
    startingCode: v.string(),
    tests: v.array(
      v.object({
        input: v.any(),
        output: v.any(),
      })
    ),
    title: v.string(),
  }),
});
