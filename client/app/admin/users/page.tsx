"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { DataTable } from "@/app/admin/users/_components/data-table";
import { columns } from "@/app/admin/users/_components/columns";
import { UserFilters } from "@/app/admin/users/_components/user-filters";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const router = useRouter();
  const userProfile = useQuery(api.userProfiles.getUserProfile);
  const users = useQuery(api.userProfiles.getAllUsers);
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    subscription: "all",
    status: "all",
  });

  // Check admin access
  useEffect(() => {
    if (userProfile && userProfile.profile?.role !== "admin") {
      toast.error("Only administrators can access this page");
      router.push("/dashboard");
    }
  }, [userProfile, router]);

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter(user => {
      const matchesSearch = (
        user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.userId.toLowerCase().includes(filters.search.toLowerCase())
      );

      const matchesRole = filters.role === "all" || user.role === filters.role;
      const matchesSubscription = filters.subscription === "all" ||
        user.subscription === filters.subscription;
      const matchesStatus = filters.status === "all" ||
        user.subscriptionStatus === filters.status;

      return matchesSearch && matchesRole && matchesSubscription && matchesStatus;
    });
  }, [users, filters]);

  if (!userProfile) {
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
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor user activities across the platform
          </p>
        </div>

        <UserFilters filters={filters} setFilters={setFilters} />

        <div className="rounded-md border">
          <DataTable data={filteredUsers || []} columns={columns} />
        </div>
      </div>
    </div>
  );
} 