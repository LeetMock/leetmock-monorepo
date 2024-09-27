import { isDefined } from "@/lib/utils";
import { userQuery } from "./functions";
import { MutationCtx } from "./_generated/server";
import { ConvexError } from "convex/values";

export const getUserProfile = userQuery({
  handler: async (ctx) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", ctx.user.subject))
      .first();

    if (!isDefined(profile)) {
      return { profile: undefined };
    }

    return { profile: profile };
  },
});

export async function getOrCreateUserProfile(
  ctx: MutationCtx,
  userId: string,
  role: "admin" | "user"
) {
  // check if profile already exists
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user_id", (q) => q.eq("userId", userId))
    .first();

  // if profile exists, return it
  if (isDefined(profile)) {
    return profile;
  }

  // if profile does not exist, create it
  const newProfileId = await ctx.db.insert("userProfiles", {
    userId,
    role,
  });

  // check if profile was created
  const newProfile = await ctx.db.get(newProfileId);

  // if profile was not created, throw an error
  if (!isDefined(newProfile)) {
    throw new ConvexError({
      code: "ProfileCreationFailed",
      message: "Profile creation failed",
    });
  }

  // if profile was created, return it
  return newProfile;
}
