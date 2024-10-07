import { get30DaysFromNowInSeconds, isDefined } from "@/lib/utils";
import { MutationCtx } from "./types";
import { internalQuery } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { PLANS } from "@/lib/constants";
import { internalMutation, userQuery } from "./functions";


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

    const profile = await ctx.db.query("userProfiles").withIndex("email", (q) => q.eq("email", email)).first();
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
      email,
      subscription,
      minutesRemaining,
    })
    .get();
}


export const voidSubscriptionInternal = internalMutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    const profile = await ctx.table("userProfiles").getX("email", email);
    await profile.patch({
      subscription: "free",
      minutesRemaining: 0,
      interval: undefined,
      refreshDate: undefined,
      currentPeriodEnd: undefined,
      currentPeriodStart: undefined,
      latestSubscriptionId: undefined,
      subscriptionStatus: undefined,
    });
  },
});

export const updateSubscriptionByEmailInternal = internalMutation({
  args: {
    email: v.string(),
    planName: v.optional(v.union(
      v.literal("free"),
      v.literal("basic"),
      v.literal("premium"),
      v.literal("enterprise")
    )),
    minutesRemaining: v.optional(v.number()),
    interval: v.optional(v.union(v.literal("month"), v.literal("year"), v.literal("day"), v.literal("week"))),
    refreshDate: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    currentPeriodStart: v.optional(v.number()),
    latestSubscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
  },
  handler: async (ctx, { email, planName, minutesRemaining, interval, refreshDate, currentPeriodEnd, currentPeriodStart, latestSubscriptionId, subscriptionStatus }) => {

    const profile = await ctx.table("userProfiles").getX("email", email);

    await profile.patch({
      subscription: planName ?? profile.subscription,
      minutesRemaining: minutesRemaining ?? profile.minutesRemaining,
      interval: interval ?? profile.interval,
      refreshDate: refreshDate ?? profile.refreshDate,
      currentPeriodEnd: currentPeriodEnd ?? profile.currentPeriodEnd,
      currentPeriodStart: currentPeriodStart ?? profile.currentPeriodStart,
      latestSubscriptionId: latestSubscriptionId ?? profile.latestSubscriptionId,
      subscriptionStatus: subscriptionStatus ?? profile.subscriptionStatus,
    });
  },
});

export const refreshMinutesForYearlyPlansInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.table("userProfiles", "by_interval", (q) => q.eq("interval", "year"));

    const currentTime = Math.floor(Date.now() / 1000);
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
        await profile.patch({
          minutesRemaining: PLANS[profile.subscription as keyof typeof PLANS].minutes,
          refreshDate: get30DaysFromNowInSeconds(currentTime),
        });
      }
    }
  },
});
