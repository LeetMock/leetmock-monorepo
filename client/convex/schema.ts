import { defineEnt, defineEntSchema, getEntDefinitions } from "convex-ents";
import { v } from "convex/values";

export const codeSessionEventType = v.union(
  v.object({
    type: v.literal("content_changed"),
    data: v.object({
      content: v.string(),
    }),
  }),
  v.object({
    type: v.literal("tests_executed"),
    data: v.any(), // TODO: change this to the actual data type
  }),
  v.object({
    type: v.literal("testcase_added"),
    data: v.any(), // TODO: change this to the actual data type
  }),
  v.object({
    type: v.literal("testcase_removed"),
    data: v.any(), // TODO: change this to the actual data type
  }),
  v.object({
    type: v.literal("question_visibility_changed"),
    data: v.boolean(),
  })
);

// Schema definition
const schema = defineEntSchema({
  userProfiles: defineEnt({
    role: v.union(v.literal("admin"), v.literal("user")),
    subscription: v.union(
      v.literal("free"),
      v.literal("basic"),
      v.literal("premium"),
      v.literal("enterprise")
    ),
    interval: v.optional(
      v.union(v.literal("month"), v.literal("year"), v.literal("day"), v.literal("week"))
    ),
    minutesRemaining: v.number(),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    latestSubscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
    refreshDate: v.optional(v.number()),
  })
    .field("userId", v.string(), { unique: true }) // user id should be unique
    .field("email", v.string(), { unique: true }) // index by email by default
    .index("by_role", ["role"])
    .index("by_interval", ["interval"]),
  sessions: defineEnt({
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
  })
    .edge("codeSessionState", { optional: true })
    .index("by_user_id", ["userId"])
    .index("by_user_id_and_status", ["userId", "sessionStatus"]),
  codeSessionStates: defineEnt({
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
  })
    .field("displayQuestion", v.boolean(), { default: false })
    .edge("session")
    .edges("codeSessionEvents", { ref: true }),
  codeSessionEvents: defineEnt({
    event: codeSessionEventType,
  })
    .field("acked", v.boolean(), { default: false })
    .edge("codeSessionState")
    .index("by_session_id_and_acked", ["codeSessionStateId", "acked"]),
  questions: defineEnt({
    category: v.array(v.string()),
    difficulty: v.number(),
    question: v.string(),
    solutions: v.any(),
    functionName: v.string(),
    inputParameters: v.record(v.string(), v.array(v.string())),
    evalMode: v.union(v.literal("exactMatch"), v.literal("listNodeIter"), v.literal("sortedMatch")),
    tests: v.array(
      v.object({
        input: v.any(),
        output: v.any(),
      })
    ),
    title: v.string(),
    metaData: v.record(v.string(), v.any()),
  }),
  inviteCodes: defineEnt({
    code: v.string(),
    assignedRole: v.union(v.literal("admin"), v.literal("user")),
  }).index("by_code", ["code"]),
});

export const entDefinitions = getEntDefinitions(schema);

export default schema;
