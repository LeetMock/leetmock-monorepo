"use client";

import { DashboardBreadcrumb } from "../_components/breadcrumb";
import { SettingsSidebar } from "./_components/settings-sidebar";

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
    <div className="space-y-4 p-4 px-6">
      <DashboardBreadcrumb />

      <div className="flex flex-col space-y-1">
        <span className="text-xl font-bold tracking-tight">Account</span>
        <span className="text-muted-foreground">Manage your account settings.</span>
      </div>
      <div className="flex space-x-6">
        {/* <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings.</p>
      </div> */}
        {/* <Separator className="my-6" /> */}
        <SettingsSidebar className="w-48 shrink-0" items={sidebarNavItems} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
