'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, MapPin, Wallet, Camera, FileText, User, Eye, Calendar } from 'lucide-react';
import type { VehicleCaseView } from '@/lib/actions/vehicle';

type VehicleCaseMobileCardProps = {
  vehicleCase: VehicleCaseView;
  locations: Array<{ id: string; name: string; is_default: boolean | null }>;
  members: Array<{ user_id: string; name: string }>;
  onUpdate: (
    caseId: string,
    field: string,
    value: string | boolean | null,
    oldValue: string | boolean | null
  ) => Promise<void>;
  onMarkKlar?: (caseId: string) => void;
  onViewDetails?: (caseId: string) => void;
  onDelete: (caseId: string) => void;
  isArchive: boolean;
  isOrgAdmin: boolean;
};

export function VehicleCaseMobileCard({
  vehicleCase,
  locations,
  members,
  onUpdate,
  onMarkKlar,
  onViewDetails,
  onDelete,
  isArchive,
  isOrgAdmin,
}: VehicleCaseMobileCardProps) {
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

  const insuranceBadge = getInsuranceStatusBadge(vehicleCase.insurance_status);
  const fundingBadge = getFundingSourceBadge(vehicleCase.funding_source);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-mono font-bold uppercase">
                {vehicleCase.registration_number}
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant={fundingBadge.variant}>{fundingBadge.label}</Badge>
                <Badge variant={insuranceBadge.variant}>{insuranceBadge.label}</Badge>
              </div>
            </div>
            {isArchive && vehicleCase.days_to_klar !== null && (
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {vehicleCase.days_to_klar.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {vehicleCase.days_to_klar === 1 ? 'dag' : 'dagar'}
                </p>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Plats</span>
            </div>
            {isArchive ? (
              <p className="pl-6 text-sm">{vehicleCase.dropoff_location_name || '-'}</p>
            ) : (
              <Select
                value={vehicleCase.dropoff_location_id}
                onValueChange={(value) =>
                  onUpdate(
                    vehicleCase.id,
                    'dropoff_location_id',
                    value,
                    vehicleCase.dropoff_location_id
                  )
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Funding Source (editable in ongoing) */}
          {!isArchive && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="h-4 w-4" />
                <span className="font-medium">Kostnadstyp</span>
              </div>
              <Select
                value={vehicleCase.funding_source}
                onValueChange={(value) =>
                  onUpdate(
                    vehicleCase.id,
                    'funding_source',
                    value,
                    vehicleCase.funding_source
                  )
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insurance">Försäkring</SelectItem>
                  <SelectItem value="internal">Intern</SelectItem>
                  <SelectItem value="customer">Kund</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Photo Inspection */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Camera className="h-4 w-4" />
              <span className="font-medium">Foto besiktning</span>
            </div>
            {isArchive ? (
              vehicleCase.photo_inspection_done ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <span className="text-sm text-muted-foreground">-</span>
              )
            ) : (
              <Checkbox
                checked={vehicleCase.photo_inspection_done}
                onCheckedChange={(checked) =>
                  onUpdate(
                    vehicleCase.id,
                    'photo_inspection_done',
                    checked === true,
                    vehicleCase.photo_inspection_done
                  )
                }
                className="h-5 w-5"
              />
            )}
          </div>

          {/* Insurance Status (editable in ongoing) */}
          {!isArchive && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Försäkringsstatus</span>
              </div>
              <Select
                value={vehicleCase.insurance_status}
                onValueChange={(value) =>
                  onUpdate(
                    vehicleCase.id,
                    'insurance_status',
                    value,
                    vehicleCase.insurance_status
                  )
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Väntar försäkring</SelectItem>
                  <SelectItem value="approved">Godkänd</SelectItem>
                  <SelectItem value="rejected">Avslagen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Inbokad */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Inbokad</span>
            </div>
            {isArchive ? (
              vehicleCase.inbokad ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <span className="text-sm text-muted-foreground">-</span>
              )
            ) : (
              <Checkbox
                checked={vehicleCase.inbokad}
                onCheckedChange={(checked) =>
                  onUpdate(
                    vehicleCase.id,
                    'inbokad',
                    checked === true,
                    vehicleCase.inbokad
                  )
                }
                className="h-5 w-5"
              />
            )}
          </div>

          {/* Handler */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="font-medium">Handläggare</span>
            </div>
            {isArchive ? (
              <p className="pl-6 text-sm">
                {vehicleCase.handler_user_name ||
                  vehicleCase.handler_note ||
                  'Inte tilldelad'}
              </p>
            ) : (
              <Select
                value={vehicleCase.handler_user_id || 'none'}
                onValueChange={(value) => {
                  if (value === 'none') {
                    onUpdate(
                      vehicleCase.id,
                      'handler_user_id',
                      null,
                      vehicleCase.handler_user_id
                    );
                  } else {
                    onUpdate(
                      vehicleCase.id,
                      'handler_user_id',
                      value,
                      vehicleCase.handler_user_id
                    );
                  }
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Välj handläggare" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Inte tilldelad</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Action Buttons */}
          {!isArchive && onMarkKlar && (
            <Button
              size="lg"
              variant="default"
              onClick={() => onMarkKlar(vehicleCase.id)}
              className="w-full"
            >
              Markera klar
            </Button>
          )}

          {onViewDetails && (
            <Button
              size="lg"
              variant="outline"
              onClick={() => onViewDetails(vehicleCase.id)}
              className="w-full gap-2"
            >
              <Eye className="h-4 w-4" />
              Visa detaljer
            </Button>
          )}

          {isOrgAdmin && (
            <Button
              size="lg"
              variant="destructive"
              onClick={() => onDelete(vehicleCase.id)}
              className="w-full"
            >
              Ta bort
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
