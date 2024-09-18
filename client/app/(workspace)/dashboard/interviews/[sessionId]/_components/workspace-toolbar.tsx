"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { UserDropdown } from "@/components/user-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  cn,
  getFirstLetter,
  getTimeDurationSeconds,
  isDefined,
  minutesToMilliseconds,
  secondsToMilliseconds,
} from "@/lib/utils";
import { useRouter } from "next/navigation";
import { TimerCountdown } from "./timer-countdown";
import { Button } from "@/components/ui/button";
import { Loader2, Settings } from "lucide-react";
import { useConnectionState, useRoomContext } from "@livekit/components-react";
import { useConnection } from "@/hooks/useConnection";
import { ConnectionState } from "livekit-client";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { time } from "console";

interface WorkspaceToolbarProps {
  session?: {
    sessionId: Id<"sessions">;
    sessionStatus: "not_started" | "in_progress" | "completed";
    questionId: Id<"questions">;
    sessionStartTime?: number;
  };
}

export const WorkspaceToolbar: React.FC<WorkspaceToolbarProps> = ({ session }) => {
  const { user } = useUser();
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState<number>(60);

  const room = useRoomContext();
  const connectionState = useConnectionState();
  const { connect, disconnect } = useConnection(room);
  const startSession = useMutation(api.sessions.startSession);
  const endSession = useMutation(api.sessions.endSession);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDefined(session?.sessionStartTime)) return;

      const currentTime = Date.now();
      const endTime = session.sessionStartTime + minutesToMilliseconds(1);
      const timeLeft = getTimeDurationSeconds(currentTime, endTime);
      setTimeLeft(Math.max(timeLeft, 0));
    }, 500);

    return () => clearInterval(interval);
  }, [session, timeLeft]);

  // Connect to room
  const handleConnect = useCallback(async () => {
    if (!isDefined(session)) return;

    if (connectionState === ConnectionState.Connected) {
      disconnect();
    } else if (connectionState === ConnectionState.Disconnected) {
      await startSession({ sessionId: session.sessionId });
      await connect();
    }
  }, [connectionState, disconnect, startSession, session, connect]);

  const handleEndInterview = async () => {
    if (!isDefined(session)) return;

    disconnect();
    router.push("/dashboard/interviews");

    const promise = endSession({ sessionId: session.sessionId });
    toast.promise(promise, {
      loading: "Ending interview...",
      success: "Congratulations! You've completed the interview. 🎉",
      error: "Failed to end interview",
    });
  };

  return (
    <div className="flex items-center w-full justify-between p-2 px-3 space-x-3 bg-background rounded-md shadow-md">
      <TimerCountdown timeLeft={timeLeft} />
      {!!session && (
        <div className="flex items-center space-x-px">
          <Button
            className={cn(
              "w-full font-semibold text-white",
              connectionState === ConnectionState.Disconnected &&
                "bg-green-500 hover:bg-green-600 transition-all",
              connectionState === ConnectionState.Connecting &&
                "bg-gray-400 hover:bg-gray-500 transition-all",
              connectionState === ConnectionState.Connected &&
                "bg-red-500 text-white hover:bg-red-600 transition-all"
            )}
            variant={connectionState === ConnectionState.Connected ? "destructive" : "secondary"}
            disabled={connectionState === ConnectionState.Connecting}
            onClick={handleConnect}
          >
            {connectionState === ConnectionState.Connected ? (
              "Disconnect"
            ) : connectionState === ConnectionState.Connecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Connecting...
              </>
            ) : (
              <>Connect</>
            )}
          </Button>
          <Button variant="destructive" onClick={handleEndInterview}>
            End Interview
          </Button>
        </div>
      )}
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
        <UserDropdown align="end">
          <Avatar className="w-6 h-6 shadow-sm relative">
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center rounded-full",
                "hover:bg-muted-foreground/10 transition-colors duration-200"
              )}
            />
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>{getFirstLetter(user?.fullName)}</AvatarFallback>
          </Avatar>
        </UserDropdown>
      </div>
    </div>
  );
};
