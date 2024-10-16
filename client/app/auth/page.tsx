"use client";

import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import { Unauthenticated } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

type AuthAction = "signin" | "signup";

const AuthPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const action = useMemo(() => searchParams.get("action") as AuthAction, [searchParams]);
  const router = useRouter();

  if (searchParams.get("action") !== "signin" && searchParams.get("action") !== "signup") {
    router.push("/auth?action=signin");
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
  const { isSignedIn } = useAuth();
  const router = useRouter();

  if (isSignedIn) {
    router.push("/dashboard");
  }

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
