"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { UserDropdown } from "@/components/user-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getFirstLetter } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { TimerCountdown } from "./timer-countdown";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export const WorkspaceToolbar: React.FC = () => {
  const { user } = useUser();
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 30 minutes in seconds
  const router = useRouter();

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

  // Format time as MM:SS

  const handleEndInterview = () => {
    if (confirm("Are you sure you want to end the interview?")) {
      alert("Interview ended.");
      // Implement additional logic here (e.g., navigate to summary page)
      router.push("/summary");
    }
  };

  const progressPercentage = (timeLeft / (30 * 60)) * 100;

  return (
    <div className="flex items-center w-full justify-between p-2 px-3 space-x-3 bg-background rounded-md shadow-md">
      <TimerCountdown timeLeft={timeLeft} progressPercentage={progressPercentage} />
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
