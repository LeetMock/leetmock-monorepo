import { FREE_PLAN_MINUTES_ONLY_ONCE, FREE_PLAN_EVALUATION_ONLY_ONCE, ADMIN_INVITE_CODE_ONLY_ONCE, ADMIN_EVALUATION_COUNT } from "@/lib/constants";
import { isDefined } from "@/lib/utils";
import { v } from "convex/values";
import { internalMutation, userMutation } from "./functions";

export const createInviteCode = internalMutation({
  args: {
    assignedRole: v.union(v.literal("admin"), v.literal("user")),
  },
  handler: async (ctx, { assignedRole }) => {
    const inviteCode = crypto.randomUUID();
    await ctx.table("inviteCodes").insert({
      code: inviteCode,
      assignedRole,
    });
  },
});


export const applyInviteCode = userMutation({
  args: {
    code: v.string(),
  },
  handler: async (ctx, { code }) => {
    const inviteCode = await ctx.table("inviteCodes").getX("by_code", code);
    const profile = await ctx.table("userProfiles").get("userId", ctx.user.subject);

    if (!isDefined(profile)) {
      throw new Error("User does not exist");
    }

    const role = inviteCode.assignedRole;

    if (role === "admin") {
      await profile.patch({
        role,
        minutesRemaining: ADMIN_EVALUATION_COUNT,
        evaluationCount: ADMIN_EVALUATION_COUNT,
      });
    } else {
      await profile.patch({
        role,
        minutesRemaining: FREE_PLAN_MINUTES_ONLY_ONCE,
        evaluationCount: FREE_PLAN_EVALUATION_ONLY_ONCE,
      });
    }
  },
});

export const createDefaultUserProfile = userMutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    const profile = await ctx.table("userProfiles").get("userId", ctx.user.subject);

    if (isDefined(profile)) {
      console.log("User already exists");
      return;
    }

    const userId = ctx.user.subject;
    const role = "waitlist";
    const subscription = "free";
    const minutesRemaining = FREE_PLAN_MINUTES_ONLY_ONCE;
    const evaluationCount = FREE_PLAN_EVALUATION_ONLY_ONCE;

    await ctx.table("userProfiles").insert({
      userId,
      role,
      email,
      subscription,
      minutesRemaining,
      evaluationCount,
    });
  },
});
