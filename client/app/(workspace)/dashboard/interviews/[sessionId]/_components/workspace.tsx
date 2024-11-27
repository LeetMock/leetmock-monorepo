import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Wait } from "@/components/wait";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConnection } from "@/hooks/use-connection";
import { useEditorStore } from "@/hooks/use-editor-store";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { ChevronLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { HTMLAttributes } from "react";
import { toast } from "sonner";
import { TimerCountdown } from "./timer-countdown";
import { WorkspaceToolbar } from "./workspace-toolbar";

export const Workspace: React.FC<{ sessionId: Id<"sessions"> }> = ({ sessionId }) => {
  const session = useQuery(api.sessions.getById, { sessionId });
  const { disconnect } = useConnection();
  const { reset } = useEditorStore();

  if (session?.sessionStatus === "completed") {
    disconnect();
    reset();
    toast.success("Congratulations! You've completed the interview. 🎉");
    return redirect("/dashboard/interviews");
  }

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
          <CollapseButton className="opacity-0 group-hover:opacity-100" />
        </div>
        <div className="w-full h-full flex flex-col justify-between">
          Side
          <div className="w-full p-2 h-12">
            <TimerCountdown timeLeft={1000} className="h-full w-full" />
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center flex-1 bg-accent">
        <div className={cn("w-full h-14 flex items-center justify-center px-2")}>
          <Wait data={{ session }}>{({ session }) => <WorkspaceToolbar session={session} />}</Wait>
        </div>
        <div className="w-full h-full flex justify-center items-center p-2 pt-0">
          <div className="w-full h-full bg-background rounded-sm shadow-sm"></div>
        </div>
      </div>
    </div>
  );
}; // Dependencies: pnpm install lucide-react

const CollapseButton: React.FC<HTMLAttributes<HTMLButtonElement>> = ({ className, ...props }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "transition-all duration-200 opacity-0 group-hover:opacity-100",
              className
            )}
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
