'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { VehicleCaseMobileCard } from './vehicle-case-mobile-card';
import type { VehicleCaseView } from '@/lib/actions/vehicle';
import type { VehicleCaseColumnMeta } from './columns';

interface VehicleCasesTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function VehicleCasesTable<TData, TValue>({
  columns,
  data,
  pageCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: VehicleCasesTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const isMobile = useMobile();

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  // Extract meta from columns
  const firstColumn = columns[0];
  const meta = firstColumn?.meta as VehicleCaseColumnMeta | undefined;

  // Mobile card view
  if (isMobile && meta) {
    const vehicleCases = data as VehicleCaseView[];

    return (
      <div className="space-y-4">
        {/* Cards */}
        {vehicleCases.length > 0 ? (
          <div className="space-y-3">
            {vehicleCases.map((vehicleCase) => (
              <VehicleCaseMobileCard
                key={vehicleCase.id}
                vehicleCase={vehicleCase}
                locations={meta.locations}
                members={meta.members}
                onUpdate={meta.onUpdate}
                onMarkKlar={meta.isArchive ? undefined : meta.onMarkKlar}
                onViewDetails={meta.isArchive ? meta.onViewDetails : undefined}
                onDelete={meta.onDelete}
                isArchive={meta.isArchive}
                isOrgAdmin={meta.isOrgAdmin}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
            Inga fordon hittades.
          </div>
        )}

        {/* Mobile Pagination */}
        <div className="space-y-3 rounded-lg border bg-card p-4">
          {/* Page Info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Sida</span>
            <span className="font-medium">
              {currentPage} av {pageCount || 1}
            </span>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex-1"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Föregående
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= pageCount}
              className="flex-1"
            >
              Nästa
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border">
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Inga fordon hittades.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Desktop Pagination */}
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Rader per sida</p>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-9 w-[70px] rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <p className="text-sm text-muted-foreground">
            Sida {currentPage} av {pageCount || 1}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= pageCount}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
