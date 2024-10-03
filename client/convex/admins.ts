import { v } from "convex/values";
import { adminMutation } from "./functions";
import { getOrCreateUserProfile, getUserProfile } from "./userProfiles";
import { isDefined } from "@/lib/utils";
import { mutation } from "./_generated/server";

export const createUserProfile = adminMutation({
  args: {
    role: v.union(v.literal("admin"), v.literal("user")),
    subscription: v.union(
      v.literal("free"),
      v.literal("basic"),
      v.literal("premium"),
      v.literal("enterprise")
    ),
    minutesRemaining: v.number(),
    nextBillingDate: v.optional(v.number()),
  },
  handler: async (ctx, { role, subscription, minutesRemaining, nextBillingDate }) => {
    const profile = await getOrCreateUserProfile(
      ctx,
      ctx.user.subject,
      role,
      subscription,
      minutesRemaining,
      nextBillingDate
    );
    return profile;
  },
});

export const patchUserSubscription = mutation({
  args: {
    userId: v.string(),
    subscription: v.optional(
      v.union(v.literal("free"), v.literal("basic"), v.literal("premium"), v.literal("enterprise"))
    ),
    minutesRemaining: v.optional(v.number()),
    nextBillingDate: v.optional(v.number()),
  },
  handler: async (ctx, { userId, subscription, minutesRemaining, nextBillingDate }) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!isDefined(profile)) {
      throw new Error("User profile not found");
    }

    const patch = {
      subscription: subscription ?? profile.subscription,
      minutesRemaining: minutesRemaining ?? profile.minutesRemaining,
      nextBillingDate: nextBillingDate ?? profile.nextBillingDate,
    };

    await ctx.db.patch(profile._id, patch);

    return { success: true };
  },
});
