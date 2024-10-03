import { api } from "@/convex/_generated/api";
import { isDefined } from "@/lib/utils";
import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useState } from "react";

interface UserProfile {
  userId: string;
  role: "admin" | "user" | "waitlist";
  subscription: "basic" | "premium" | "enterprise";
}

export const useUserProfile = () => {
  const userProfile = useQuery(api.userProfiles.getUserProfile);
  const isLoaded = isDefined(userProfile);

  return { userProfile: userProfile?.profile, isLoaded };
};
