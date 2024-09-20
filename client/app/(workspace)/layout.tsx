"use client";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useUserProfile } from "@/hooks/use-user-profile";
import { isDefined } from "@/lib/utils";
import { useAuth } from "@clerk/clerk-react";
import { Authenticated, AuthLoading } from "convex/react";
import { redirect } from "next/navigation";
import { toast } from "sonner";

const Spinner = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <LoadingSpinner />
    </div>
  );
};

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isSignedIn, isLoaded } = useAuth();
  const { isLoaded: isUserProfileLoaded, userProfile } = useUserProfile();

  if (isLoaded && !isSignedIn) {
    return redirect("/auth?action=signin");
  }

  if (isUserProfileLoaded && !isDefined(userProfile)) {
    toast.info("Please wait for an invite code to join this workspace");
    return redirect("/waitlist");
  }

  return (
    <>
      <Authenticated>{isDefined(userProfile) ? children : <Spinner />}</Authenticated>
      <AuthLoading>
        <Spinner />
      </AuthLoading>
    </>
  );
}
