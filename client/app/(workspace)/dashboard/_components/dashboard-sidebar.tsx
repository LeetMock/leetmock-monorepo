import { Logo } from "@/components/logo";
import { ProfileItem } from "@/components/profile-item";
import { UserDropdown } from "@/components/user-dropdown";
import { useConfig } from "@/hooks/use-config";
import { useUserProfile } from "@/hooks/use-user-profile";
import { cn } from "@/lib/utils";
import { NavList } from "./dashboard-navlist";
import { UpgradeCard } from "./upgrade-card";
import { useEffect } from "react";
import { SubscriptionTier } from "@/convex/schema";

interface DashboardSidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export const DashboardSidebar = ({ className, ...props }: DashboardSidebarProps) => {
  const { showUpgradeCard, setShowPriceBanner, setShowUpgradeCard } = useConfig();
  const { userProfile } = useUserProfile();
  

  useEffect(() => {
    if (userProfile?.subscription && userProfile.subscription !== SubscriptionTier.FREE) {
      setShowUpgradeCard(false);
      setShowPriceBanner(false);
    } else {
      setShowUpgradeCard(true);
      setShowPriceBanner(true);
    }
  }, [userProfile, setShowUpgradeCard, setShowPriceBanner]);

  return (
    <div
      className={cn("flex h-full flex-col w-60 flex-shrink-0 pb-3 px-2.5", className)}
      {...props}
    >
      {/* Logo */}
      <div className="flex flex-col">
        <div className="flex h-12 items-center pl-1.5">
          <Logo showText />
        </div>
      </div>

      <NavList className="flex-1 mt-1" />

      {showUpgradeCard && <UpgradeCard className="mb-2.5" />}

      <UserDropdown className="w-56">
        <ProfileItem />
      </UserDropdown>
    </div>
  );
};
