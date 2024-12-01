"use client";

import { UserDropdown } from "@/components/user-dropdown";
import { Doc } from "@/convex/_generated/dataModel";
import { useAgent } from "@/hooks/use-agent";
import { getTimeDurationSeconds, isDefined, minutesToMilliseconds } from "@/lib/utils";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { SessionButton } from "./session-button";

interface WorkspaceToolbarProps {
  session: Doc<"sessions">;
}

export const WorkspaceToolbar = ({ session }: WorkspaceToolbarProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(60 * session.timeLimit);

  useAgent(session._id);
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDefined(session?.sessionStartTime)) return;

      const currentTime = Date.now();
      const endTime = session.sessionStartTime + minutesToMilliseconds(session.timeLimit);
      const timeLeft = getTimeDurationSeconds(currentTime, endTime);
      setTimeLeft(Math.max(timeLeft, 0));
    }, 500);

    return () => clearInterval(interval);
  }, [session, timeLeft]);

  return (
    <div className="flex items-center w-full justify-end">
      <div className="flex items-center space-x-2.5 h-full">
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
