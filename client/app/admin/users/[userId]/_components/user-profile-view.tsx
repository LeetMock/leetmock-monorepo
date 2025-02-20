"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEpochTimeMilliseconds } from "@/lib/utils";

export function UserProfileView({ user }: { user: Doc<"userProfiles"> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium">Email</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div>
          <h3 className="font-medium">Role</h3>
          <p className="text-sm text-muted-foreground">{user.role}</p>
        </div>
        <div>
          <h3 className="font-medium">Subscription</h3>
          <p className="text-sm text-muted-foreground">{user.subscription}</p>
        </div>
        <div>
          <h3 className="font-medium">Minutes Remaining</h3>
          <p className="text-sm text-muted-foreground">{user.minutesRemaining}</p>
        </div>
        <div>
          <h3 className="font-medium">Subscription Period</h3>
          <p className="text-sm text-muted-foreground">
            {user.currentPeriodStart ? formatEpochTimeMilliseconds(user.currentPeriodStart) : 'N/A'} - 
            {user.currentPeriodEnd ? formatEpochTimeMilliseconds(user.currentPeriodEnd) : 'N/A'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 