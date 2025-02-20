import { defineEnt, defineEntSchema, getEntDefinitions } from "convex-ents";
import { v } from "convex/values";
import { codeSessionEventSchema } from "./types";

// Schema definition

// Score detail schema
export const scoreDetailSchema = {
  testName: v.string(),
  description: v.string(),
  maxScore: v.number(),
  comment: v.string(),
  examples: v.array(v.string()),
  score: v.number(),
};

export const SubscriptionTier = {
  FREE: "free",
  BASIC: "basic",
  PREMIUM: "premium",
  PAY_AS_YOU_GO: "payAsYouGo",
} as const;

const schema = defineEntSchema({
  userProfiles: defineEnt({
    role: v.union(v.literal("admin"), v.literal("user"), v.literal("waitlist")),
    subscription: v.union(
      v.literal(SubscriptionTier.FREE),
      v.literal(SubscriptionTier.BASIC),
      v.literal(SubscriptionTier.PREMIUM),
      v.literal(SubscriptionTier.PAY_AS_YOU_GO)
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
    evaluationCount: v.optional(v.number()),
  })
    .field("email", v.string(), { unique: true })
    .field("userId", v.string(), { unique: true }) // user id should be unique
    .field("starredQuestions", v.array(v.id("questions")), { default: [] })
    .field("completedQuestions", v.array(v.id("questions")), { default: [] })
    .index("by_role", ["role"])
    .index("by_interval", ["interval"]),
  sessions: defineEnt({
    userId: v.string(),
    questionId: v.id("questions"),
    agentThreadId: v.string(),
    assistantId: v.string(),
    sessionStartTime: v.optional(v.number()),
    sessionEndTime: v.optional(v.number()),
    sessionStatus: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
    timeLimit: v.number(),
    voice: v.string(),
    interviewType: v.string(),
    interviewMode: v.union(v.literal("practice"), v.literal("strict")),
    evalReady: v.boolean(),
    interviewFlow: v.array(v.string()),
    programmingLanguage: v.union(v.string(), v.null()),
    metadata: v.record(v.string(), v.any()),
  })
    .field("modelName", v.string(), { default: "gpt-4o" })
    .edge("codeSessionState", { optional: true })
    .index("by_user_id", ["userId"])
    .index("by_user_id_and_status", ["userId", "sessionStatus"])
    .index("by_eval_ready_and_status", ["evalReady", "sessionStatus"]),
  codeSessionStates: defineEnt({
    currentStageIdx: v.number(),
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
    testcases: v.array(
      v.object({
        input: v.record(v.string(), v.any()),
        expectedOutput: v.optional(v.any()),
      })
    ),
  })
    .field("transitionTimestamps", v.array(v.number()), { default: [] })
    .deletion("soft")
    .edge("session")
    .edges("codeSessionEvents", { ref: true }),
  codeSessionEvents: defineEnt({
    event: codeSessionEventSchema,
  })
    .deletion("soft")
    .edge("codeSessionState")
    .index("by_session_id_and_type", ["codeSessionStateId", "event.type"]),
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
  })
    .field("companies", v.array(v.string()), { default: [] }),
  inviteCodes: defineEnt({
    code: v.string(),
    assignedRole: v.union(v.literal("admin"), v.literal("user")),
  })
    .field("minutes", v.number(), { default: 10 })
    .field("evaluationCount", v.number(), { default: 3 })
    .index("by_code", ["code"]),
  evaluations: defineEnt({
    sessionId: v.id("sessions"),
    overallFeedback: v.string(),
    totalScore: v.number(),
    scoreboards: v.object({
      communication: v.object({
        clarification: v.object(scoreDetailSchema),
        thoughtProcess: v.object(scoreDetailSchema),
      }),
      problemSolving: v.object({
        optimalSolution: v.object(scoreDetailSchema),
        optimizationProcess: v.object(scoreDetailSchema),
        questionSpecific: v.object(scoreDetailSchema),
      }),
      technicalCompetency: v.object({
        syntaxError: v.object(scoreDetailSchema),
        codeQuality: v.object(scoreDetailSchema),
        codingSpeed: v.object(scoreDetailSchema),
      }),
      testing: v.object({
        testCaseCoverage: v.object(scoreDetailSchema),
        debugging: v.object(scoreDetailSchema),
        testCaseDesign: v.object(scoreDetailSchema),
      }),
    }),
  }).index("by_session_id", ["sessionId"]),
  agentStates: defineEnt({
    state: v.optional(v.string()),
    lastUpdated: v.number(),
  }).field("sessionId", v.id("sessions"), { unique: true }),
  evalJobs: defineEnt({
    sessionId: v.id("sessions"),
    status: v.union(
      v.literal("pending"),
      v.literal("inProgress"),
      v.literal("success"),
      v.literal("failed"),
      v.literal("timeOut")
    ),
    lastUpdate: v.number(),
    numRetries: v.number(),
  })
    .index("status", ["status", "lastUpdate"])
    .index("by_session_id", ["sessionId"]),
  pricings: defineEnt({
    price: v.number(),
    evalCount: v.number(),
    minutes: v.number(),
    isDefault: v.boolean(),
    isPurchasable: v.boolean(),
  }).field(
    "tier",
    v.union(
      v.literal(SubscriptionTier.FREE),
      v.literal(SubscriptionTier.BASIC),
      v.literal(SubscriptionTier.PREMIUM),
      v.literal(SubscriptionTier.PAY_AS_YOU_GO),
      v.literal("premiumExtraMins")
    ),
    { unique: true }
  ),
});

export const entDefinitions = getEntDefinitions(schema);

export default schema;