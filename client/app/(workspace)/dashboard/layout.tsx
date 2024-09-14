"use client";

import { useAuth } from "@clerk/clerk-react";
import { Authenticated, AuthLoading } from "convex/react";
import { redirect } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import DashboardNavBar from "./_components/dashboard-navbar";

export default function ProblemsLayout({
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
      <Authenticated>
        <DashboardNavBar>{children}</DashboardNavBar>
      </Authenticated>
      <AuthLoading>
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      </AuthLoading>
    </>
  );
}
