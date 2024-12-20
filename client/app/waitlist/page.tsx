"use client";

import { redirect, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Authenticated, AuthLoading, useMutation } from "convex/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Spinner } from "@/components/spinner";
import { useUser } from "@clerk/clerk-react";
import { useUserProfile } from "@/hooks/use-user-profile";

const WaitlistPage = () => {
  const [inviteCode, setInviteCode] = useState("");
  const { isSignedIn, isLoaded } = useUser();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const applyInviteCode = useMutation(api.inviteCodes.applyInviteCode);
  const router = useRouter();

  const handleApplyInviteCode = useCallback(() => {
    if (inviteCode.length === 0) {
      toast.error("Please enter an valid invite code");
      return;
    }

    const promise = applyInviteCode({ code: inviteCode })
      .then(() => {
        router.push("/dashboard");
      })
      .finally(() => {
        setInviteCode("");
      });

    toast.promise(promise, {
      loading: "Applying invite code...",
      success: "Invite code applied successfully",
      error: "Invalid invite code",
    });
  }, [inviteCode, applyInviteCode, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  if (isLoaded && !isSignedIn) {
    return redirect("/auth?action=signin");
  }

  return (
    <>
      <Authenticated>
        <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute rounded-full bg-blue-200 opacity-20 h-[500px] w-[500px] animate-pulse"></div>
              <div className="absolute rounded-full bg-blue-300 opacity-10 h-[700px] w-[700px]"></div>
              <div className="absolute rounded-full bg-blue-400 opacity-5 h-[900px] w-[900px]"></div>
            </div>
          </div>
          <Card className="relative z-10 w-full max-w-md p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg mx-2">
            {mounted && (
              <div className="absolute top-4 right-4">
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-gray-900 dark:text-white">
                Join the Waitlist
              </CardTitle>
              <CardDescription className="text-center mt-2 text-gray-600 dark:text-gray-300">
                We&apos;re excited to have you on board! Enter your invite code below to get
                started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 mt-2">
                <Input
                  type="text"
                  className="dark:border-gray-700"
                  placeholder="Enter your invite code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full" onClick={handleApplyInviteCode}>
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Authenticated>
      <AuthLoading>
        <Spinner />
      </AuthLoading>
    </>
  );
};

export default WaitlistPage;
