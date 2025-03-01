"use client";

import { useConfig } from "@/hooks/use-config";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { DashboardSidebar } from "./_components/dashboard-sidebar";
import { UpgradeBanner } from "./_components/upgrade-banner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMediaQuery } from "usehooks-ts";
import { DashboardHeader } from "./_components/dashboard-header";
import { useSidebar } from "@/hooks/use-sidebar";

const dashboardPages = ["/dashboard/interviews", "/dashboard/settings", "/dashboard/coding", "/dashboard/behavior", "/dashboard/system-design"];

const DashboardSkeleton: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showPriceBanner } = useConfig();
  const { open, setOpen } = useSidebar();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <DashboardSidebar className="border-r hidden md:flex" />

      {/* Mobile Drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-60">
          <DashboardSidebar className="border-0 w-full" />
        </SheetContent>
      </Sheet>

      {/* Right Content */}
      <div className="flex flex-col flex-1 ml-0 bg-background">
        {!isDesktop && <DashboardHeader className="px-4 border-b" />}
        {showPriceBanner && <UpgradeBanner className="h-12" />}
        <div className="relative w-full h-[calc(100vh-3.5rem)]">
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
