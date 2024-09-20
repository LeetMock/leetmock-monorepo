import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { useCallback, useEffect, useState } from "react";

interface UserProfile {
  userId: string;
  role: "admin" | "user" | "waitlist";
}

export const useUserProfile = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>(undefined);
  const fetchUserProfile = useMutation(api.userProfiles.fetchUserProfile);

  const getUserProfile = useCallback(async () => {
    const profile = await fetchUserProfile();
    setUserProfile(profile);
    setIsLoaded(true);
  }, [fetchUserProfile]);

  useEffect(() => {
    getUserProfile();
  }, [getUserProfile]);

  return { userProfile, isLoaded };
};
