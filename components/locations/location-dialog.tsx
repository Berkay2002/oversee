'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import type { Location } from '@/lib/actions/location';

type LocationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, isDefault: boolean) => Promise<void>;
  editingLocation?: Location | null;
  hasExistingDefault?: boolean;
};

export function LocationDialog({
  open,
  onOpenChange,
  onSubmit,
  editingLocation,
  hasExistingDefault = false,
}: LocationDialogProps) {
  const [name, setName] = React.useState('');
  const [isDefault, setIsDefault] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Set initial values when editing
  React.useEffect(() => {
    if (editingLocation) {
      setName(editingLocation.name);
      setIsDefault(editingLocation.is_default);
    } else {
      setName('');
      setIsDefault(false);
    }
  }, [editingLocation, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Platsnamn får inte vara tomt');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(trimmedName, isDefault);
      // Reset form on success
      setName('');
      setIsDefault(false);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setName('');
      setIsDefault(false);
      setError(null);
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Redigera plats' : 'Lägg till plats'}
            </DialogTitle>
            <DialogDescription>
              {editingLocation
                ? 'Uppdatera namnet på platsen.'
                : 'Skapa en ny plats för din organisation. Du kan sätta den som standardplats.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Platsnamn</Label>
              <Input
                id="name"
                placeholder="t.ex. Huvudverkstad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            {!editingLocation && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-default"
                    checked={isDefault}
                    onCheckedChange={(checked) => setIsDefault(checked === true)}
                    disabled={isLoading || hasExistingDefault}
                  />
                  <Label
                    htmlFor="is-default"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Sätt som standardplats
                  </Label>
                </div>
                {hasExistingDefault && (
                  <p className="text-xs text-muted-foreground pl-6">
                    En standardplats finns redan. Använd &quot;Sätt som standard&quot; från
                    menyn för att ändra.
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingLocation ? 'Spara' : 'Lägg till'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
