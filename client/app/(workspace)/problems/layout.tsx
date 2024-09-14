"use client";

import { useAuth } from "@clerk/clerk-react";
import { Authenticated, AuthLoading } from "convex/react";
import { redirect } from "next/navigation";

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
      <Authenticated>{children}</Authenticated>
      <AuthLoading>Is Loading</AuthLoading>
    </>
  );
}
