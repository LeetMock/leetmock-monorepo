import { httpAction, query } from "./_generated/server";
import { SubscriptionTier } from "./schema";
import * as client from "prom-client";

// Initialize the Registry
const register = new client.Registry();

// Create metrics
const usersTotalGauge = new client.Gauge({
  name: "users_total",
  help: "Total number of users",
  registers: [register],
});

const usersByRoleGauge = new client.Gauge({
  name: "users_by_role",
  help: "Number of users by role",
  labelNames: ["role"] as const,
  registers: [register],
});

const usersBySubscriptionGauge = new client.Gauge({
  name: "users_by_subscription",
  help: "Number of users by subscription tier",
  labelNames: ["tier"] as const,
  registers: [register],
});

export const getUsersByRole = query({
  args: {},
  handler: async (ctx) => {
    const userProfiles = await ctx.db
      .query("userProfiles")
      .withIndex("by_role")
      .collect();

    const roleCount: Record<string, number> = {
      admin: 0,
      user: 0,
      waitlist: 0,
    };

    for (const profile of userProfiles) {
      roleCount[profile.role]++;
    }

    return roleCount;
  },
});

export const getUsersBySubscription = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("userProfiles").collect();
    const subscriptionCount: Record<string, number> = {
      [SubscriptionTier.FREE]: 0,
      [SubscriptionTier.BASIC]: 0,
      [SubscriptionTier.PREMIUM]: 0,
      [SubscriptionTier.PAY_AS_YOU_GO]: 0,
    };

    for (const user of users) {
      subscriptionCount[user.subscription]++;
    }

    return subscriptionCount;
  },
});

const updateMetrics = async (ctx: any) => {
  const [usersByRole, usersBySubscription] = await Promise.all([
    ctx.runQuery(getUsersByRole),
    ctx.runQuery(getUsersBySubscription),
  ]);

  const totalUsers = Object.values(usersByRole).reduce(
    (sum: number, count: unknown) => sum + (count as number),
    0
  );
  usersTotalGauge.set(totalUsers);

  Object.entries(usersByRole).forEach(([role, count]) => {
    usersByRoleGauge.set({ role }, count as number);
  });

  Object.entries(usersBySubscription).forEach(([tier, count]) => {
    usersBySubscriptionGauge.set({ tier }, count as number);
  });

  return await register.metrics();
};

export const metricsHandler = httpAction(async (ctx, req) => {
  const metrics = await updateMetrics(ctx);
  return new Response(metrics, {
    headers: {
      "Content-Type": register.contentType,
    },
  });
});
