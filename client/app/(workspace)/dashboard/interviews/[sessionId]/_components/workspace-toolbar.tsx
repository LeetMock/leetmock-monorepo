"use client";

import { Tooltip } from "@/components/tooltip";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/user-dropdown";
import { Doc } from "@/convex/_generated/dataModel";
import { useSessionSidebar } from "@/hooks/use-session-sidebar";
import { cn } from "@/lib/utils";
import { useVoiceAssistant } from "@livekit/components-react";
import { motion } from "framer-motion";
import { PanelLeftOpen, Settings } from "lucide-react";
import { SessionButton } from "./session-button";

interface WorkspaceToolbarProps {
  session: Doc<"sessions">;
}

const ConnectionStatus = () => {
  const { state } = useVoiceAssistant();

  const getStatusInfo = () => {
    switch (state) {
      case "listening":
        return { color: "bg-emerald-500", text: "Listening" };
      case "thinking":
        return { color: "bg-amber-500", text: "Thinking" };
      case "speaking":
        return { color: "bg-primary", text: "Speaking" };
      case "connecting":
        return { color: "bg-muted", text: "Connecting" };
      case "initializing":
        return { color: "bg-green-500", text: "Initializing" };
      case "disconnected":
        return { color: "bg-red-500", text: "Disconnected" };
      default:
        return { color: "bg-gray-500", text: "Unknown" };
    }
  };

  const { color, text } = getStatusInfo();

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/5 dark:bg-white/5">
      <motion.div
        className={cn("w-2 h-2 rounded-full transition-colors duration-200", color)}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
        }}
      />
      <span className="text-xs font-medium text-muted-foreground">{text}</span>
    </div>
  );
};

export const WorkspaceToolbar = ({ session }: WorkspaceToolbarProps) => {
  const { collapsed, setCollapsed } = useSessionSidebar();

  return (
    <div className="flex items-center w-full justify-between">
      <div className="flex items-center gap-2">
        {collapsed && (
          <Tooltip content="Expand">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setCollapsed(false)}
              className={"transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10"}
            >
              <PanelLeftOpen className="w-4 h-4 text-primary" />
            </Button>
          </Tooltip>
        )}
        <ConnectionStatus />
      </div>
      <div className="flex items-center space-x-2 h-full">
        <UserDropdown align="end">
          <div className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-all duration-200">
            <Settings className="w-[1.2rem] h-[1.2rem]" />
          </div>
        </UserDropdown>
        <SessionButton session={session} />
      </div>
    </div>
  );
};
