"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Doc } from "@/convex/_generated/dataModel";
import { ColumnHeader } from "./column-header";
import { difficulties, statuses } from "./data";
import { RowActions } from "./row-actions";
import { useRouter } from "next/navigation";

/*
{
    "_creationTime": 1725764789756.072,
    "_id": "j970zbrvzqqb7854m37n3bfa5n70cwwm",
    "agentThreadId": "508b6fff-7a52-4100-b072-46ba66d4a63e",
    "assistantId": "1906893f-ce3d-51c1-bc77-68c6bf3f29c6",
    "question": {
        "category": [
            "Array",
            "Hash Table"
        ],
        "difficulty": 1,
        "title": "Two Sum"
    },
    "questionId": "j57cb2bgmf95ndc8nrreqfa0gn70ahyh",
    "sessionStatus": "not_started",
    "userId": "user_2l0CgXdHXXShSwtApSLaRxfs1yc"
}
*/

export type SessionDoc = Doc<"sessions"> & {
  question: {
    category: string[];
    difficulty: number;
    title: string;
  };
};

export const columns: ColumnDef<SessionDoc>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px] mx-2"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px] mx-2"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "date",
    accessorKey: "_creationTime",
    header: ({ column }) => <ColumnHeader column={column} title="Date" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("date")).toLocaleDateString();
      return <div className="w-[80px]">{date}</div>;
    },
    filterFn: (row, id, value) => {
      const date = new Date(row.getValue("date")).toLocaleDateString();
      return date.toLowerCase().includes(value.toLowerCase());
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "title",
    accessorKey: "question.title",
    header: ({ column }) => <ColumnHeader column={column} title="Title" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">{row.original.question.title}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return row.original.question.title.toLowerCase().includes(value.toLowerCase());
    },
  },
  {
    id: "status",
    accessorKey: "sessionStatus",
    header: ({ column }) => <ColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = statuses.find((status) => status.value === row.getValue("status"));

      if (!status) {
        return null;
      }

      return (
        <div className="flex items-center">
          {status.icon && <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "difficulty",
    accessorKey: "question.difficulty",
    header: ({ column }) => <ColumnHeader column={column} title="Difficulty" />,
    cell: ({ row }) => {
      const difficulty = difficulties.find(
        (difficulty) => difficulty.value === row.original.question.difficulty.toString()
      );

      if (!difficulty) {
        return null;
      }

      return (
        <div className="flex items-center">
          {difficulty.icon && <difficulty.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
          <span>{difficulty.label}</span>
        </div>
      );
    },
  },
  {
    id: "feedback",
    header: ({ column }) => <ColumnHeader column={column} title="Feedback" />,
    cell: ({ row }) => {
      const router = useRouter();

      // Check if session has ended but evaluation is not ready
      if (row.original.sessionEndTime && !row.original.evalReady) {
        return (
          <div className="flex items-center">
            <span className="animate-pulse text-muted-foreground">Evaluating...</span>
          </div>
        );
      }

      return (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.push(`/dashboard/interviews/${row.original._id}/evaluation`)}
        >
          View Feedback
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActions row={row} />,
  },
];
