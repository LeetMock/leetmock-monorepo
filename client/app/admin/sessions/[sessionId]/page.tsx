"use client";

import { StateVisualizer } from "@/components/state-visializer";
import { Wait } from "@/components/wait";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { isDefined } from "@/lib/utils";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { formatDistanceToNow, differenceInSeconds } from "date-fns";

export default function Home() {
  const { sessionId } = useParams();
  const agentStateSnapshot = useQuery(api.agentStates.getBySessionId, {
    sessionId: sessionId as Id<"sessions">,
  });

  const lastUpdated = useMemo(() => {
    if (!isDefined(agentStateSnapshot)) return undefined;
    return agentStateSnapshot.lastUpdated;
  }, [agentStateSnapshot]);

  const agentState = useMemo(() => {
    if (!isDefined(agentStateSnapshot)) return undefined;
    if (!isDefined(agentStateSnapshot.state)) return undefined;

    const state = JSON.parse(agentStateSnapshot.state);
    return state;
  }, [agentStateSnapshot]);

  const [now, setNow] = useState(new Date());

  // Update the current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 700);

    return () => clearInterval(interval);
  }, []);

  const formattedLastUpdated = useMemo(() => {
    if (!lastUpdated) return null;
    const date = new Date(lastUpdated);
    const secondsAgo = differenceInSeconds(now, date);

    if (secondsAgo < 60) {
      return `${secondsAgo} second${secondsAgo === 1 ? "" : "s"} ago`;
    }

    return formatDistanceToNow(date, { addSuffix: true });
  }, [lastUpdated, now]);

  const modifiedAgentState = useMemo(() => {
    if (!isDefined(agentState)) return undefined;
    agentState.current_stage_idx = Math.floor(Math.random() * 100);
    return agentState;
  }, [agentState, now]);

  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              Agent Graph State
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Session ID: {sessionId}</p>
          </div>
          {formattedLastUpdated && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-md">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              Last updated {formattedLastUpdated}
            </div>
          )}
        </div>
        <div className="h-[1px] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" />
      </div>

      <Wait data={{ agentState: modifiedAgentState }}>
        {({ agentState }) => <StateVisualizer state={agentState} />}
      </Wait>
    </main>
  );
}
