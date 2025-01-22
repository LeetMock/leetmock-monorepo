"use client";

import { StateVisualizer } from "@/components/state-visializer";
import { Wait } from "@/components/wait";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { isDefined } from "@/lib/utils";
import { useConvex, useQuery } from "convex/react";
import { differenceInSeconds, formatDistanceToNow } from "date-fns";
import { notFound, useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function Home() {
  const { sessionId } = useParams();
  const convex = useConvex();

  const sessionExists = useQuery(api.sessions.exists, {
    sessionId: sessionId as string,
  });

  if (sessionExists === false) {
    notFound();
  }

  const [agentState, setAgentState] = useState<Record<string, any> | undefined>(undefined);

  const fetchAgentState = useCallback(async () => {
    const agentState = await convex.action(api.actions.getLangGraphAgentState, {
      sessionId: sessionId as Id<"sessions">,
    });

    setAgentState(agentState);
  }, [sessionId, convex]);

  const lastUpdated = useMemo(() => {
    if (!isDefined(agentState)) return undefined;
    return agentState.lastUpdated;
  }, [agentState]);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAgentState();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchAgentState]);

  // Update the current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

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

  console.log(agentState);

  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
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
      </div>

      <Wait data={{ agentState }}>
        {({ agentState }) => <StateVisualizer state={agentState} />}
      </Wait>
    </main>
  );
}
