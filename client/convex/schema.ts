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
    difficulty: v.float64(),
    question: v.string(),
    solutions: v.any(),
    functionName: v.string(),
    inputParameters: 
    v.object({
      python: v.array(v.string()),
      java: v.array(v.string()),
      cpp: v.array(v.string()),
      javascript: v.array(v.string()),
    }),
    startingCode: v.object({
      python: v.string(),
      java: v.string(),
      cpp: v.string(),
      javascript: v.string(),
    }),
    // dataStructure:v.union(
    //   v.literal("ListNode"),
    //   v.literal("TreeNode"),
    //   v.literal("DoubleListNode"),
    //   v.literal("None"),
    // ),
    tests: v.array(
      v.object({
        input: v.any(),
        output: v.any(),
      })
    ),
    title: v.string(),
  }),
  inviteCodes: defineTable({
    code: v.string(),
    assignedRole: v.union(v.literal("admin"), v.literal("user")),
  }).index("by_code", ["code"]),
});
