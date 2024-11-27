import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

export const Workspace: React.FC<{ sessionId: Id<"sessions"> }> = ({ sessionId }) => {
  return (
    <div className="bg-background h-screen w-full flex">
      <div className="w-56 bg-background flex flex-col h-full">
        <div
          className={cn(
            "w-full flex items-center justify-between pl-4 pr-2 h-14",
            "cursor-pointer group"
          )}
        >
          <Logo />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-4 h-4 text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Collapse</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="w-full h-full"></div>
      </div>
      <div className="flex flex-col justify-center items-center flex-1 bg-accent">
        <div className={cn("w-full h-14 flex items-center px-2")}></div>
        <div className="w-full h-full flex justify-center items-center p-2 pt-0">
          <div className="w-full h-full bg-background rounded-sm shadow-sm"></div>
        </div>
      </div>
    </div>
  );
};
