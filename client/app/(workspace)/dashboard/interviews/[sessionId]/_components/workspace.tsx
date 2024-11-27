import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { HTMLAttributes } from "react";
import { TimerCountdown } from "./timer-countdown";

export const Workspace: React.FC<{ sessionId: Id<"sessions"> }> = ({ sessionId }) => {
  return (
    <div className="bg-background h-screen w-full flex flex-col">
      {/* Header */}
      <div className="flex w-full border-b h-12">
        {/* Logo */}
        <Logo
          showText={false}
          className={cn(
            "items-center justify-center cursor-pointer w-12 hover:bg-accent",
            "transition-all duration-200"
          )}
        />
      </div>
      {/* Main */}
      <div className="flex justify-center flex-1">
        {/* Timeline */}
        <div className="w-56 h-full flex flex-col justify-between border-r relative group">
          Side
          <div className="w-full p-2 h-[3.2rem]">
            <TimerCountdown timeLeft={1000} className="h-full w-full" />
          </div>
          <CollapseButton className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" />
        </div>
        {/* Content */}
        <div className="h-full flex-1 justify-center items-center p-2 pt-0">Content</div>
      </div>
    </div>
  );
};

const CollapseButton: React.FC<HTMLAttributes<HTMLButtonElement>> = ({ className, ...props }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn("transition-all duration-200", className)}
            {...props}
          >
            <ChevronLeft className="w-4 h-4 text-primary" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Collapse</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
