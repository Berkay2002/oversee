"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/shared/data-table";
import { DataTableRowActions } from "./data-table-row-actions";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/types/database";

// User with organization role (not profile role)
export type OrgUser = Omit<Database["public"]["Tables"]["profiles"]["Row"], "role"> & {
  role: Database["public"]["Enums"]["org_role"];
};

export const columns: ColumnDef<OrgUser>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Välj alla"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Välj rad"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Namn" />
    ),
    cell: ({ row }) => {
      return (
        <span className="max-w-[500px] truncate font-medium">
          {row.getValue("name")}
        </span>
      );
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Roll" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as Database["public"]["Enums"]["org_role"];
      const variant = role === 'owner' ? 'default' : role === 'admin' ? 'secondary' : 'outline';
      return (
        <Badge variant={variant}>
          {role}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gick med datum" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      const formattedDate = date.toLocaleDateString("sv-SE", {
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
