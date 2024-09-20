import { ConvexError } from "convex/values";
import { isDefined } from "@/lib/utils";
import { userMutation } from "./functions";

export const fetchUserProfile = userMutation({
  handler: async (ctx) => {
    const userId = ctx.user.subject;

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
      role: "waitlist",
    });

    // return the new profile
    const newProfile = await ctx.db.get(newProfileId);
    if (!isDefined(newProfile)) {
      throw new ConvexError({
        code: "ProfileCreationFailed",
        message: "Failed to create user profile",
      });
    }

    return newProfile;
  },
});
