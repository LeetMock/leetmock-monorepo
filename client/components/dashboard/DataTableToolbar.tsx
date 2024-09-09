"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { DataTableViewOptions } from "@/components/dashboard/DataTableViewOptions";

import { DataTableFacetedFilter } from "@/components/dashboard/DataTableFacetedFilter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { difficulties, statuses } from "@/components/dashboard/Data";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter Interviews..."
          value={(table.getColumn("question_title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("question_title")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("sessionStatus") && (
          <DataTableFacetedFilter
            column={table.getColumn("sessionStatus")}
            title="Status"
            options={statuses}
          />
        )}
        {table.getColumn("question_difficulty") && (
          <DataTableFacetedFilter
            column={table.getColumn("question_difficulty")}
            title="Difficulty"
            options={difficulties}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
