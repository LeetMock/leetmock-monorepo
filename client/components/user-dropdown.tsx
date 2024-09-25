import { cn, getInitials } from "@/lib/utils";
import { useUser, useAuth } from "@clerk/clerk-react";
import { ChevronsUpDown, LaptopIcon, LogOut, MoonIcon, SunIcon, UserIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ButtonProps } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { PriceTier, TierBadge } from "../app/(workspace)/dashboard/_components/tier-badge";
import { useUserProfile } from "@/hooks/use-user-profile";

export const UserDropdown: React.FC<{
  children: React.ReactNode;
  align?: "center" | "end" | "start";
}> = ({ children, align }) => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { userProfile } = useUserProfile();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" forceMount align={align} sideOffset={6}>
        <div className="flex flex-col space-y-3 mt-3">
          <div className="flex flex-col items-center space-y-2">
            <Avatar>
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          {userProfile && (
            <div className="bg-muted p-2.5 rounded-sm">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Current Plan</span>
                <TierBadge
                  tier={userProfile.role === "admin" ? PriceTier.Premium : PriceTier.Free}
                />
              </div>
            </div>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {theme === "dark" ? (
              <SunIcon className="w-4 h-4 mr-2" />
            ) : (
              <MoonIcon className="w-4 h-4 mr-2" />
            )}
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <SunIcon className="w-4 h-4 mr-2" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <MoonIcon className="w-4 h-4 mr-2" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <LaptopIcon className="w-4 h-4 mr-2" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings/account" className="w-full">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Account</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings/billing" className="w-full flex items-center">
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            signOut({
              redirectUrl: "/auth?action=signin",
            })
          }
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
