import { v } from "convex/values";
import { query, mutation } from "./functions";

export const getBySessionId = query({
  args: {
    sessionId: v.id("sessions"),
  },
  returns: v.object({
    state: v.optional(v.string()),
    lastUpdated: v.number(),
  }),
  handler: async (ctx, { sessionId }) => {
    const result = await ctx
      .table("agentStates", "sessionId", (q) => q.eq("sessionId", sessionId))
      .firstX();

    return {
      state: result.state,
      lastUpdated: result.lastUpdated,
    };
  },
});

export const setBySessionId = mutation({
  args: {
    sessionId: v.id("sessions"),
    state: v.string(),
  },
  handler: async (ctx, { sessionId, state: newState }) => {
    const state = await ctx
      .table("agentStates", "sessionId", (q) => q.eq("sessionId", sessionId))
      .firstX();

    await state.patch({
      state: newState,
      lastUpdated: Date.now(),
    });
  },
});
