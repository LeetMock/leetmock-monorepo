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
import { Check, ChevronDown, CircleStop, Loader2, Play } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
interface SessionButtonProps {
  session: Doc<"sessions">;
}

type SessionOptionType = "start" | "end" | "pause";

interface SessionOption {
  key: SessionOptionType;
  title: string;
  description: string;
  onClick: () => Promise<void> | void;
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

    const connectPromise = connect().then(() => setSessionOptionIndex(1));

    const promise =
      session.sessionStatus === "not_started"
        ? startSession({ sessionId: session._id }).then(() => connectPromise)
        : connectPromise;

    toast.promise(promise, {
      loading: "Connecting to interview session...",
      success: "Interview session connected!",
      error: "Failed to connect to interview session",
    });
  }, [connect, connectionState, session, startSession]);

  const handlePauseSession = useCallback(async () => {
    if (!isDefined(session)) return;
    if (connectionState !== ConnectionState.Connected) {
      toast.error("You are not connected to the session");
      return;
    }

    disconnect();
    setSessionOptionIndex(0);
    toast.success("Session paused successfully! 🎉");
  }, [connectionState, disconnect, session]);

  const handleEndSession = useCallback(async () => {
    if (!isDefined(session)) return;
    if (connectionState !== ConnectionState.Connected) return;

    await disconnect();
    setSessionOptionIndex(0);

    const promise = Promise.all([
      endSession({ sessionId: session._id }),
      triggerEval({ sessionId: session._id }),
    ]);

    toast.promise(promise, {
      loading: "Ending session...",
      success: "Session ended successfully! 🎉",
      error: "Failed to end session",
    });
  }, [connectionState, disconnect, endSession, session, triggerEval]);

  const sessionOptions: SessionOption[] = useMemo(() => {
    return [
      {
        key: "start",
        title: session.sessionStatus === "not_started" ? "Start Session" : "Resume Session",
        description:
          session.sessionStatus === "not_started"
            ? "Initialize a new interview session and establish connection with the AI interviewer."
            : "Continue your interview session from where you left off.",
        onClick: handleStartSession,
      },
      {
        key: "end",
        title: "End Session",
        description: "Conclude the interview session and generate final evaluation.",
        onClick: () => setIsEndInterviewDialogOpen(true),
      },
      {
        key: "pause",
        title: "Pause Session",
        description: "Temporarily suspend the interview session while preserving progress.",
        onClick: handlePauseSession,
      },
    ];
  }, [session, handleStartSession, handlePauseSession]);

  const ButtonIcon = useMemo(() => {
    return connectionState === ConnectionState.Connecting
      ? Loader2
      : connectionState === ConnectionState.Connected
        ? CircleStop
        : Play;
  }, [connectionState]);

  return (
    <>
      {/* Template */}
      <div className="inline-flex -space-x-px divide-x divide-primary-foreground/30 rounded-lg shadow-sm shadow-black/5 rtl:space-x-reverse">
        <Button
          className={cn(
            !isDefined(session) && "hidden",
            "rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
          )}
          disabled={connectionState === ConnectionState.Connecting}
          onClick={sessionOptions[sessionOptionIndex].onClick}
        >
          <ButtonIcon
            className={cn(
              "me-2 opacity-70",
              connectionState === ConnectionState.Connecting && "animate-spin"
            )}
            size={14}
            strokeWidth={2}
            aria-hidden="true"
          />
          {connectionState !== ConnectionState.Connecting
            ? sessionOptions[sessionOptionIndex].title
            : "Connecting..."}
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
                className={cn(
                  "flex flex-col items-start gap-1 relative cursor-pointer",
                  index !== sessionOptionIndex
                )}
                onSelect={(e) => {
                  e.preventDefault();
                  setSessionOptionIndex(index);
                }}
              >
                <div className="flex items-center w-full gap-2">
                  <div
                    className={cn(
                      "flex-1 max-w-60 transition-opacity duration-100",
                      index === sessionOptionIndex ? "opacity-100" : "opacity-45",
                      "hover:opacity-100"
                    )}
                  >
                    <span className={cn("text-sm font-medium")}>{option.title}</span>
                    <span className="text-xs text-muted-foreground block">
                      {option.description}
                    </span>
                  </div>
                  <span className="text-primary">
                    <Check
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                      className={cn(index === sessionOptionIndex ? "opacity-100" : "opacity-0")}
                    />
                  </span>
                </div>
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
