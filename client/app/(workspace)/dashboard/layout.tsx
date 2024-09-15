"use client";

import { useTheme } from "next-themes";
import { redirect } from "next/navigation";
import { Terminal, X } from "lucide-react";
import { Authenticated, AuthLoading } from "convex/react";
import { useAuth } from "@clerk/clerk-react";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { DashboardSidebar } from "./_components/dashboard-sidebar";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
        <div className="flex h-screen bg-muted/40">
          {/* Left Sidebar */}
          <DashboardSidebar />
          {/* Right Content */}
          <div className="flex flex-col flex-1 rounded-md m-3 ml-0 bg-background shadow-lg">
            <div
              className={cn(
                "flex items-center justify-between p-4 border-b h-12 rounded-t-md",
                theme === "dark" ? "bg-gray-50" : "bg-gray-800",
                theme === "dark" ? "text-gray-900" : "text-gray-50"
              )}
            >
              <div className="flex items-center space-x-3">
                <Terminal className="w-4 h-4" />
                <AlertDescription>
                  <span className="font-medium">
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
