"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "./_components/dashboard-sidebar";
import { UpgradeBanner } from "./_components/upgrade-banner";

const dashboardPages = ["/dashboard/interviews", "/dashboard/settings"];

const DashboardSkeleton: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-muted/40">
      {/* Left Sidebar */}
      <DashboardSidebar />
      {/* Right Content */}
      <div className="flex flex-col flex-1 rounded-md m-3 ml-0 bg-background shadow-lg">
        <UpgradeBanner className="rounded-t-md" />
        <div className="relative w-full h-full">
          <div className="absolute inset-0 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const shouldWrapSkeleton = useMemo(() => {
    return (
      dashboardPages.some((page) => pathname.startsWith(page)) &&
      !pathname.match(/^\/dashboard\/interviews\/[^/]+$/)
    );
  }, [pathname]);

  const wrappedChildren = useMemo(() => {
    if (shouldWrapSkeleton) {
      return <DashboardSkeleton>{children}</DashboardSkeleton>;
    }
    return children;
  }, [shouldWrapSkeleton, children]);

  return wrappedChildren;
}
