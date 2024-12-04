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
      <div
        className={cn("flex flex-col items-center py-2 bg-muted/80 rounded-md", className)}
        {...props}
      >
        <Clock className="w-3.5 h-3.5 text-muted-foreground mb-1" />
        <span className="text-[11px] tabular-nums">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2 bg-background rounded-lg shadow-sm border",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex items-baseline gap-1 overflow-hidden">
          <div className="flex items-baseline">
            <span className="text-sm font-semibold tabular-nums">
              {String(minutes).padStart(2, "0")}
            </span>
            <span className="text-muted-foreground text-xs font-medium mx-0.5">m</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-sm font-semibold tabular-nums">
              {String(seconds).padStart(2, "0")}
            </span>
            <span className="text-muted-foreground text-xs font-medium ml-0.5">s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
