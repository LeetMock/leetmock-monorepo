"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import { redirect } from "next/navigation";
import { Unauthenticated } from "convex/react";

type AuthAction = "signin" | "signup";

const AuthPage = () => {
  const searchParams = useSearchParams();
  const { isSignedIn } = useAuth();

  const action = useMemo(() => searchParams.get("action") as AuthAction, [searchParams]);

  if (isSignedIn) {
    return redirect("/problems");
  }

  if (searchParams.get("action") !== "signin" && searchParams.get("action") !== "signup") {
    return redirect("/auth?action=signin");
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-500 to-blue-500">
      <Unauthenticated>
        {action === "signin" ? (
          <SignIn signUpUrl="/auth?action=signup" />
        ) : (
          <SignUp signInUrl="/auth?action=signin" />
        )}
      </Unauthenticated>
    </div>
  );
};

export default AuthPage;
