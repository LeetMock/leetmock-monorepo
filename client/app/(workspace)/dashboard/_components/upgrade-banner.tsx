import Link from "next/link";
import { cn } from "@/lib/utils";
import { Terminal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDescription } from "@/components/ui/alert";
import { useTheme } from "next-themes";

export const UpgradeBanner: React.FC<{ className?: string }> = ({ className }) => {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border-b h-12",
        theme === "dark" ? "bg-gray-50" : "bg-gray-800",
        theme === "dark" ? "text-gray-900" : "text-gray-50",
        className
      )}
    >
      <div className="flex items-center space-x-3">
        <Terminal className="w-4 h-4" />
        <AlertDescription>
          <span className="font-medium">
            Upgrade to Pro to get more interview time! Check out our{" "}
            <Link href="/pricing" className="text-blue-500 hover:underline">
              pricing
            </Link>
            .
          </span>
          <span className="ml-3 text-xs">🎉</span>
        </AlertDescription>
      </div>

      <Button size="icon" variant="ghost">
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};
