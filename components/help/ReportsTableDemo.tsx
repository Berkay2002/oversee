'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTablePagination } from '@/components/shared/data-table';
import { DataTableViewOptions } from '@/components/shared/data-table';
import { Input } from '@/components/ui/input';
import { demoReports } from './demo-data/reports';
import { Tables } from '@/types/database';
import { DataTableColumnHeader } from '@/components/shared/data-table';
import { HelpCircle } from 'lucide-react';

const columns: ColumnDef<Tables<'reports'>>[] = [
  {
    accessorKey: 'technician_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Technician" />
    ),
    cell: ({ row }) => (
      <div className="text-sm font-medium text-foreground/90">
        {row.getValue('technician_name')}
      </div>
    ),
  },
  {
    accessorKey: 'registration_numbers',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reg. No." />
    ),
    cell: ({ row }) => {
      const numbers = row.getValue('registration_numbers') as string[];
      return (
        <div className="text-sm text-foreground/80 max-w-[10rem] truncate">
          {numbers.join(', ')}
        </div>
      );
    },
  },
  {
    accessorKey: 'problem_description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Problem" />
    ),
    cell: ({ row }) => (
      <div className="pr-4 text-sm text-foreground/80 leading-snug line-clamp-2">
        {row.getValue('problem_description') as string}
      </div>
    ),
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const raw = row.getValue('created_at') as string;
      const date = new Date(raw);
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      return (
        <div className="text-sm text-foreground/70 whitespace-nowrap">
          {formattedDate}
        </div>
      );
    },
  },
];

export function ReportsTableDemo() {
  const [data] = React.useState(demoReports);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Interaktiv Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Input
              placeholder="Sök i problembeskrivning..."
          value={
            (table.getColumn('problem_description')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn('problem_description')?.setFilterValue(event.target.value)
          }
          className="h-8 max-w-sm"
        />
        <DataTableViewOptions table={table} />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Inga resultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Funktioner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <HelpCircle className="h-4 w-4 shrink-0 translate-y-0.5" />
            <span>
              <strong>Sök och filtrera:</strong> Använd sökfältet för att filtrera rapporterna baserat på problembeskrivningen.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <HelpCircle className="h-4 w-4 shrink-0 translate-y-0.5" />
            <span>
              <strong>Sortera kolumner:</strong> Klicka på kolumnrubrikerna för att sortera tabellen i stigande eller fallande ordning.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <HelpCircle className="h-4 w-4 shrink-0 translate-y-0.5" />
            <span>
              <strong>Dölj kolumner:</strong> Använd knappen &apos;View&apos; för att välja vilka kolumner som ska visas eller döljas.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
