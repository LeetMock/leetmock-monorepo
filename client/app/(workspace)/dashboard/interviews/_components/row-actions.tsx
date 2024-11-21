"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Row } from "@tanstack/react-table";
import { MoreHorizontal, PlayCircle, FileText, BarChart3, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { SessionDoc } from "./columns";

interface RowActionsProps {
  row: Row<SessionDoc>;
}

export function RowActions({ row }: RowActionsProps) {
  const router = useRouter();
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
        <DropdownMenuItem
          onClick={() => router.push(`/dashboard/interviews/${session._id}`)}
          className="cursor-pointer"
        >
          <PlayCircle className="mr-2 h-4 w-4" />
          <span>Continue Interview</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(`/dashboard/interviews/${session._id}/evaluation`)}
          className="cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4" />
          <span>View Evaluation</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(`/dashboard/interviews/${session._id}/statistics`)}
          className="cursor-pointer"
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          <span>View Statistics</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Interview</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
