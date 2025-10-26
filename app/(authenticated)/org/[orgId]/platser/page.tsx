'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { LocationsTable } from '@/components/locations/locations-table';
import { LocationDialog } from '@/components/locations/location-dialog';
import { createColumns, type LocationsColumnMeta } from '@/components/locations/columns';
import {
  getLocations,
  createLocation,
  updateLocation,
  setDefaultLocation,
  deleteLocation,
  type Location,
} from '@/lib/actions/location';
import { useOrg } from '@/lib/org/context';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
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

export default function PlatserPage() {
  const { activeOrg } = useOrg();
  const orgId = activeOrg.id;

  const [locations, setLocations] = React.useState<Location[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingLocation, setEditingLocation] = React.useState<Location | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [locationToDelete, setLocationToDelete] = React.useState<string | null>(null);

  // Fetch locations
  const fetchLocations = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getLocations(orgId);
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Kunde inte hämta platser');
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  React.useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Handlers
  const handleSubmit = async (name: string, isDefault: boolean) => {
    if (editingLocation) {
      // Update existing location
      const result = await updateLocation(orgId, editingLocation.id, name);
      if (result.error) {
        throw new Error(result.error);
      }
      toast.success('Plats uppdaterad');
    } else {
      // Create new location
      const result = await createLocation(orgId, name, isDefault);
      if (result.error) {
        throw new Error(result.error);
      }
      toast.success('Plats skapad');
    }
    await fetchLocations();
  };

  const handleSetDefault = React.useCallback(async (locationId: string) => {
    const result = await setDefaultLocation(orgId, locationId);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Standardplats uppdaterad');
    await fetchLocations();
  }, [orgId, fetchLocations]);

  const handleEdit = React.useCallback((location: Location) => {
    setEditingLocation(location);
    setDialogOpen(true);
  }, []);

  const handleDelete = React.useCallback((locationId: string) => {
    setLocationToDelete(locationId);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!locationToDelete) return;

    const result = await deleteLocation(orgId, locationToDelete);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Plats borttagen');
    setDeleteDialogOpen(false);
    setLocationToDelete(null);
    await fetchLocations();
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingLocation(null);
    }
  };

  // Column metadata with memoized callbacks
  const columnMeta: LocationsColumnMeta = React.useMemo(
    () => ({
      onSetDefault: handleSetDefault,
      onEdit: handleEdit,
      onDelete: handleDelete,
    }),
    [handleSetDefault, handleEdit, handleDelete]
  );

  const columns = React.useMemo(() => createColumns(columnMeta), [columnMeta]);

  if (isLoading && locations.length === 0) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-0">
        <div className="space-y-4">
          <div className="h-10 w-48 animate-pulse rounded bg-muted" />
          <div className="h-96 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-0">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Platser</h1>
            <p className="text-muted-foreground">
              Hantera platser för din organisation
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Lägg till plats
          </Button>
        </div>

        <LocationsTable columns={columns} data={locations} />
      </div>

      {/* Add/Edit Dialog */}
      <LocationDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        onSubmit={handleSubmit}
        editingLocation={editingLocation}
        hasExistingDefault={locations.some(loc => loc.is_default)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Är du säker?</AlertDialogTitle>
            <AlertDialogDescription>
              Detta kommer permanent ta bort platsen. Denna åtgärd kan inte ångras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLocationToDelete(null)}>
              Avbryt
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Ta bort
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
