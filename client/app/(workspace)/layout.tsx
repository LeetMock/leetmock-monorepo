"use client";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@clerk/clerk-react";
import { Authenticated, AuthLoading } from "convex/react";
import { redirect } from "next/navigation";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isSignedIn && isLoaded) {
    return redirect("/auth?action=signin");
  }

  return (
    <>
      <Authenticated>{children}</Authenticated>
      <AuthLoading>
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      </AuthLoading>
    </>
  );
}
