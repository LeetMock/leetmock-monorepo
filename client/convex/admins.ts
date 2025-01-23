import { v } from "convex/values";
import { adminMutation } from "./functions";
import { getOrCreateUserProfile } from "./userProfiles";

export const createUserProfile = adminMutation({
  args: {
    role: v.union(v.literal("admin"), v.literal("user")),
    subscription: v.union(
      v.literal("free"),
      v.literal("basic"),
      v.literal("premium"),
      v.literal("payAsYouGo")
    ),
    email: v.string(),
    minutesRemaining: v.number(),
    nextBillingDate: v.optional(v.number()),
  },
  handler: async (ctx, { role, subscription, email, minutesRemaining }) => {
    const profile = await getOrCreateUserProfile(
      ctx,
      ctx.user.subject,
      email,
      role,
      subscription,
      minutesRemaining
    );
    return profile;
  },
});

export const patchUserSubscription = adminMutation({
  args: {
    userId: v.string(),
    subscription: v.optional(
      v.union(v.literal("free"), v.literal("basic"), v.literal("premium"), v.literal("payAsYouGo"))
    ),
    minutesRemaining: v.optional(v.number()),
  },
  handler: async (ctx, { userId, subscription, minutesRemaining }) => {
    const profile = await ctx.table("userProfiles").getX("userId", userId);

    await profile.patch({
      subscription: subscription ?? profile.subscription,
      minutesRemaining: minutesRemaining ?? profile.minutesRemaining,
    });
  },
});
