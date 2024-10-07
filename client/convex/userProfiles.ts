import { isDefined } from "@/lib/utils";
import { MutationCtx } from "./types";
import { userMutation, userQuery } from "./functions";
import { internalMutation, internalQuery } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { PLANS } from "@/lib/constants";


export const getUserProfile = userQuery({
  handler: async (ctx) => {
    const profile = await ctx.table("userProfiles").get("by_user_id", ctx.user.subject);

    if (!isDefined(profile)) {
      return { profile: undefined };
    }

    return { profile: profile };
  },
});

export const getByEmailInternal = internalQuery({
  args: { email: v.optional(v.string()) },
  handler: async (ctx, { email }) => {
    if (!isDefined(email)) return null;

    const profile = await ctx.db.query("userProfiles").withIndex("by_email", (q) => q.eq("email", email)).first();
    return profile;
  },
});

export async function getOrCreateUserProfile(
  ctx: MutationCtx,
  userId: string,
  email: string,
  role: "admin" | "user",
  subscription: "free" | "basic" | "premium" | "enterprise",
  minutesRemaining: number,
) {
  // check if profile already exists
  const profile = await ctx.table("userProfiles").get("by_user_id", userId);

  // if profile exists, return it
  if (isDefined(profile)) {
    return profile;
  }

  // if profile does not exist, create it
  return await ctx
    .table("userProfiles")
    .insert({
      userId,
      role,
      subscription,
      minutesRemaining,
    })
    .get();
}


export const updateSubscriptionByEmailInternal = internalMutation({
  args: {
    email: v.string(),
    planName: v.union(
      v.literal("free"),
      v.literal("basic"),
      v.literal("premium"),
      v.literal("enterprise")
    ),
    minutesRemaining: v.number(),
    interval: v.optional(v.union(v.literal("month"), v.literal("year"), v.literal("day"), v.literal("week"))),
    refreshDate: v.optional(v.number()),
    currentPeriodEnd: v.number(),
    currentPeriodStart: v.number(),
    latestSubscriptionId: v.string(),
    subscriptionStatus: v.string(),
  },
  handler: async (ctx, { email, planName, minutesRemaining, interval, refreshDate, currentPeriodEnd, currentPeriodStart, latestSubscriptionId, subscriptionStatus }) => {

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!isDefined(profile)) {
      throw new ConvexError({
        code: "ProfileNotFound",
        message: "Profile not found",
      });
    }
    await ctx.db.patch(profile._id, {
      subscription: planName,
      minutesRemaining,
      interval,
      refreshDate,
      currentPeriodEnd,
      currentPeriodStart,
      latestSubscriptionId,
      subscriptionStatus,
    });
  },
});

export const refreshMinutesForYearlyPlansInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("userProfiles").withIndex("by_interval", (q) => q.eq("interval", "year")).collect();

    const currentTime = Date.now();
    for (const profile of profiles) {
      const currentPeriodEnd = profile.currentPeriodEnd;
      const currentPeriodStart = profile.currentPeriodStart;
      const refreshDate = profile.refreshDate;
      if (!isDefined(currentPeriodEnd) || !isDefined(currentPeriodStart) || !isDefined(refreshDate)) {
        continue;
      }
      if (currentPeriodEnd > currentTime) {
        continue;
      }
      if (refreshDate > currentTime) {
        continue;
      }
      if (refreshDate < currentTime) {
        await ctx.db.patch(profile._id, {
          minutesRemaining: PLANS[profile.subscription as keyof typeof PLANS].minutes,
          refreshDate: currentTime + 1000 * 60 * 60 * 24 * 30,
        });
      }
    }
  },
});
