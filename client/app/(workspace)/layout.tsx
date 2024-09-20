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

  if (!isSignedIn && isLoaded) {
    return redirect("/auth?action=signin");
  }

  if (isUserProfileLoaded && !isDefined(userProfile)) {
    toast.error("Something went wrong. Please contact support.");
    return redirect("/auth?action=signin");
  }

  if (userProfile?.role === "waitlist") {
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
