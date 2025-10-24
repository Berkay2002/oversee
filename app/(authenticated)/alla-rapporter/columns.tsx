"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/categories/data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { Tables } from "@/types/database";

export const columns: ColumnDef<Tables<'reports'>>[] = [
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
    accessorKey: "technician_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Technician" />
    ),
  },
  {
    accessorKey: "registration_numbers",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Registration Numbers" />
    ),
    cell: ({ row }) => {
      const numbers = row.getValue("registration_numbers") as string[];
      return <span>{numbers.join(', ')}</span>;
    },
  },
  {
    accessorKey: "days_taken",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Days Taken" />
    ),
  },
  {
    accessorKey: "problem_description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Problem" />
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created Date" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      const formattedDate = date.toLocaleDateString("en-US", {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      return (
        <span className="max-w-[500px] truncate">
          {formattedDate}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
