import Link from "next/link";
import { Package2, PlusCircle } from "lucide-react";

import { NavList } from "./dashboard-navlist";
import { UpgradeCard } from "./upgrade-card";
import { UserDropdown } from "@/components/user-dropdown";
import { ProfileItem } from "@/components/profile-item";
import { useConfig } from "@/hooks/use-config";

export const DashboardSidebar = () => {
  const { showUpgradeCard } = useConfig();

  return (
    <div className="flex h-full flex-col space-y-3 w-64 flex-shrink-0 pb-3 px-2">
      {/* Logo */}
      <div className="flex flex-col">
        <div className="flex h-14 items-center pl-1.5 pt-2">
          <Link href="/" className="flex items-center gap-3">
            <Package2 className="h-5 w-5" />
            <span className="font-semibold text-xl">LeetMock</span>
          </Link>
        </div>
        <div className="border-t" />
      </div>

      <NavList className="flex-1" />

      {showUpgradeCard && <UpgradeCard />}

      <UserDropdown>
        <ProfileItem />
      </UserDropdown>
    </div>
  );
};
