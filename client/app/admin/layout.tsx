"use client";

import { DashboardHeader } from "@/app/(workspace)/dashboard/_components/dashboard-header";

export default function QuestionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <DashboardHeader className="px-6 border-b sticky top-0 z-50 bg-background" />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
