"use client";

import { DevTool } from "@/components/dev-tool";
import { Spinner } from "@/components/spinner";
import { useUserProfile } from "@/hooks/use-user-profile";
import { isDefined } from "@/lib/utils";
import { useAuth } from "@clerk/clerk-react";
import { Authenticated, AuthLoading } from "convex/react";
import { redirect } from "next/navigation";
import { toast } from "sonner";

const Workspace = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { isLoaded, userProfile } = useUserProfile();

  if (isLoaded && !isDefined(userProfile)) {
    toast.info("Please wait for an invite code to join this workspace");
    return redirect("/waitlist");
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
