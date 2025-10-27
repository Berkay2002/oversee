'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { VehicleCaseView } from '@/lib/actions/vehicle';

type MarkKlarDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleCase: VehicleCaseView | null;
  onConfirm: () => Promise<void>;
};

export function MarkKlarDialog({
  open,
  onOpenChange,
  vehicleCase,
  onConfirm,
}: MarkKlarDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const showInsuranceReminder = React.useMemo(() => {
    if (!vehicleCase) return false;

    return (
      vehicleCase.funding_source !== 'internal' &&
      vehicleCase.insurance_status !== 'approved'
    );
  }, [vehicleCase]);

  const handleConfirm = async () => {
    if (!vehicleCase) return;

    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      console.error('Error marking case as klar:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen);
    }
  };

  if (!vehicleCase) return null;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Markera fordon som klart</AlertDialogTitle>
          <AlertDialogDescription>
            Du är på väg att markera fordon{' '}
            <span className="font-semibold">
              {vehicleCase.registration_number}
            </span>{' '}
            som klart och arkivera det.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Inform about pending insurance but allow proceeding */}
        {showInsuranceReminder ? (
          <Alert>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription>
              Försäkringen är inte godkänd ännu. Du kan ändå markera ärendet som
              klart.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertDescription>
              Fordonet markeras som klart och flyttas till arkivet.
            </AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Avbryt</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Markera klar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
