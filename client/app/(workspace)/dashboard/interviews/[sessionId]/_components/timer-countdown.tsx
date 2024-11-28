"use client";

import { cn, formatTime } from "@/lib/utils";
import { Clock } from "lucide-react";
import { HTMLAttributes } from "react";

export interface TimerCountdownProps extends HTMLAttributes<HTMLDivElement> {
  timeLeft: number;
  collapsed?: boolean;
}

export const TimerCountdown = ({
  timeLeft,
  className,
  collapsed,
  ...props
}: TimerCountdownProps) => {
  return (
    <div
      className={cn(
        "flex font-semibold bg-accent rounded-md select-none cursor-pointer text-primary",
        collapsed
          ? "flex-col items-center justify-center space-y-1 aspect-square p-2"
          : "flex-row items-center justify-center space-x-2 px-3 h-full",
        className
      )}
      {...props}
    >
      <Clock className="w-4 h-4 shrink-0" />
      <span className={cn("font-mono text-sm", collapsed && "text-xs")}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
};
