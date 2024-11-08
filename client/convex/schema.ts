import { defineEnt, defineEntSchema, getEntDefinitions } from "convex-ents";
import { v } from "convex/values";
import { codeSessionEventSchema } from "./types";

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
    timeLimit: v.number(),
    voice: v.string(),
    sessionStartTime: v.optional(v.number()),
    sessionEndTime: v.optional(v.number()),
    interviewType: v.string(),
    interviewMode: v.union(v.literal("practice"), v.literal("strict")),
    meta: v.object({
      interviewFlow: v.array(v.string()),
      programmingLanguage: v.union(v.string(), v.null()),
      metaData: v.record(v.string(), v.any()),
    }),
  })
    .edge("codeSessionState", { optional: true })
    .index("by_user_id", ["userId"])
    .index("by_user_id_and_status", ["userId", "sessionStatus"]),
  codeSessionStates: defineEnt({
    displayQuestion: v.boolean(),
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
    testcases: v.array(v.object({
      input: v.record(v.string(), v.any()),
      expectedOutput: v.optional(v.any()),
    })),
  })
    .deletion("soft")
    .edge("session")
    .edges("codeSessionEvents", { ref: true }),
  codeSessionEvents: defineEnt({
    event: codeSessionEventSchema,
    acked: v.boolean(),
  })
    .deletion("soft")
    .edge("codeSessionState")
    .index("by_session_id_and_acked_and_type", ["codeSessionStateId", "acked", "event.type"]),
  questions: defineEnt({
    category: v.array(v.string()),
    difficulty: v.number(),
    question: v.string(),
    solutions: v.record(v.string(), v.string()),
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
