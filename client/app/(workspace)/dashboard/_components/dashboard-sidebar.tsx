import Image from "next/image";
import Link from "next/link";

import { ProfileItem } from "@/components/profile-item";
import { UserDropdown } from "@/components/user-dropdown";
import { useConfig } from "@/hooks/use-config";
import { cn } from "@/lib/utils";
import { NavList } from "./dashboard-navlist";
import { UpgradeCard } from "./upgrade-card";

interface DashboardSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DashboardSidebar = ({ className, ...props }: DashboardSidebarProps) => {
  const { showUpgradeCard } = useConfig();

  return (
    <div
      className={cn("flex h-full flex-col space-y-3 w-64 flex-shrink-0 pb-3 px-2", className)}
      {...props}
    >
      {/* Logo */}
      <div className="flex flex-col">
        <div className="flex h-14 items-center pl-1.5 pt-2">
          <Link href="/" className="flex items-center gap-3">
            <div aria-hidden="true" className="flex items-center">
              <Image
                src="/logo.png"
                alt="LeetMock.AI Logo"
                width={32}
                height={32}
                className="h-6 w-auto"
              />
            </div>
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
