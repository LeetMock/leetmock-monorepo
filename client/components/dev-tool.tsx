"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useUserProfile } from "@/hooks/use-user-profile";
import { cn, isDefined } from "@/lib/utils";
import { useAuth } from "@clerk/clerk-react";
import { Wrench } from "lucide-react";
import { useConfig } from "@/hooks/use-config";
import { useState } from "react";
import { useTheme } from "next-themes";

const DevToolInner: React.FC<{}> = ({}) => {
  const { userProfile } = useUserProfile();
  const { theme, setTheme } = useTheme();
  const { showPriceBanner, setShowPriceBanner, showUpgradeCard, setShowUpgradeCard } = useConfig();

  const [showDevTool, setShowDevTool] = useState(false);

  if (!isDefined(userProfile)) {
    return null;
  }

  if (userProfile.role !== "admin") {
    return null;
  }

  return (
    <DropdownMenu open={showDevTool} onOpenChange={setShowDevTool}>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            "absolute right-8 bottom-8 shadow-md p-2.5 rounded-md cursor-pointer",
            "bg-background hover:bg-accent transition-all duration-200",
            "dark:bg-accent dark:hover:bg-accent/50 border"
          )}
        >
          <Wrench className="w-5 h-5" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
        <DropdownMenuLabel>Configurations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div
          className="flex justify-between items-center p-1.5"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <span>Price Banner</span>
          <Switch checked={showPriceBanner} onCheckedChange={setShowPriceBanner} />
        </div>
        <div
          className="flex justify-between items-center p-1.5"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <span>Upgrade Card</span>
          <Switch checked={showUpgradeCard} onCheckedChange={setShowUpgradeCard} />
        </div>
        <div
          className="flex justify-between items-center p-1.5"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <span>Dark Mode</span>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const DevTool: React.FC<{}> = ({}) => {
  const { isLoaded, isSignedIn } = useAuth();

  return <>{isLoaded && isSignedIn && <DevToolInner />}</>;
};
