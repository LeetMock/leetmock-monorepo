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
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const DevToolInner: React.FC<{}> = ({ }) => {
  const { userProfile } = useUserProfile();
  const { theme, setTheme } = useTheme();
  const { showPriceBanner, setShowPriceBanner, showUpgradeCard, setShowUpgradeCard } = useConfig();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [showDevTool, setShowDevTool] = useState(false);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [sessionId, setSessionId] = useState("");

  if (!isDefined(userProfile)) {
    return null;
  }

  if (userProfile.role !== "admin") {
    return null;
  }

  const handleProblemSetClick = () => {
    if (!isSignedIn) {
      router.push("/auth?action=signin");
      return;
    }
    router.push('/admin/questions');
  };

  const handleMainAdminClick = () => {
    if (!isSignedIn) {
      router.push("/auth?action=signin");
      return;
    }
    router.push('/admin');
  };

  const handleViewSession = () => {
    if (!isSignedIn) {
      router.push("/auth?action=signin");
      return;
    }
    if (!sessionId.trim()) return;
    router.push(`/admin/sessions/${sessionId}`);
    setShowSessionDialog(false);
    setSessionId("");
  };

  return (
    <>
      <DropdownMenu open={showDevTool} onOpenChange={setShowDevTool}>
        <DropdownMenuTrigger asChild>
          <div
            className={cn(
              "fixed shadow-lg p-3 rounded-full cursor-pointer bottom-6 right-6",
              "bg-background/90 backdrop-blur-sm transition-all duration-200",
              "hover:shadow-xl hover:scale-105 hover:bg-accent/5",
              "dark:bg-accent/90 dark:hover:bg-accent/70",
              "opacity-50 hover:opacity-100"
            )}
          >
            <Wrench className="w-5 h-5" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-72 p-2"
          align="end"
          sideOffset={16}
        >
          <div className="space-y-4">
            {/* Header */}
            <div>
              <DropdownMenuLabel className="text-lg font-semibold px-2">
                Developer Tools
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-2" />
            </div>

            {/* Toggles Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground px-2">
                Display Settings
              </h3>
              <div className="space-y-1">
                {[
                  { label: "Price Banner", checked: showPriceBanner, onChange: setShowPriceBanner },
                  { label: "Upgrade Card", checked: showUpgradeCard, onChange: setShowUpgradeCard },
                  {
                    label: "Dark Mode",
                    checked: theme === "dark",
                    onChange: (checked) => setTheme(checked ? "dark" : "light")
                  }
                ].map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "flex items-center justify-between px-2 py-1.5",
                      "rounded-md hover:bg-accent/50 transition-colors"
                    )}
                  >
                    <span className="text-sm">{item.label}</span>
                    <Switch
                      checked={item.checked}
                      onCheckedChange={item.onChange}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground px-2">
                Admin Actions
              </h3>
              <div className="grid grid-cols-2 gap-2 px-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleProblemSetClick}
                  className="w-full hover:bg-accent/50"
                >
                  Problem Set
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowDevTool(false);
                    setShowSessionDialog(true);
                  }}
                  className="w-full hover:bg-accent/50"
                >
                  View Session
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMainAdminClick}
                  className="w-full hover:bg-accent/50"
                >
                  Main Admin
                </Button>
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter Session ID</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Session ID"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleViewSession();
                  }
                }}
              />
              <Button onClick={handleViewSession}>View</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const DevTool: React.FC<{}> = ({ }) => {
  const { isLoaded, isSignedIn } = useAuth();

  return <>{isLoaded && isSignedIn && <DevToolInner />}</>;
};
