'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Star, Pencil, Trash2 } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import type { Location } from '@/lib/actions/location';
import type { LocationsColumnMeta } from './columns';

interface LocationsTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function LocationsTable<TData, TValue>({
  columns,
  data,
}: LocationsTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const isMobile = useMobile();

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Mobile card view
  if (isMobile) {
    const locations = data as Location[];
    if (!locations.length) {
      return (
        <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
          Inga platser hittades.
        </div>
      );
    }

    // Extract meta from first column (actions column)
    const actionsColumn = columns.find((col) => 'id' in col && col.id === 'actions');
    const meta = actionsColumn?.meta as LocationsColumnMeta | undefined;

    return (
      <div className="space-y-3">
        {locations.map((location) => (
          <Card key={location.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{location.name}</h3>
                    {location.is_default && (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Standard
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Skapad{' '}
                    {new Date(location.created_at).toLocaleDateString('sv-SE', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {meta && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Öppna meny</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Åtgärder</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {!location.is_default && (
                        <DropdownMenuItem
                          onClick={() => meta.onSetDefault(location.id)}
                          className="gap-2"
                        >
                          <Star className="h-4 w-4" />
                          Sätt som standard
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => meta.onEdit(location)}
                        className="gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        Redigera
                      </DropdownMenuItem>
                      {!location.is_default && (
                        <DropdownMenuItem
                          onClick={() => meta.onDelete(location.id)}
                          className="gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Ta bort
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
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
                Inga platser hittades.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
