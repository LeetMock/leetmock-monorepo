"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfileView } from "@/app/admin/users/[userId]/_components/user-profile-view";
import { UserActivityView } from "@/app/admin/users/[userId]/_components/user-activity-view";
import { UserInterviewsView } from "@/app/admin/users/[userId]/_components/user-interviews-view";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  
  const userProfile = useQuery(api.userProfiles.getUserProfile);
  const targetUser = useQuery(api.userProfiles.getUserById, { userId });
  const userSessions = useQuery(api.sessions.getByUserId, { userId });

  if (!userProfile || !targetUser) {
    return <div>Loading...</div>;
  }

  if (userProfile.profile?.role !== "admin") {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">User Details</h1>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <UserProfileView user={targetUser} />
        </TabsContent>

        <TabsContent value="activity">
          <UserActivityView userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 