import { v } from "convex/values";
import { userMutation, internalMutation } from "./functions";
import { FREE_PLAN_MINUTES_ONLY_ONCE } from "@/lib/constants";
import { isDefined } from "@/lib/utils";

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

    if (isDefined(profile)) {
      throw new Error("User already exists");
    }

    const role = inviteCode.assignedRole;
    const userId = ctx.user.subject;
    const email = ctx.user.email!;
    const subscription = "free";
    const minutesRemaining = FREE_PLAN_MINUTES_ONLY_ONCE;

    await ctx.table("userProfiles").insert({
      userId,
      role,
      email,
      subscription,
      minutesRemaining,
    });
  },
});
