"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  BarChart, 
  Settings, 
  MessageSquare, 
  Code,
  Loader2 
} from "lucide-react";
import Link from "next/link";

interface AdminPageLink {
  href: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const adminPages: AdminPageLink[] = [
  {
    href: "/admin/users",
    title: "User Management",
    description: "Manage users, view profiles, and monitor activities",
    icon: Users
  },
  {
    href: "https://leetmock.grafana.net/goto/051vbacNg?orgId=1",
    title: "Grafana",
    description: "Platform statistics and performance metrics",
    icon: BarChart
  },
  {
    href: "/admin/questions",
    title: "Question Bank",
    description: "Manage interview questions and test cases",
    icon: Code
  },
  {
    href: "/admin/feedback",
    title: "Interview Feedback",
    description: "Review and manage interview feedback",
    icon: MessageSquare
  },
  {
    href: "/admin/settings",
    title: "System Settings",
    description: "Configure platform settings and parameters",
    icon: Settings
  }
];

export default function AdminDashboard() {
  const router = useRouter();
  const userProfile = useQuery(api.userProfiles.getUserProfile);

  useEffect(() => {
    if (userProfile && userProfile.profile?.role !== "admin") {
      toast.error("Only administrators can access this page");
      router.push("/dashboard");
    }
  }, [userProfile, router]);

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
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and monitor all aspects of the interview platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminPages.map((page) => (
            <Link key={page.href} href={page.href}>
              <Card className="p-6 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <page.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-semibold">{page.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {page.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 