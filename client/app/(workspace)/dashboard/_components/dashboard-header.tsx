import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useSidebar } from "@/hooks/use-sidebar";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

export const DashboardHeader: React.FC<{ className?: string }> = ({ className }) => {
  const { setOpen } = useSidebar();

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex h-12 items-center gap-4 justify-between">
        <Logo showText />
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
