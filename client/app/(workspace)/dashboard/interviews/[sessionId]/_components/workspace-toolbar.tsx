"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { UserDropdown } from "@/components/user-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getFirstLetter } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { TimerCountdown } from "./timer-countdown";
import { Button } from "@/components/ui/button";
import { Loader2, Settings } from "lucide-react";
import { useConnectionState, useRoomContext } from "@livekit/components-react";
import { useConnection } from "@/hooks/useConnection";
import { ConnectionState } from "livekit-client";

export const WorkspaceToolbar: React.FC = () => {
  const { user } = useUser();
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState(15 * 60); // 30 minutes in seconds

  const room = useRoomContext();
  const connectionState = useConnectionState();
  const { connect, disconnect } = useConnection(room);

  useEffect(() => {
    // Timer functionality
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Time is up! The interview has ended.");
          handleEndInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Connect to room
  const handleConnect = useCallback(async () => {
    if (connectionState === ConnectionState.Connected) {
      disconnect();
    } else if (connectionState === ConnectionState.Disconnected) {
      await connect();
    }
  }, [connectionState, disconnect, connect]);

  const handleEndInterview = () => {
    if (confirm("Are you sure you want to end the interview?")) {
      alert("Interview ended.");
      // Implement additional logic here (e.g., navigate to summary page)
      router.push("/summary");
    }
  };

  return (
    <div className="flex items-center w-full justify-between p-2 px-3 space-x-3 bg-background rounded-md shadow-md">
      <TimerCountdown timeLeft={timeLeft} />

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
      </div>

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
