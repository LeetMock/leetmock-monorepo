"use client"

import { ColumnDef } from "@tanstack/react-table"


import { difficulties, statuses } from "@/components/dashboard/Data"
import { Doc, Id } from "@/convex/_generated/dataModel"
import { DataTableColumnHeader } from "@/components/dashboard/DataTableColumnHeader"
import { DataTableRowActions } from "@/components/dashboard/DataTableRowActions"
import { Checkbox } from "@radix-ui/react-checkbox"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

type SessionDoc = Doc<"sessions">;

export const columns: ColumnDef<SessionDoc>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "_creationTime",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Date" />
        ),
        cell: ({ row }) => {
            const date = new Date(row.getValue("_creationTime") as number).toLocaleDateString();
            return <div className="w-[80px]">{date}</div>;
        },
        enableSorting: true,
        enableHiding: false,
    },
    {
        accessorKey: "questionId",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Title" />
        ),
        cell: ({ row }) => {
            const question = useQuery(api.questions.getById, { questionId: row.getValue("questionId") as Id<"questions"> });
            return (
                <div className="flex space-x-2">
                    <span className="max-w-[500px] truncate font-medium">
                        {question?.title}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "sessionStatus",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = statuses.find(
                (status) => status.value === row.getValue("sessionStatus")
            )

            if (!status) {
                return null
            }

            return (
                <div className="flex w-[100px] items-center">
                    {status.icon && (
                        <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{status.label}</span>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: "difficulty",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Difficulty" />
        ),
        cell: ({ row }) => {
            const difficulty = difficulties.find(
                (difficulty) => difficulty.value === row.getValue("difficulty")
            )

            if (!difficulty) {
                return null
            }

            return (
                <div className="flex items-center">
                    {difficulty.icon && (
                        <difficulty.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{difficulty.label}</span>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]