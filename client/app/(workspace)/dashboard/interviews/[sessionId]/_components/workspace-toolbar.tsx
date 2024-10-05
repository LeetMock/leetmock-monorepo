"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { UserDropdown } from "@/components/user-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  cn,
  getFirstLetter,
  getRandomColor,
  getTimeDurationSeconds,
  isDefined,
  minutesToMilliseconds,
} from "@/lib/utils";
import { TimerCountdown } from "./timer-countdown";
import { Button, buttonVariants } from "@/components/ui/button";
import { Loader2, Play, Settings } from "lucide-react";
import { CircleStop } from "lucide-react";
import { useConnectionState, useRoomContext } from "@livekit/components-react";
import { useConnection } from "@/hooks/use-connection";
import { ConnectionState } from "livekit-client";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAgent } from "@/hooks/use-agent";

interface WorkspaceToolbarProps {
  session: {
    sessionId: Id<"sessions">;
    sessionStatus: "not_started" | "in_progress" | "completed";
    questionId: Id<"questions">;
    sessionStartTime?: number;
  };
}

export const WorkspaceToolbar = ({ session }: WorkspaceToolbarProps) => {
  const { user } = useUser();
  const { theme } = useTheme();

  const room = useRoomContext();
  const connectionState = useConnectionState();
  const { connect, disconnect } = useConnection(room);
  const startSession = useMutation(api.sessions.startSession);
  const endSession = useMutation(api.sessions.endSession);

  const [timeLeft, setTimeLeft] = useState<number>(60 * 10);
  const [isEndInterviewDialogOpen, setIsEndInterviewDialogOpen] = useState<boolean>(false);
  const color = useMemo(() => getRandomColor(), []);

  const { state } = useAgent(session.sessionId);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDefined(session?.sessionStartTime)) return;

      const currentTime = Date.now();
      const endTime = session.sessionStartTime + minutesToMilliseconds(10);
      const timeLeft = getTimeDurationSeconds(currentTime, endTime);
      setTimeLeft(Math.max(timeLeft, 0));
    }, 500);

    return () => clearInterval(interval);
  }, [session, timeLeft]);

  const handleConnectionChange = useCallback(async () => {
    if (!isDefined(session)) return;
    if (connectionState === ConnectionState.Connecting) return;
    if (connectionState === ConnectionState.Connected) {
      setIsEndInterviewDialogOpen(true);
      return;
    }

    if (session.sessionStatus === "not_started") {
      const promise = startSession({ sessionId: session.sessionId }).then(() => connect());
      toast.promise(promise, {
        loading: "Starting interview...",
        success: "Interview has started!",
        error: "Failed to start interview",
      });
    } else {
      await connect();
    }
  }, [connectionState, startSession, session, connect]);

  const handleEndInterview = useCallback(async () => {
    if (!isDefined(session)) return;
    if (connectionState !== ConnectionState.Connected) return;

    await disconnect();
    const promise = endSession({ sessionId: session.sessionId });

    toast.promise(promise, {
      loading: "Ending interview...",
      success: "Interview ended successfully! 🎉",
      error: "Failed to end interview",
    });
  }, [connectionState, disconnect, endSession, session]);

  const buttonIcon = useMemo(() => {
    if (connectionState === ConnectionState.Connecting) {
      return <Loader2 className="w-3.5 h-3.5 animate-spin" />;
    }

    if (connectionState === ConnectionState.Connected) {
      return <CircleStop className="w-4 h-4 -mt-[1px]" />;
    }

    return <Play className="w-[0.7rem] h-[0.7rem]" />;
  }, [connectionState]);

  return (
    <div className="flex items-center w-full h-14 justify-between py-2 px-2.5 space-x-3 bg-background rounded-md shadow-md">
      <div className="flex items-center space-x-3 h-full">
        {/* <Avatar
          className={cn(
            "w-8 h-8 mt-px shadow-sm relative text-xs font-semibold ",
            theme === "dark" ? "text-gray-700" : "text-white"
          )}
        >
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center rounded-full",
              "hover:bg-muted-foreground/10 transition-colors duration-200"
            )}
          />
          <AvatarImage />
          <AvatarFallback className={cn(color, "text-base")}>
            {getFirstLetter(user?.fullName)}
          </AvatarFallback>
        </Avatar> */}
        <TimerCountdown timeLeft={timeLeft} className="h-9 min-w-24 rounded-md" />
      </div>
      <div className="flex items-center space-x-2.5 h-full">
        <UserDropdown align="end">
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-md">
            <Settings className="w-[1.2rem] h-[1.2rem]" />
          </Button>
        </UserDropdown>
        <AlertDialog open={isEndInterviewDialogOpen} onOpenChange={setIsEndInterviewDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>End Interview Session</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to end this interview? This action cannot be undone and will
                permanently conclude the current session.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className={buttonVariants({ variant: "destructive" })}
                onClick={handleEndInterview}
              >
                End Interview
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button
          variant="ringHover"
          className={cn(
            !isDefined(session) && "hidden",
            "h-9 rounded-md text-sm text-[0.8rem] px-3 min-w-24 flex items-center",
            connectionState === ConnectionState.Connected
              ? "bg-red-500 text-white hover:bg-red-600 hover:ring-red-500"
              : "bg-blue-500 text-white hover:bg-blue-600 hover:ring-blue-500"
          )}
          disabled={connectionState === ConnectionState.Connecting}
          onClick={handleConnectionChange}
        >
          {buttonIcon}
          {connectionState !== ConnectionState.Connecting && (
            <span
              className={cn("ml-1.5", connectionState === ConnectionState.Connected && "-mt-[1px]")}
            >
              {connectionState === ConnectionState.Connected
                ? "End"
                : session?.sessionStatus === "not_started"
                  ? "Start"
                  : "Resume"}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};
