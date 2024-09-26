import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

// Schema definition
export default defineSchema({
  userProfiles: defineTable({
    userId: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
  })
    .index("by_user_id", ["userId"])
    .index("by_role", ["role"]),
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
    }),
    terminal: v.object({
      output: v.string(),
      isError: v.boolean(),
      executionTime: v.optional(v.number()),
    }),
  }).index("by_session_id", ["sessionId"]),
  questions: defineTable({
    category: v.array(v.string()),
    difficulty: v.number(),
    question: v.string(),
    solutions: v.any(),
    functionName: v.string(),
    inputParameters: v.record(v.string(), v.array(v.string())),
    evalMode: v.union(
      v.literal("exactMatch"),
      v.literal("listNodeIter"),
      v.literal("sortedMatch")
    ),
    tests: v.array(
      v.object({
        input: v.any(),
        output: v.any(),
      })
    ),
    title: v.string(),
    metaData: v.record(v.string(), v.any()),
  }),
  inviteCodes: defineTable({
    code: v.string(),
    assignedRole: v.union(v.literal("admin"), v.literal("user")),
  }).index("by_code", ["code"]),
});
