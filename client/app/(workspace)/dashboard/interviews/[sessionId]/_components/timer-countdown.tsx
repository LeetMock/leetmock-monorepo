"use client";

import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { HTMLAttributes } from "react";

export interface TimerCountdownProps extends HTMLAttributes<HTMLDivElement> {
  timeLeft: number;
  collapsed?: boolean;
  totalTime?: number;
}

const getIndicatorColor = (timeLeft: number, totalTime: number = 3600) => {
  const percentage = (timeLeft / totalTime) * 100;

  if (percentage > 50) return "bg-green-500";
  if (percentage > 25) return "bg-yellow-500";
  return "bg-red-500";
};

export const TimerCountdown = ({
  timeLeft,
  className,
  collapsed,
  totalTime = 3600,
  ...props
}: TimerCountdownProps) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const indicatorColor = getIndicatorColor(timeLeft, totalTime);

  if (collapsed) {
    return (
      <div
        className={cn("flex flex-col items-center py-2 bg-muted/80 rounded-md", className)}
        {...props}
      >
        <div className="relative">
          <Clock className="w-3.5 h-3.5 text-muted-foreground mb-1" />
          <div
            className={cn("absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full", indicatorColor)}
          />
        </div>
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
      <div className="flex items-center gap-2 w-full pr-1">
        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex items-center gap-2 overflow-hidden justify-between flex-1">
          <div className="flex items-baseline gap-1">
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
          <div className={cn("w-1.5 h-1.5 rounded-full", indicatorColor)} />
        </div>
      </div>
    </div>
  );
};
