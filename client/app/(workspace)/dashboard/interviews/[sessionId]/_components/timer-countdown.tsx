"use client";

import { cn, formatTime } from "@/lib/utils";
import { StopwatchIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

export interface TimerCountdownProps {
  timeLeft: number;
}

export const TimerCountdown = ({ timeLeft }: TimerCountdownProps) => {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        "flex items-center justify-center space-x-2 font-semibold h-7",
        "px-2 py-1 pr-1 rounded-sm select-none cursor-pointer text-sm",
        theme === "dark" ? "bg-yellow-800/10" : "bg-yellow-50",
        theme === "dark" ? "text-yellow-200" : "text-yellow-600",
        theme === "dark" ? "border border-yellow-600" : "border border-yellow-300"
      )}
    >
      <StopwatchIcon className="w-[0.9rem] h-[0.9rem]" />
      <span className="w-12 shrink-0">{formatTime(timeLeft)}</span>
    </div>
  );
};
