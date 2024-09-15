import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@clerk/clerk-react";
import { ChevronsUpDown, LaptopIcon, LogOut, MoonIcon, SunIcon, UserIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { User } from "@clerk/nextjs/server";
import Link from "next/link";
import { Settings, CreditCard, Star } from "lucide-react";

enum PriceTier {
  FREE = 0,
  PRO = 1,
}

const priceTiers = [
  {
    name: "Free",
    description: "Free tier",
    value: PriceTier.FREE,
    className: "bg-gray-100 text-gray-800",
  },
  {
    name: "Premium",
    description: "Premium tier",
    value: PriceTier.PRO,
    className: "bg-blue-100 text-blue-800",
  },
];

const TierBadge = ({ tier }: { tier: PriceTier }) => {
  const tierData = priceTiers.find((t) => t.value === tier);
  return (
    <div
      className={cn(
        "flex items-center px-2 py-1 rounded-full text-xs font-medium",
        tierData?.className
      )}
    >
      <Star className="w-3 h-3 mr-1" />
      {tierData?.name}
    </div>
  );
};

interface ProfileItemProps extends ButtonProps {
  user: ReturnType<typeof useUser>["user"];
}

function getInitials(firstName: string | null | undefined, lastName: string | null | undefined) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`;
}

const ProfileItem: React.FC<ProfileItemProps> = ({ user, ...props }) => {
  const initials = getInitials(user?.firstName, user?.lastName);

  return (
    <div
      className={cn(
        "flex items-center justify-between hover:bg-muted rounded-sm pl-3 pr-2.5 py-4",
        "transition-all duration-200 cursor-pointer mx-3",
        props
      )}
    >
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <p className="text-sm font-medium">{user?.fullName}</p>
          <p className="text-sm text-muted-foreground">{user?.emailAddresses[0].emailAddress}</p>
        </div>
      </div>
      <ChevronsUpDown className="w-[1.2rem] h-[1.2rem] text-muted-foreground" />
    </div>
  );
};

export const UserProfile = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  // Assuming the user's tier is stored somewhere. For this example, we'll use PRO.
  const userTier = PriceTier.PRO;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <ProfileItem user={user} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" forceMount>
        <div className="flex flex-col space-y-4">
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
          <div className="bg-muted p-3 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Current Plan</span>
              <TierBadge tier={userTier} />
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="rounded-none py-2">
            {theme === "dark" ? (
              <SunIcon className="w-4 h-4 mr-2" />
            ) : (
              <MoonIcon className="w-4 h-4 mr-2" />
            )}
            <span className="-mt-0.5">Theme</span>
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
          <DropdownMenuItem asChild className="rounded-none py-2">
            <Link href="/dashboard/settings/account" className="w-full">
              <UserIcon className="mr-2 h-4 w-4" />
              <span className="-mt-0.5">Account</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-none py-2">
            <Link href="/dashboard/settings/billing" className="w-full flex items-center">
              <CreditCard className="mr-2 h-4 w-4" />
              <span className="-mt-0.5">Billing</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="rounded-t-none py-2" onClick={() => signOut()}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
