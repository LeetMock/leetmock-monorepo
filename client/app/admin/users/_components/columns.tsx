"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Video } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { formatEpochTimeMilliseconds } from "@/lib/utils";

export const columns: ColumnDef<Doc<"userProfiles">>[] = [
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("email")}</span>
          <span className="text-xs text-muted-foreground">{row.original.userId}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge variant={role === "admin" ? "default" : "secondary"}>
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "subscription",
    header: "Plan",
    cell: ({ row }) => {
      const subscription = row.getValue("subscription") as string;
      return (
        <Badge variant="outline">
          {subscription}
        </Badge>
      );
    },
  },
  {
    accessorKey: "minutesRemaining",
    header: "Minutes",
    cell: ({ row }) => row.getValue("minutesRemaining"),
  },
  {
    accessorKey: "currentPeriodEnd",
    header: "Subscription End",
    cell: ({ row }) => {
      const date = row.getValue("currentPeriodEnd") as number;
      return date ? formatEpochTimeMilliseconds(date) : "N/A";
    },
  },
  {
    accessorKey: "subscriptionStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("subscriptionStatus") as string;
      return (
        <Badge variant={status === "active" ? "success" : "destructive"}>
          {status || "inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href={`/admin/users/${user.userId}`}>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                <span>View Details</span>
              </DropdownMenuItem>
            </Link>
            <Link href={`/admin/users/${user.userId}/interviews`}>
              <DropdownMenuItem>
                <Video className="mr-2 h-4 w-4" />
                <span>View Interviews</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 