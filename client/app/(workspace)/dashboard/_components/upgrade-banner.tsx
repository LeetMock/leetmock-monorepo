import { AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/hooks/use-config";
import { cn } from "@/lib/utils";
import { Terminal, X } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

export const UpgradeBanner: React.FC<{ className?: string }> = ({ className }) => {
  const { theme } = useTheme();
  const { showPriceBanner } = useConfig();
  return (
    showPriceBanner && (
      <div
        className={cn(
          "flex items-center justify-between p-4 border-b h-11 pr-2.5",
          theme === "dark"
            ? "bg-gradient-to-r from-blue-700 to-purple-700"
            : "bg-gradient-to-r from-blue-100 to-purple-100",
          theme === "dark" ? "text-gray-100" : "text-gray-900",
          className
        )}
      >
        <div className="flex items-center space-x-3">
          <Terminal className="w-4 h-4" />
          <AlertDescription>
            <span className="font-medium">
              Upgrade to Pro to get more interview time! Check out our{" "}
              <Link href="/pricing" className="text-blue-500 hover:underline dark:text-blue-200">
                Pricing
              </Link>
              .
            </span>
          </AlertDescription>
        </div>
        <Button
          className="hover:bg-black/5 dark:hover:bg-white/10 h-7 w-7 transition-all duration-200"
          size="icon"
          variant="ghost"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    )
  );
};
