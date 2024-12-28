import { v } from "convex/values";
import { query, mutation } from "./functions";

export const getBySessionId = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, { sessionId }) => {
    return await ctx
      .table("agentStates", "sessionId", (q) => q.eq("sessionId", sessionId))
      .firstX();
  },
});

export const setBySessionId = mutation({
  args: {
    sessionId: v.id("sessions"),
    state: v.any(),
  },
  handler: async (ctx, { sessionId, state: newState }) => {
    const state = await ctx
      .table("agentStates", "sessionId", (q) => q.eq("sessionId", sessionId))
      .firstX();

    await state.replace(newState);
  },
});
