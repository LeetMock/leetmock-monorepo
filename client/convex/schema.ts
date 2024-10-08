import { v } from "convex/values";
import { defineEnt, defineEntSchema, getEntDefinitions } from "convex-ents";

// Schema definition
const schema = defineEntSchema({
  userProfiles: defineEnt({
    userId: v.string(),
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
    minutesRemaining: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    currentPeriodStart: v.optional(v.number()),
    latestSubscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
    refreshDate: v.optional(v.number()),
  })
    .field("email", v.string(), { unique: true }) // index by email by default
    .edges("transactions", { ref: true })
    .index("by_user_id", ["userId"])
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
    .index("by_user_id", ["userId"])
    .index("by_user_id_and_status", ["userId", "sessionStatus"]),
  editorSnapshots: defineEnt({
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
  transactions: defineEnt({
    email: v.string(),
    stripeCustomerId: v.string(),
    stripePaymentIntentId: v.string(),
    amount: v.number(),
    product: v.union(v.literal("extra_minutes"), v.literal("subscription")),
    state: v.union(
      v.literal("unprocessed"),
      v.literal("processed"),
      v.literal("refunded_or_revoked")
    ),
  }).edge("userProfile"),
});

export const entDefinitions = getEntDefinitions(schema);

export default schema;
