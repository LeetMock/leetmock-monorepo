import Link from "next/link";
import { Package2 } from "lucide-react";

import { NavList } from "./dashboard-navlist";
import { UpgradeCard } from "./upgrade-card";
import { UserProfile } from "./user-profile";

export const DashboardSidebar = () => {
  return (
    <div className="flex h-full flex-col space-y-2 border-r bg-muted/30 w-72 flex-shrink-0 pb-2">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-3">
          <Package2 className="h-6 w-6" />
          <span className="font-semibold text-xl">LeetMock</span>
        </Link>
      </div>
      <div className="flex-1">
        <NavList />
      </div>
      <div className="px-2">
        <UpgradeCard />
      </div>
      <UserProfile />
    </div>
  );
};
