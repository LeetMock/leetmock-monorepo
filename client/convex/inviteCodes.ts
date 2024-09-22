import { ConvexError, v } from "convex/values";
import { userMutation } from "./functions";
import { getOrCreateUserProfile } from "./userProfiles";
import { isDefined } from "../lib/utils";
import { internalMutation } from "./_generated/server";

export const createInviteCode = internalMutation({
  args: {
    assignedRole: v.union(v.literal("admin"), v.literal("user")),
  },
  handler: async ({ db }, { assignedRole }) => {
    const inviteCode = crypto.randomUUID();
    await db.insert("inviteCodes", {
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
    const inviteCode = await ctx.db
      .query("inviteCodes")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();

    if (!isDefined(inviteCode)) {
      throw new ConvexError({
        code: "InviteCodeNotFound",
        message: "Invite code not found",
      });
    }

    const assignedRole = inviteCode.assignedRole;
    const profile = await getOrCreateUserProfile(ctx, ctx.user.subject, assignedRole);

    console.log(
      `Applying invite code "${code}" to profile ${profile._id} with role ${assignedRole}`
    );
    await ctx.db.patch(profile._id, {
      role: assignedRole,
    });
  },
});
