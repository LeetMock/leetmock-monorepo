"use client";

import { useTheme } from "next-themes";
import { redirect } from "next/navigation";
import { Menu, Terminal, X } from "lucide-react";
import { Authenticated, AuthLoading } from "convex/react";
import { dark } from "@clerk/themes";
import { useAuth, UserButton } from "@clerk/clerk-react";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import DashboardSidebar from "./_components/dashboard-sidebar";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isSignedIn, isLoaded } = useAuth();
  const { theme } = useTheme();

  if (!isSignedIn && isLoaded) {
    return redirect("/auth?action=signin");
  }

  return (
    <>
      <Authenticated>
        <div className="flex h-screen">
          {/* Left Sidebar */}
          <DashboardSidebar />
          {/* Right Content */}
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between p-4 border-b h-14">
              <div className="flex items-center space-x-3">
                <Terminal className="w-4 h-4" />
                <AlertDescription>
                  <span className="font-medium text-base">
                    Upgrade to Pro to get more interview time! Check out our{" "}
                    <Link href="/pricing" className="text-blue-500 hover:underline">
                      pricing
                    </Link>
                    .
                  </span>
                  <span className="ml-3 text-xs">🎉</span>
                </AlertDescription>
              </div>

              <Button size="icon" variant="ghost">
                <X className="w-4 h-4" />
              </Button>
            </div>
            {children}
          </div>
        </div>
      </Authenticated>
      <AuthLoading>
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      </AuthLoading>
    </>
  );
}
