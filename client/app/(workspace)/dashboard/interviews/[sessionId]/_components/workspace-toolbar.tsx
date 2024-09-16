"use client";

import React from "react";
import { useUser } from "@clerk/clerk-react";
import { UserDropdown } from "@/components/user-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";

const formatTimeV2 = (time: number): number[] => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return [Math.floor(minutes / 10), minutes % 10, Math.floor(seconds / 10), seconds % 10];
};

export const WorkspaceToolbar: React.FC = () => {
  const { user } = useUser();
  const timeLeft = 45 * 60;

  return (
    <div className="flex items-center w-full justify-end px-1 space-x-3">
      <div className="flex items-center justify-center space-x-2">
        {/* Timer */}
        <div
          className={cn(
            "h-8 font-semibold py-0.5 px-1 rounded-md flex items-center space-x-0.5",
            "hover:bg-gray-200 transition-all select-none cursor-pointer dark:hover:bg-gray-700"
          )}
        >
          <div className="px-1 py-0.5 rounded-sm text-sm">{formatTimeV2(timeLeft).slice(0, 2)}</div>
          <div className="py-0.5 rounded-sm text-sm">:</div>
          <div className="px-1 py-0.5 rounded-sm text-sm">{formatTimeV2(timeLeft).slice(2, 4)}</div>
        </div>
      </div>
      <UserDropdown align="end">
        <Avatar className="w-8 h-8 shadow-sm">
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
        </Avatar>
      </UserDropdown>
    </div>
  );
};
