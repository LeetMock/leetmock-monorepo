import { v } from "convex/values";
import { internalQuery, query } from "./functions";

export const getPricingsInternal = internalQuery({
  args: {
    tier: v.union(
      v.literal("free"),
      v.literal("basic"),
      v.literal("premium"),
      v.literal("payAsYouGo"),
      v.literal("premiumExtraMins")
    ),
  },
  handler: async (ctx, { tier }) => {
    return await ctx.table("pricings").get("tier", tier);
  },
});

export const getPricing = query({
  args: {
    tier: v.union(
      v.literal("free"),
      v.literal("basic"),
      v.literal("premium"),
      v.literal("payAsYouGo"),
      v.literal("premiumExtraMins")
    ),
  },
  handler: async (ctx, { tier }) => {
    return await ctx.table("pricings").get("tier", tier);
  },
});
