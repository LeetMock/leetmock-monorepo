import { isDefined } from "@/lib/utils";
import { userQuery } from "./functions";
import { MutationCtx } from "./types";

export const getUserProfile = userQuery({
  handler: async (ctx) => {
    const profile = await ctx.table("userProfiles").get("by_user_id", ctx.user.subject);

    if (!isDefined(profile)) {
      return { profile: undefined };
    }

    return { profile: profile };
  },
});

export async function getOrCreateUserProfile(
  ctx: MutationCtx,
  userId: string,
  role: "admin" | "user",
  subscription: "free" | "basic" | "premium" | "enterprise",
  minutesRemaining: number,
  nextBillingDate: number | undefined
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
      nextBillingDate,
    })
    .get();
}
