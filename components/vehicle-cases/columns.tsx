'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Check, MoreHorizontal } from 'lucide-react';
import type { VehicleCaseView } from '@/lib/actions/vehicle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type VehicleCaseColumnMeta = {
  orgId: string;
  locations: Array<{ id: string; name: string; is_default: boolean | null }>;
  members: Array<{ user_id: string; name: string }>;
  onUpdate: (
    caseId: string,
    field: string,
    value: string | boolean | null,
    oldValue: string | boolean | null
  ) => Promise<void>;
  onMarkKlar: (caseId: string) => void;
  onViewDetails: (caseId: string) => void;
  onRestore: (caseId: string) => void;
  onDelete: (caseId: string) => void;
  isArchive: boolean;
  isOrgAdmin: boolean;
};

// Badge variants for status display
const getInsuranceStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
  const variants = {
    pending: { variant: 'secondary' as const, label: 'Väntar försäkring' },
    approved: { variant: 'default' as const, label: 'Godkänd' },
    rejected: { variant: 'destructive' as const, label: 'Avslagen' },
  };
  return variants[status];
};

const getFundingSourceBadge = (source: 'insurance' | 'internal' | 'customer') => {
  const variants = {
    insurance: { variant: 'default' as const, label: 'Försäkring' },
    internal: { variant: 'secondary' as const, label: 'Intern' },
    customer: { variant: 'outline' as const, label: 'Kund' },
  };
  return variants[source];
};

export const createColumns = (
  meta: VehicleCaseColumnMeta
): ColumnDef<VehicleCaseView>[] => {
  const columns: ColumnDef<VehicleCaseView>[] = [
    {
      accessorKey: 'registration_number',
      header: 'Reg.nr',
      cell: ({ row }) => {
        const regNumber = row.getValue('registration_number') as string;
        return (
          <div className="font-mono font-semibold uppercase">{regNumber}</div>
        );
      },
    },
    {
      accessorKey: 'handler_user_name',
      header: 'Handläggare',
      cell: ({ row }) => {
        const userName = row.original.handler_user_name;
        const note = row.original.handler_note;

        const displayValue = userName || note || 'Inte tilldelad';

        // Handler is always read-only (set at creation and cannot be changed)
        return <div className="text-sm">{displayValue}</div>;
      },
    },
    {
      accessorKey: 'dropoff_location_name',
      header: 'Plats',
      cell: ({ row }) => {
        const locationId = row.original.dropoff_location_id;
        const locationName = row.getValue('dropoff_location_name') as string;

        if (meta.isArchive) {
          return <div className="text-sm">{locationName || '-'}</div>;
        }

        return (
          <Select
            value={locationId}
            onValueChange={(value) =>
              meta.onUpdate(
                row.original.id,
                'dropoff_location_id',
                value,
                locationId
              )
            }
          >
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {meta.locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: 'funding_source',
      header: 'Kostnadstyp',
      cell: ({ row }) => {
        const source = row.getValue('funding_source') as
          | 'insurance'
          | 'internal'
          | 'customer';
        const badge = getFundingSourceBadge(source);

        if (meta.isArchive) {
          return <Badge variant={badge.variant}>{badge.label}</Badge>;
        }

        return (
          <Select
            value={source}
            onValueChange={(value) =>
              meta.onUpdate(row.original.id, 'funding_source', value, source)
            }
          >
            <SelectTrigger className="h-8 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="insurance">Försäkring</SelectItem>
              <SelectItem value="internal">Intern</SelectItem>
              <SelectItem value="customer">Kund</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: 'photo_inspection_done',
      header: 'Foto besiktning',
      cell: ({ row }) => {
        const done = row.getValue('photo_inspection_done') as boolean;

        if (meta.isArchive) {
          return done ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        }

        return (
          <Checkbox
            checked={done}
            onCheckedChange={(checked) =>
              meta.onUpdate(
                row.original.id,
                'photo_inspection_done',
                checked,
                done
              )
            }
          />
        );
      },
    },
    {
      accessorKey: 'raknad_pa',
      header: 'Räknad på',
      cell: ({ row }) => {
        const raknadPa = row.getValue('raknad_pa') as boolean;

        if (meta.isArchive) {
          return raknadPa ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        }

        return (
          <Checkbox
            checked={raknadPa}
            onCheckedChange={(checked) =>
              meta.onUpdate(
                row.original.id,
                'raknad_pa',
                checked,
                raknadPa
              )
            }
          />
        );
      },
    },
    {
      accessorKey: 'insurance_status',
      header: 'Försäkring',
      cell: ({ row }) => {
        const status = row.getValue('insurance_status') as
          | 'pending'
          | 'approved'
          | 'rejected';
        const badge = getInsuranceStatusBadge(status);

        if (meta.isArchive) {
          return <Badge variant={badge.variant}>{badge.label}</Badge>;
        }

        return (
          <Select
            value={status}
            onValueChange={async (value) => {
              // Update insurance status
              await meta.onUpdate(row.original.id, 'insurance_status', value, status);

              // Auto-check "räknad på" when insurance is approved
              if (value === 'approved' && !row.original.raknad_pa) {
                await meta.onUpdate(row.original.id, 'raknad_pa', true, false);
              }
            }}
          >
            <SelectTrigger className="h-8 w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Väntar försäkring</SelectItem>
              <SelectItem value="approved">Godkänd</SelectItem>
              <SelectItem value="rejected">Avslagen</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: 'handler_note',
      header: 'Anteckningar',
      cell: ({ row }) => {
        const note = row.original.handler_note;

        if (meta.isArchive) {
          return (
            <div className="max-w-[200px] truncate text-sm text-muted-foreground" title={note || undefined}>
              {note || '-'}
            </div>
          );
        }

        return (
          <input
            type="text"
            className="h-8 w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Lägg till anteckning..."
            defaultValue={note || ''}
            onBlur={(e) => {
              const newValue = e.target.value.trim() || null;
              if (newValue !== note) {
                meta.onUpdate(row.original.id, 'handler_note', newValue, note);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
          />
        );
      },
    },
  ];

  // Add "Klar" column only for ongoing (non-archive) view
  if (!meta.isArchive) {
    columns.push({
      id: 'actions',
      header: 'Klar',
      cell: ({ row }) => {
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => meta.onMarkKlar(row.original.id)}
          >
            Markera klar
          </Button>
        );
      },
    });
  }

  // Add "Tid till klar" column only for archive view
  if (meta.isArchive) {
    columns.push({
      accessorKey: 'days_to_klar',
      header: 'Tid till klar',
      cell: ({ row }) => {
        const days = row.getValue('days_to_klar') as number | null;
        if (days === null) return '-';
        return (
          <div className="text-sm">
            {days.toFixed(1)} {days === 1 ? 'dag' : 'dagar'}
          </div>
        );
      },
    });
  }

  // Add "Visa detaljer" button for both active and archived views
  columns.push({
    id: 'view',
    header: '',
    cell: ({ row }) => {
      return (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => meta.onViewDetails(row.original.id)}
        >
          Visa detaljer
        </Button>
      );
    },
  });

  // Add actions dropdown for everyone (admins get delete, everyone gets restore)
  if (meta.isOrgAdmin || meta.isArchive) {
    columns.push({
      id: 'actions-menu',
      header: '',
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {meta.isArchive && (
                <DropdownMenuItem
                  onClick={() => meta.onRestore(row.original.id)}
                >
                  Återställ till pågående
                </DropdownMenuItem>
              )}
              {meta.isOrgAdmin && (
                <DropdownMenuItem
                  onClick={() => meta.onDelete(row.original.id)}
                  className="text-red-500"
                >
                  Ta bort
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });
  }

  return columns;
};
