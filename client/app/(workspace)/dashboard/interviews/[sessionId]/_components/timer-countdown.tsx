"use client";

import { cn, formatTime } from "@/lib/utils";
import { Timer } from "lucide-react";
import { useTheme } from "next-themes";
import { HTMLAttributes } from "react";
export interface TimerCountdownProps extends HTMLAttributes<HTMLDivElement> {
  timeLeft: number;
}

export const TimerCountdown = ({ timeLeft, className, ...props }: TimerCountdownProps) => {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        "flex items-center justify-center space-x-2 font-semibold bg-accent/80 border",
        "px-2 rounded-sm select-none cursor-pointer text-sm w-20 text-muted-foreground",
        className
      )}
      {...props}
    >
      <Timer className="w-4 h-4" />
      <span className="text-base shrink-0 font-mono">{formatTime(timeLeft)}</span>
    </div>
  );
};
