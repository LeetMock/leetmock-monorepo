"use client";

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
import { Button, buttonVariants } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useConnection } from "@/hooks/use-connection";
import { cn, isDefined } from "@/lib/utils";
import { useConnectionState, useRoomContext } from "@livekit/components-react";
import { useMutation, useAction } from "convex/react";
import { ConnectionState } from "livekit-client";
import { CircleStop, Loader2, Play } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

interface SessionButtonProps {
  session: Doc<"sessions">;
}

export const SessionButton = ({ session }: SessionButtonProps) => {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const { connect, disconnect } = useConnection(room);
  const startSession = useMutation(api.sessions.startSession);
  const endSession = useMutation(api.sessions.endSession);
  const triggerEval = useAction(api.actions.triggerEval);
  const [isEndInterviewDialogOpen, setIsEndInterviewDialogOpen] = useState<boolean>(false);

  const handleConnectionChange = useCallback(async () => {
    if (!isDefined(session)) return;
    if (connectionState === ConnectionState.Connecting) return;
    if (connectionState === ConnectionState.Connected) {
      setIsEndInterviewDialogOpen(true);
      return;
    }

    if (session.sessionStatus === "not_started") {
      const promise = startSession({ sessionId: session._id }).then(() => connect());
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
    const promise = endSession({ sessionId: session._id });
    const evalPromise = triggerEval({ sessionId: session._id });

    toast.promise(Promise.all([promise, evalPromise]), {
      loading: "Ending interview...",
      success: "Interview ended successfully! 🎉",
      error: "Failed to end interview",
    });
  }, [connectionState, disconnect, endSession, session, triggerEval]);

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
    <>
      <Button
        variant="ringHover"
        className={cn(
          !isDefined(session) && "hidden",
          "h-8 rounded-md text-sm text-[0.8rem] px-3 min-w-24 flex items-center",
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
    </>
  );
};
