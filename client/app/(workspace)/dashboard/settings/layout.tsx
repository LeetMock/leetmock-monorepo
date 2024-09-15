"use client";

import { SettingsSidebar } from "./_components/settings-sidebar";
import { Separator } from "@/components/ui/separator";

const sidebarNavItems = [
  {
    title: "Account",
    href: "/dashboard/settings/account",
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="flex space-x-8 p-8">
      {/* <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings.</p>
      </div> */}
      {/* <Separator className="my-6" /> */}
      <SettingsSidebar className="w-48 shrink-0" items={sidebarNavItems} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
