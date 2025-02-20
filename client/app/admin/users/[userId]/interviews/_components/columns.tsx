"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { formatEpochTimeMilliseconds } from "@/lib/utils";

export const columns: ColumnDef<Doc<"sessions">>[] = [
  {
    accessorKey: "sessionStartTime",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("sessionStartTime") as number;
      return date ? formatEpochTimeMilliseconds(date) : "Not started";
    },
  },
  {
    accessorKey: "questionId",
    header: "Question",
    cell: ({ row }) => {
      // @ts-ignore
      const question = row.original.question;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{question?.title || "N/A"}</span>
          <span className="text-xs text-muted-foreground">
            {question?.difficulty ? `Difficulty: ${question.difficulty}` : ""}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "sessionStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("sessionStatus") as string;
      return (
        <Badge
          variant={
            status === "completed"
              ? "success"
              : status === "in_progress"
                ? "warning"
                : "secondary"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "evalReady",
    header: "Evaluation",
    cell: ({ row }) => {
      const evalReady = row.getValue("evalReady") as boolean;
      return (
        <Badge variant={evalReady ? "success" : "secondary"}>
          {evalReady ? "Ready" : "Pending"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const session = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href={`/dashboard/interviews/${session._id}/evaluation`}>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                <span>View Evaluation</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 