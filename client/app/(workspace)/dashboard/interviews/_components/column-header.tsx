import { ArrowDownIcon, ArrowUpIcon, CaretSortIcon } from "@radix-ui/react-icons";
import { Column } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function ColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: ColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 data-[state=open]:bg-accent"
        onClick={() => column.toggleSorting()}
      >
        <span className="text-sm">{title}</span>
        <span className="w-4">
          {column.getIsSorted() === "desc" ? (
            <ArrowDownIcon className="ml-2 h-3 w-3" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUpIcon className="ml-2 h-3 w-3" />
          ) : (
            <CaretSortIcon className="ml-2 h-4 w-4" />
          )}
        </span>
      </Button>
    </div>
  );
}
