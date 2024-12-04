"use client";

import { cn } from "@/lib/utils";
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
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (collapsed) {
    return (
      <div className={cn("flex flex-col items-center gap-1 py-2", className)} {...props}>
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium text-xs tabular-nums">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 bg-background/50 border rounded-md",
        className
      )}
      {...props}
    >
      <Clock className="w-4 h-4 text-muted-foreground" />
      <div className="flex items-baseline gap-1">
        <span className="font-medium tabular-nums">
          {String(minutes).padStart(2, "0")}
          <span className="text-muted-foreground text-xs mx-0.5">m</span>
          {String(seconds).padStart(2, "0")}
          <span className="text-muted-foreground text-xs ml-0.5">s</span>
        </span>
      </div>
    </div>
  );
};
