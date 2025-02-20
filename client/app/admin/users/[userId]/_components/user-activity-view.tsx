"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UserActivityView({ userId }: { userId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity History</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Activity tracking coming soon...</p>
      </CardContent>
    </Card>
  );
} 