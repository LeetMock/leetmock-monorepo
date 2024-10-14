"use client";

import {
  BellIcon,
  FaceIcon,
  LayersIcon,
  PersonIcon,
  RocketIcon,
  TimerIcon,
} from "@radix-ui/react-icons";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/use-user-profile";
import { MINUTE_PRICE_DISCOUNTED } from "@/lib/constants";
import { useUser } from "@clerk/clerk-react";

const InfoItem = ({ icon: Icon, title, description }) => (
  <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
    <Icon className="mt-px h-5 w-5" />
    <div className="space-y-1">
      <p className="text-sm font-medium leading-none">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

export function AccountForm() {
  const { user } = useUser();
  const { userProfile } = useUserProfile();
  if (!userProfile) return <div>No User Profile</div>;

  // Convert epoch time to local date string
  const formatDate = (epochTime: number | null) => {
    if (!epochTime) return "N/A";
    return new Date(epochTime * 1000).toLocaleDateString();
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-md">
        <CardHeader className="pb-3 ">
          <CardTitle>Account</CardTitle>
          <CardDescription>Your current account information.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-1 pb-3">
          <InfoItem
            icon={PersonIcon}
            title={user!.primaryEmailAddress?.emailAddress}
            description="Your account email"
          />
          <InfoItem
            icon={LayersIcon}
            title={
              <Badge
                variant={userProfile.subscription === "free" ? "outline" : "default"}
                className={
                  userProfile.subscription === "basic"
                    ? "bg-gradient-to-r from-blue-400 to-cyan-300 text-white font-semibold"
                    : userProfile.subscription === "premium"
                      ? "bg-gradient-to-r from-purple-400 to-pink-500 text-white font-semibold"
                      : userProfile.subscription === "enterprise"
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold animate-pulse"
                        : ""
                }
              >
                {!!userProfile.interval &&
                  (userProfile.interval === "month" ? "Monthly " : "Yearly ")}
                {userProfile.subscription.charAt(0).toUpperCase() +
                  userProfile.subscription.slice(1)}
              </Badge>
            }
            description="Your current subscription"
          />
          <InfoItem
            icon={TimerIcon}
            title={<Badge>{userProfile.minutesRemaining} minutes</Badge>}
            description="Interview Minutes remaining"
          />
          {userProfile.currentPeriodStart && userProfile.currentPeriodEnd && (
            <InfoItem
              icon={RocketIcon}
              title={
                <Badge>
                  {formatDate(userProfile.currentPeriodStart)} -{" "}
                  {formatDate(userProfile.currentPeriodEnd)}
                </Badge>
              }
              description="Current plan period"
            />
          )}
          {userProfile.refreshDate && (
            <InfoItem
              icon={BellIcon}
              title={
                <Badge>
                  {userProfile.interval === "year"
                    ? formatDate(userProfile.refreshDate)
                    : formatDate(userProfile.currentPeriodEnd!)}
                </Badge>
              }
              description="Minutes refresh date"
            />
          )}
          {userProfile.subscriptionStatus === "active" && (
            <InfoItem
              icon={FaceIcon}
              title={<Badge>${MINUTE_PRICE_DISCOUNTED} / minute</Badge>}
              description="Charge beyond the tier minutes"
            />
          )}
        </CardContent>
      </Card>
      <Card className="rounded-md">
        <CardHeader className="pb-3 ">
          <CardTitle>Settings</CardTitle>
          <CardDescription>Your current settings.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-1 pb-3">
          <InfoItem icon={LayersIcon} title="Brian" description="Preferred Voice Model" />
          <InfoItem icon={TimerIcon} title="GPT-4o" description="Preferred LLM" />
          <InfoItem icon={RocketIcon} title="30 minutes" description="Interview Length" />
          <InfoItem icon={RocketIcon} title="English" description="Interview Language" />
        </CardContent>
      </Card>
    </div>
  );
}
