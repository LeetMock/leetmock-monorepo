import { v } from "convex/values";
import { userMutation, internalMutation } from "./functions";
import { getOrCreateUserProfile } from "./userProfiles";
import { FREE_PLAN_MINUTES_ONLY_ONCE } from "@/lib/constants";

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

    const assignedRole = inviteCode.assignedRole;
    const profile = await getOrCreateUserProfile(
      ctx,
      ctx.user.subject,
      ctx.user.email!,
      assignedRole,
      "free",
      FREE_PLAN_MINUTES_ONLY_ONCE,
    );

    await profile.patch({ role: assignedRole });
  },
});
