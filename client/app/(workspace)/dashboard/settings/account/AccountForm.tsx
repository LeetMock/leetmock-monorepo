"use client";

import {
  BellIcon,
  EyeNoneIcon,
  LayersIcon,
  PersonIcon,
  RocketIcon,
  TimerIcon,
} from "@radix-ui/react-icons";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@clerk/clerk-react";
import { useUserProfile } from "@/hooks/use-user-profile";

export function AccountForm() {
  const { user } = useUser();
  const { userProfile } = useUserProfile();

  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-md">
        <CardHeader className="pb-3 ">
          <CardTitle>Account</CardTitle>
          <CardDescription>Your current account information.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-1 pb-3">
          <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
            <PersonIcon className="mt-px h-5 w-5" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                {user!.primaryEmailAddress?.emailAddress}
              </p>
              <p className="text-sm text-muted-foreground">Your account email</p>
            </div>
          </div>
          <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
            <LayersIcon className="mt-px h-5 w-5" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                {userProfile!.subscription.charAt(0).toUpperCase() +
                  userProfile!.subscription.slice(1)}
              </p>
              <p className="text-sm text-muted-foreground">Your current subscription</p>
            </div>
          </div>
          <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
            <TimerIcon className="mt-px h-5 w-5" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                {userProfile!.minutesRemaining} minutes
              </p>
              <p className="text-sm text-muted-foreground">Interview Minutes remaining</p>
            </div>
          </div>
          <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
            <RocketIcon className="mt-px h-5 w-5" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">TBD / minute</p>
              <p className="text-sm text-muted-foreground">Charge beyond the tier minutes</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-md">
        <CardHeader className="pb-3 ">
          <CardTitle>Settings</CardTitle>
          <CardDescription>Your current settings.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-1 pb-3">
          <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
            <LayersIcon className="mt-px h-5 w-5" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Brian</p>
              <p className="text-sm text-muted-foreground">Preferred Voice Model</p>
            </div>
          </div>
          <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
            <TimerIcon className="mt-px h-5 w-5" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">GPT-4o</p>
              <p className="text-sm text-muted-foreground">Preferred LLM</p>
            </div>
          </div>
          <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
            <RocketIcon className="mt-px h-5 w-5" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">30 minutes</p>
              <p className="text-sm text-muted-foreground">Interview Length</p>
            </div>
          </div>
          <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
            <RocketIcon className="mt-px h-5 w-5" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">English</p>
              <p className="text-sm text-muted-foreground">Interview Language</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
