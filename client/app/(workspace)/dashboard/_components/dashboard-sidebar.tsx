import Link from "next/link";
import { Package2 } from "lucide-react";

import { NavList } from "./dashboard-navlist";
import { UpgradeCard } from "./upgrade-card";
import { UserDropdown } from "../../../../components/user-dropdown";
import { UserButton } from "../../../../components/user-button";

export const DashboardSidebar = () => {
  return (
    <div className="flex h-full flex-col space-y-3 w-72 flex-shrink-0 pb-3 px-2">
      {/* Logo */}
      <div className="flex h-14 items-center">
        <Link href="/" className="flex items-center gap-3">
          <Package2 className="h-6 w-6" />
          <span className="font-semibold text-xl">LeetMock</span>
        </Link>
      </div>
      <NavList className="flex-1" />
      <UpgradeCard />
      <UserDropdown>
        <UserButton />
      </UserDropdown>
    </div>
  );
};
