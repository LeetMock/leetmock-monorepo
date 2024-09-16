"use client";

import { cn, formatTime } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Clock, Timer } from "lucide-react";
import { useTheme } from "next-themes";

export interface TimerCountdownProps {
  timeLeft: number;
}

export const TimerCountdown = ({ timeLeft }: TimerCountdownProps) => {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        "flex items-center justify-center space-x-2 font-semibold",
        "px-2 py-1 pr-1 rounded-sm shadow-sm select-none cursor-pointer text-sm",
        theme === "dark" ? "bg-transparent" : "bg-yellow-50",
        theme === "dark" ? "text-yellow-200" : "text-yellow-600",
        theme === "dark" && "border border-yellow-600"
      )}
    >
      <Timer className="w-3.5 h-3.5 -mt-px" />
      <span className="w-12 shrink-0">{formatTime(timeLeft)}</span>
    </div>
  );
};
