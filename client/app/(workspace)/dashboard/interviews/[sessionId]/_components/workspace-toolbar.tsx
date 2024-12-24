"use client";

import { UserDropdown } from "@/components/user-dropdown";
import { Doc } from "@/convex/_generated/dataModel";
import { Settings } from "lucide-react";
import { SessionButton } from "./session-button";

interface WorkspaceToolbarProps {
  session: Doc<"sessions">;
}

export const WorkspaceToolbar = ({ session }: WorkspaceToolbarProps) => {
  return (
    <div className="flex items-center w-full justify-end">
      <div className="flex items-center space-x-2 h-full">
        <UserDropdown align="end">
          <div className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-all duration-200">
            <Settings className="w-[1.2rem] h-[1.2rem]" />
          </div>
        </UserDropdown>
        <SessionButton session={session} />
      </div>
    </div>
  );
};
