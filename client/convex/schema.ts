import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

// Schema definition
export default defineSchema({
  sessions: defineTable({
    code_block: v.string(),
    last_code_update_timestamp: v.number(), // Unix timestamp in milliseconds
    session_id: v.string(),
    session_period: v.float64(),
    start_time: v.number(), // Unix timestamp in milliseconds
    time_remain: v.number(), // Time remaining in seconds
    user_id: v.float64(),
    question_id: v.number(),
  }),
  questions: defineTable({
    category: v.array(v.string()),
    difficulty: v.float64(),
    question: v.string(),
    question_id: v.float64(),
    solutions: v.any(),
    title: v.string(),
  }),
});
