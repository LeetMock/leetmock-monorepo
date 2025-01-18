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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useConnection } from "@/hooks/use-connection";
import { cn, isDefined } from "@/lib/utils";
import { useConnectionState, useRoomContext } from "@livekit/components-react";
import { useAction, useMutation } from "convex/react";
import { ConnectionState } from "livekit-client";
import { ChevronDown, CircleStop, Loader2, Play } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
interface SessionButtonProps {
  session: Doc<"sessions">;
}

interface SessionOption {
  title: string;
  description: string;
  onClick: () => Promise<void>;
}

export const SessionButton = ({ session }: SessionButtonProps) => {
  const room = useRoomContext();
  const connectionState = useConnectionState();

  const { connect, disconnect } = useConnection(room);
  const startSession = useMutation(api.sessions.startSession);
  const endSession = useMutation(api.sessions.endSession);
  const triggerEval = useAction(api.actions.triggerEval);

  const [sessionOptionIndex, setSessionOptionIndex] = useState<number>(0);
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

  const handleStartSession = useCallback(async () => {
    if (!isDefined(session)) return;
    if (connectionState !== ConnectionState.Disconnected) return;

    const promise =
      session.sessionStatus === "not_started"
        ? startSession({ sessionId: session._id }).then(() => connect())
        : connect();

    toast.promise(promise, {
      loading: "Connecting to interview session...",
      success: "Interview session connected!",
      error: "Failed to connect to interview session",
    });
  }, [connect, connectionState, session, startSession]);

  const handlePauseSession = useCallback(async () => {
    if (!isDefined(session)) return;
    if (connectionState !== ConnectionState.Connected) return;

    await disconnect();
  }, [connectionState, disconnect, session]);

  const handleEndSession = useCallback(async () => {
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

  const sessionOptions: SessionOption[] = useMemo(() => {
    return [
      {
        title: session.sessionStatus === "not_started" ? "Start Interview" : "Resume Interview",
        description:
          session.sessionStatus === "not_started"
            ? "Initialize a new interview session and establish connection with the AI interviewer."
            : "Continue your interview session from where you left off.",
        onClick: handleStartSession,
      },
      {
        title: "End Interview",
        description: "Conclude the interview session and generate final evaluation.",
        onClick: handleEndSession,
      },
      {
        title: "Pause Interview",
        description: "Temporarily suspend the interview session while preserving progress.",
        onClick: handlePauseSession,
      },
    ];
  }, [session, handleStartSession, handleEndSession, handlePauseSession]);

  const ButtonIcon = useMemo(() => {
    if (connectionState === ConnectionState.Connecting) {
      return Loader2;
    }

    if (connectionState === ConnectionState.Connected) {
      return CircleStop;
    }

    return Play;
  }, [connectionState]);

  return (
    <>
      {/* Template */}
      <div className="inline-flex -space-x-px divide-x divide-primary-foreground/30 rounded-lg shadow-sm shadow-black/5 rtl:space-x-reverse">
        <Button
          className={cn(
            !isDefined(session) && "hidden",
            "rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
            // connectionState === ConnectionState.Connected &&
            //   "bg-red-500 text-white hover:bg-red-600 hover:ring-red-500"
          )}
          disabled={connectionState === ConnectionState.Connecting}
          onClick={handleConnectionChange}
        >
          <ButtonIcon
            className={cn(
              "me-2 opacity-60",
              connectionState === ConnectionState.Connecting && "animate-spin"
            )}
            size={14}
            strokeWidth={2}
            aria-hidden="true"
          />
          Fork
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 h-9 w-9"
              size="icon"
              aria-label="Options"
            >
              <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {sessionOptions.map((option, index) => (
              <DropdownMenuItem
                key={option.title}
                className="flex flex-col items-start gap-1"
                onClick={() => setSessionOptionIndex(index)}
              >
                <span className="text-sm font-medium">{option.title}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Current Button */}
      {/* <Button
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
      </Button> */}
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
              onClick={handleEndSession}
            >
              End Interview
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
