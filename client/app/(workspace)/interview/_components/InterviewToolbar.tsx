"use client";

import React from "react";
import { LucideVolume2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/clerk-react";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

const formatTimeV2 = (time: number): number[] => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return [Math.floor(minutes / 10), minutes % 10, Math.floor(seconds / 10), seconds % 10];
};

export const InterviewToolbar: React.FC = () => {
  const isAgentTalking = true;
  const timeLeft = 45 * 60;

  return (
    <div className="bg-secondary flex items-center w-full py-2 px-4 justify-end border-b-[1px]">
      <div className="flex items-center justify-center space-x-4">
        {/* <LucideVolume2
          className={cn(
            "w-4 h-4 opacity-0 text-blue-500",
            isAgentTalking ? "animate-pulse opacity-100" : ""
          )}
        /> */}
        <div className="flex items-center justify-center space-x-2">
          <ThemeToggleButton variant="ghost" className="hover:bg-gray-200 dark:hover:bg-gray-700" />
          <div className="h-8 font-semibold py-0.5 px-1 rounded-md flex items-center space-x-0.5 hover:bg-gray-200 transition-all select-none cursor-pointer dark:hover:bg-gray-700">
            <div className="px-1 py-0.5 rounded-sm text-sm">
              {formatTimeV2(timeLeft).slice(0, 2)}
            </div>
            <div className="py-0.5 rounded-sm text-sm">:</div>
            <div className="px-1 py-0.5 rounded-sm text-sm">
              {formatTimeV2(timeLeft).slice(2, 4)}
            </div>
          </div>
        </div>
        <UserButton />
      </div>
    </div>
  );
};
