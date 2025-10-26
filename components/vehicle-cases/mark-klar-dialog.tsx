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

  // Validation checks
  const validationErrors = React.useMemo(() => {
    if (!vehicleCase) return [];

    const errors: string[] = [];

    // Only validate insurance approval for non-internal funding
    if (
      vehicleCase.funding_source !== 'internal' &&
      vehicleCase.insurance_status !== 'approved'
    ) {
      errors.push('Försäkring är inte godkänd ännu');
    }

    return errors;
  }, [vehicleCase]);

  const canProceed = validationErrors.length === 0;

  const handleConfirm = async () => {
    if (!canProceed) return;

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

        {/* Show validation errors if any */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-2">
                Följande problem måste åtgärdas först:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Success message if all checks pass */}
        {canProceed && (
          <Alert>
            <AlertDescription>
              Alla kontroller är godkända. Fordonet kan markeras som klart.
            </AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Avbryt</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!canProceed || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {canProceed ? 'Markera klar' : 'Kan inte markera klar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
