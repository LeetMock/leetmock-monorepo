import { v } from "convex/values";
import { adminMutation } from "./functions";
import { getOrCreateUserProfile } from "./userProfiles";

export const createUserProfile = adminMutation({
  args: {
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  handler: async (ctx, { role }) => {
    const profile = await getOrCreateUserProfile(ctx, ctx.user.subject, role);
    return profile;
  },
});
