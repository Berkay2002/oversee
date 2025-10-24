"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/categories/data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { Tables } from "@/types/database";

export const columns: ColumnDef<Tables<"reports">>[] = [
  //
  // SELECT COLUMN
  //
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center px-2">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center px-2">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 36, // tighter
  },

  //
  // TECHNICIAN
  //
  {
    accessorKey: "technician_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Technician" />
    ),
    cell: ({ row }) => (
      <div className="px-3 text-sm font-medium text-foreground/90">
        {row.getValue("technician_name")}
      </div>
    ),
    size: 140,
  },

  //
  // REGISTRATION NUMBERS
  //
  {
    accessorKey: "registration_numbers",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reg. No." />
    ),
    cell: ({ row }) => {
      const numbers = row.getValue("registration_numbers") as string[];
      return (
        <div className="px-3 text-sm text-foreground/80 max-w-[10rem] truncate">
          {numbers.join(", ")}
        </div>
      );
    },
    size: 160,
  },

  //
  // DAYS TAKEN
  //
  {
    accessorKey: "days_taken",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Days" />
    ),
    cell: ({ row }) => (
      <div className="px-3 text-sm tabular-nums text-foreground/80">
        {row.getValue("days_taken")}
      </div>
    ),
    // narrow numeric column
    size: 64,
    meta: {
      align: "right",
    },
  },

  //
  // PROBLEM DESCRIPTION
  //
  {
    accessorKey: "problem_description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Problem" />
    ),
    cell: ({ row }) => (
      <div className=" text-sm text-foreground/80 leading-snug line-clamp-2 max-w-md">
        {row.getValue("problem_description") as string}
      </div>
    ),
    size: 480,
  },

  //
  // CREATED DATE
  //
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const raw = row.getValue("created_at") as string;
      const date = new Date(raw);
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      return (
        <div className="px-3 text-sm text-foreground/70 whitespace-nowrap text-right">
          {formattedDate}
        </div>
      );
    },
    size: 170,
    meta: {
      align: "right",
    },
  },

  //
  // ROW ACTIONS (3-dot menu)
  //
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex w-full items-center justify-end pr-2">
        <DataTableRowActions row={row} />
      </div>
    ),
    size: 40,
  },
];
