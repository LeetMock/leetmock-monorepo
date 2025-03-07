"use client";

import { DevTool } from "@/components/dev-tool";
import { Spinner } from "@/components/spinner";
import { api } from "@/convex/_generated/api";
import { useUserProfile } from "@/hooks/use-user-profile";
import { isDefined } from "@/lib/utils";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { Authenticated, AuthLoading } from "convex/react";
import { redirect } from "next/navigation";
import { toast } from "sonner";

const Workspace = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { isLoaded, userProfile } = useUserProfile();
  const createDefaultUserProfile = useMutation(api.inviteCodes.createDefaultUserProfile);
  const { user } = useUser();

  if (isLoaded && isDefined(userProfile) && userProfile.role === "waitlist") {
    return redirect("/waitlist");
  }

  if (isLoaded && !isDefined(userProfile)) {
    if (!user) {
      return redirect("/auth?action=signin");
    }
    const email = user.emailAddresses[0].emailAddress;
    createDefaultUserProfile({ email });

    toast.info("Signed up successfully! Redirecting to dashboard...");
    return redirect("/dashboard/interviews");
  }

  return isDefined(userProfile) ? children : <Spinner />;
};

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isSignedIn, isLoaded } = useAuth();



  if (isLoaded && !isSignedIn) {
    return redirect("/auth?action=signin");
  }

  return (
    <>
      <Authenticated>
        <Workspace>{children}</Workspace>
      </Authenticated>
      <AuthLoading>
        <Spinner />
      </AuthLoading>
    </>
  );
}
