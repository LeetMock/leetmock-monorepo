import { api } from "@/convex/_generated/api";
import { isDefined } from "@/lib/utils";
import { useQuery } from "convex/react";

export const useUserProfile = () => {
  const userProfile = useQuery(api.userProfiles.getUserProfile);
  const isLoaded = isDefined(userProfile);

  return { userProfile: userProfile?.profile, isLoaded };
};
