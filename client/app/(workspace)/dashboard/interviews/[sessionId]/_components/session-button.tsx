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
import { Check, ChevronDown, CircleStop, Loader2, Lock, Pause, Play } from "lucide-react";
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
  disabled: boolean;
  icon: React.ElementType;
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
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState<boolean>(false);

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

    const promise = Promise.all([
      endSession({ sessionId: session._id }),
      triggerEval({ sessionId: session._id }),
    ]);

    toast.promise(promise, {
      loading: "Ending session...",
      success: "Session ended successfully! 🎉",
      error: "Failed to end session",
    });
  }, [endSession, session, triggerEval]);

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
        disabled: connectionState !== ConnectionState.Disconnected,
        icon: Play,
      },
      {
        key: "pause",
        title: "Pause Session",
        description: "Temporarily suspend the interview session while preserving progress.",
        onClick: () => setIsSessionDialogOpen(true),
        disabled: connectionState !== ConnectionState.Connected,
        icon: Pause,
      },
      {
        key: "end",
        title: "End Session",
        description: "Conclude the interview session and generate final evaluation.",
        onClick: () => setIsSessionDialogOpen(true),
        disabled: connectionState === ConnectionState.Connecting,
        icon: CircleStop,
      },
    ];
  }, [session, handleStartSession, connectionState]);

  const ButtonIcon = useMemo(() => {
    return connectionState === ConnectionState.Connecting
      ? Loader2
      : sessionOptions[sessionOptionIndex].icon;
  }, [connectionState, sessionOptionIndex, sessionOptions]);

  return (
    <>
      <div className="inline-flex -space-x-px divide-x divide-primary-foreground/30 rounded-lg shadow-sm shadow-black/5 rtl:space-x-reverse">
        <Button
          className={cn(
            !isDefined(session) && "hidden",
            "rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10",
            "transition-all duration-200 ease-in-out"
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
              className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10 h-9 w-9"
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
                disabled={option.disabled}
              >
                <div className="flex items-center w-full gap-2 relative">
                  {option.disabled && (
                    <div className="absolute inset-0 bg-muted/50 rounded-md flex items-center justify-center">
                      <Lock size={16} strokeWidth={2} aria-hidden="true" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex-1 max-w-60 transition-all duration-100",
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
      <AlertDialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {sessionOptionIndex === 1 ? "Pause Session" : "End Session"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {sessionOptionIndex === 1
                ? "Are you sure you want to pause this interview? This will temporarily suspend the current session."
                : "Are you sure you want to end this interview? This action cannot be undone and will permanently conclude the current session."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={sessionOptionIndex === 1 ? handlePauseSession : handleEndSession}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
