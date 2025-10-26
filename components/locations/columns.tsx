'use client';

import { ColumnDef } from '@tanstack/react-table';
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
import { MoreHorizontal, Star, Pencil, Trash2 } from 'lucide-react';
import type { Location } from '@/lib/actions/location';

export type LocationsColumnMeta = {
  onSetDefault: (locationId: string) => void;
  onEdit: (location: Location) => void;
  onDelete: (locationId: string) => void;
};

export const createColumns = (meta: LocationsColumnMeta): ColumnDef<Location>[] => [
  {
    accessorKey: 'name',
    header: 'Platsnamn',
    cell: ({ row }) => {
      const isDefault = row.original.is_default;
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name}</span>
          {isDefault && (
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3 fill-current" />
              Standard
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Skapad',
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return date.toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const location = row.original;
      const isDefault = location.is_default;

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Öppna meny</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Åtgärder</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {!isDefault && (
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
              {!isDefault && (
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
        </div>
      );
    },
  },
];
