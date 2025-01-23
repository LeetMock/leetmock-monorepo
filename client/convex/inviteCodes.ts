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
      minutes: 0,
      evaluationCount: 0,
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
        minutesRemaining: inviteCode.minutes,
        evaluationCount: inviteCode.evaluationCount,
      });
    } else {
      await profile.patch({
        role,
        minutesRemaining: inviteCode.minutes,
        evaluationCount: inviteCode.evaluationCount,
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
    const minutesRemaining = 0;
    const evaluationCount = 0;

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
