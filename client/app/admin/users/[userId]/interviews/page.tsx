"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { Loader2 } from "lucide-react";

export default function UserInterviewsPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  
  const userProfile = useQuery(api.userProfiles.getUserProfile);
  const targetUser = useQuery(api.userProfiles.getUserById, { userId });
  const userSessions = useQuery(api.sessions.getByUserId, { userId });

  if (!userProfile || !targetUser || !userSessions) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (userProfile.profile?.role !== "admin") {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/admin/users/${userId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Interview History</h1>
            <p className="text-muted-foreground">
              {targetUser.email} - {userSessions.length} interviews
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <DataTable data={userSessions} columns={columns} />
      </div>
    </div>
  );
} 