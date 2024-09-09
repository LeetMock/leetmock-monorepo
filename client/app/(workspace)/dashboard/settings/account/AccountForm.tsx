"use client"

import { BellIcon, EyeNoneIcon, LayersIcon, PersonIcon, RocketIcon, TimerIcon } from "@radix-ui/react-icons"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useUser } from "@clerk/clerk-react";

export function AccountForm() {

  const { user } = useUser();

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-3 ">
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Your current account information.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-1 pb-3">
          <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
            <PersonIcon className="mt-px h-5 w-5" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                {user!.primaryEmailAddress?.emailAddress}
              </p>
              <p className="text-sm text-muted-foreground">
                Your account email
              </p>
            </div>
          </div>
        </CardContent>
      </Card >
      <Card>
        <CardHeader className="pb-3 ">
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            Your current subscription.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-1 pb-3">
          <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
            <LayersIcon className="mt-px h-5 w-5" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Free Tier</p>
              <p className="text-sm text-muted-foreground">
                Your account tier
              </p>
            </div>
          </div>
          <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
            <TimerIcon className="mt-px h-5 w-5" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">50 minutes</p>
              <p className="text-sm text-muted-foreground">
                Interview Minutes remaining
              </p>
            </div>
          </div>
          <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
            <RocketIcon className="mt-px h-5 w-5" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                $5.00 / minute
              </p>
              <p className="text-sm text-muted-foreground">
                Charge beyond the tier minutes 
              </p>
            </div>
          </div>
        </CardContent>
      </Card >
    </div>
  )
}