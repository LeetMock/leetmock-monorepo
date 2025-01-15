"use client";

import { DashboardHeader } from "@/app/(workspace)/dashboard/_components/dashboard-header";
import { useUserProfile } from "@/hooks/use-user-profile";
import { isDefined } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userProfile, isLoaded } = useUserProfile();
  const router = useRouter();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isDefined(userProfile) || userProfile.role !== "admin") {
    notFound();
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader className="px-6 border-b sticky top-0 z-50 bg-background" />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
