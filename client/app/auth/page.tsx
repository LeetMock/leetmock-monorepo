"use client";

import { Suspense, useMemo } from "react";
import { Unauthenticated } from "convex/react";
import { useSearchParams, redirect } from "next/navigation";
import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";

type AuthAction = "signin" | "signup";

const AuthPageContent = () => {
  const searchParams = useSearchParams();
  const { isSignedIn } = useAuth();

  const action = useMemo(() => searchParams.get("action") as AuthAction, [searchParams]);

  if (isSignedIn) {
    return redirect("/dashboard");
  }

  if (searchParams.get("action") !== "signin" || searchParams.get("action") !== "signup") {
    return redirect("/auth?action=signin");
  }

  return (
    <>
      {action === "signin" ? (
        <SignIn signUpUrl="/auth?action=signup" forceRedirectUrl="/dashboard" />
      ) : (
        <SignUp signInUrl="/auth?action=signin" forceRedirectUrl="/dashboard" />
      )}
    </>
  );
};

const AuthPage = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-500 to-blue-500">
      <Unauthenticated>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthPageContent />
        </Suspense>
      </Unauthenticated>
    </div>
  );
};

export default AuthPage;
