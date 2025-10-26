'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import type { VehicleCaseView } from '@/lib/actions/vehicle';

type VehicleCaseDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleCase: VehicleCaseView | null;
  audits: Array<{
    id: string;
    field: string;
    old_value: string | null;
    new_value: string | null;
    changed_at: string;
    profiles: { name: string } | null;
  }> | null;
  analytics: {
    insurance_approved_at: string | null;
    photo_done_at: string | null;
    klar_at: string | null;
  } | null;
  isLoading: boolean;
};

export function VehicleCaseDrawer({
  open,
  onOpenChange,
  vehicleCase,
  audits,
  analytics,
  isLoading,
}: VehicleCaseDrawerProps) {
  if (!vehicleCase) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP HH:mm', { locale: sv });
  };

  const formatFieldName = (field: string) => {
    const fieldNames: Record<string, string> = {
      dropoff_location_id: 'Plats',
      funding_source: 'Kostnadstyp',
      photo_inspection_done: 'Foto besiktning',
      insurance_status: 'Försäkring',
      handler_user_id: 'Handläggare',
      handler_note: 'Handläggare anteckning',
      klar: 'Klar',
    };
    return fieldNames[field] || field;
  };

  const formatValue = (field: string, value: string | null) => {
    if (value === null) return 'Inte angiven';
    if (field === 'photo_inspection_done') return value === 'true' ? 'Ja' : 'Nej';
    if (field === 'insurance_status') {
      const statuses: Record<string, string> = {
        pending: 'Väntar',
        approved: 'Godkänd',
        rejected: 'Avslagen',
      };
      return statuses[value] || value;
    }
    if (field === 'funding_source') {
      const sources: Record<string, string> = {
        insurance: 'Försäkring',
        internal: 'Intern',
        customer: 'Kund',
      };
      return sources[value] || value;
    }
    if (field === 'klar') return value === 'true' ? 'Ja' : 'Nej';
    return value;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="font-mono text-xl">{vehicleCase.registration_number}</span>
            {vehicleCase.klar && (
              <Badge variant="default" className="w-fit">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Klar
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription className="text-base">
            Detaljerad information och historik för detta fordon
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4 pb-6 sm:mt-6 sm:space-y-6">
          {/* Case Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Översikt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm sm:text-base">
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <span className="text-muted-foreground">Plats:</span>
                <span className="font-medium">
                  {vehicleCase.dropoff_location_name || '-'}
                </span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <span className="text-muted-foreground">Kostnadstyp:</span>
                <span className="font-medium capitalize">
                  {vehicleCase.funding_source === 'insurance'
                    ? 'Försäkring'
                    : vehicleCase.funding_source === 'internal'
                    ? 'Intern'
                    : 'Kund'}
                </span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <span className="text-muted-foreground">Försäkring:</span>
                <span className="font-medium">
                  {vehicleCase.insurance_status === 'approved'
                    ? 'Godkänd'
                    : vehicleCase.insurance_status === 'rejected'
                    ? 'Avslagen'
                    : 'Väntar'}
                </span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <span className="text-muted-foreground">Foto besiktning:</span>
                <span className="font-medium">
                  {vehicleCase.photo_inspection_done ? 'Klar' : 'Inte klar'}
                </span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <span className="text-muted-foreground">Handläggare:</span>
                <span className="font-medium">
                  {vehicleCase.handler_user_name ||
                    vehicleCase.handler_note ||
                    'Inte tilldelad'}
                </span>
              </div>
              <Separator className="my-3" />
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <span className="text-muted-foreground">Skapad:</span>
                <span className="break-words font-medium">
                  {formatDate(vehicleCase.created_at)}
                </span>
              </div>
              {vehicleCase.archived_at && (
                <>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <span className="text-muted-foreground">Arkiverad:</span>
                    <span className="break-words font-medium">
                      {formatDate(vehicleCase.archived_at)}
                    </span>
                  </div>
                  {vehicleCase.days_to_klar !== null && (
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                      <span className="text-muted-foreground">Tid till klar:</span>
                      <span className="font-medium">
                        {vehicleCase.days_to_klar.toFixed(1)}{' '}
                        {vehicleCase.days_to_klar === 1 ? 'dag' : 'dagar'}
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Milestones */}
          {analytics && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Milstolpar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <>
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      {analytics.insurance_approved_at ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">Försäkring godkänd</p>
                        {analytics.insurance_approved_at ? (
                          <p className="text-xs text-muted-foreground">
                            {formatDate(analytics.insurance_approved_at)}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Inte godkänd än
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {analytics.photo_done_at ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">Foto besiktning klar</p>
                        {analytics.photo_done_at ? (
                          <p className="text-xs text-muted-foreground">
                            {formatDate(analytics.photo_done_at)}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Inte klar än
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {analytics.klar_at || vehicleCase.archived_at ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">Markerad som klar</p>
                        {analytics.klar_at || vehicleCase.archived_at ? (
                          <p className="text-xs text-muted-foreground">
                            {formatDate(analytics.klar_at || vehicleCase.archived_at!)}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Inte klar än
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Audit Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Ändringshistorik</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : audits && audits.length > 0 ? (
                <div className="space-y-4">
                  {audits.map((audit, index) => (
                    <div key={audit.id}>
                      <div className="flex items-start gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              {formatFieldName(audit.field)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(audit.changed_at)}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            <span className="line-through">
                              {formatValue(audit.field, audit.old_value)}
                            </span>
                            {' → '}
                            <span className="font-medium text-foreground">
                              {formatValue(audit.field, audit.new_value)}
                            </span>
                          </p>
                          {audit.profiles && (
                            <p className="text-xs text-muted-foreground">
                              av {audit.profiles.name}
                            </p>
                          )}
                        </div>
                      </div>
                      {index < audits.length - 1 && (
                        <Separator className="my-3" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Ingen ändringshistorik tillgänglig
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
