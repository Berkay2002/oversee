'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/types/database';

type OrgLocationRow = Database['public']['Tables']['org_locations']['Row'];
type OrgLocationInsert = Database['public']['Tables']['org_locations']['Insert'];
type OrgLocationUpdate = Database['public']['Tables']['org_locations']['Update'];

export type Location = OrgLocationRow;

/**
 * Get all locations for an organization
 */
export async function getLocations(orgId: string): Promise<Location[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('org_locations')
    .select('*')
    .eq('org_id', orgId)
    .order('is_default', { ascending: false })
    .order('name');

  if (error) {
    console.error('Error fetching locations:', JSON.stringify(error, null, 2));
    throw new Error('Failed to fetch locations');
  }

  return data as Location[];
}

/**
 * Create a new location
 * If isDefault is true, unset other default locations first
 */
export async function createLocation(
  orgId: string,
  name: string,
  isDefault: boolean = false
): Promise<{ data?: Location; error?: string }> {
  const supabase = await createClient();

  try {
    // If this should be the default, unset any existing defaults
    if (isDefault) {
      const { error: updateError } = await supabase
        .from('org_locations')
        .update({ is_default: false })
        .eq('org_id', orgId)
        .eq('is_default', true);

      if (updateError) {
        console.error('Error unsetting default locations:', updateError);
        return { error: 'Failed to update existing default location' };
      }
    }

    // Create the new location
    const insertData: OrgLocationInsert = {
      org_id: orgId,
      name: name.trim(),
      is_default: isDefault,
    };

    const { data, error } = await supabase
      .from('org_locations')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating location:', JSON.stringify(error, null, 2));

      // Handle unique constraint violation for default location
      if (error.code === '23505' && error.message?.includes('org_locations_unique_default')) {
        return { error: 'En standardplats finns redan. Ta bort standardinställningen från den befintliga platsen först.' };
      }

      return { error: 'Failed to create location' };
    }

    revalidatePath(`/org/${orgId}/platser`);
    revalidatePath(`/org/${orgId}/bilkollen`);

    return { data: data as Location };
  } catch (err) {
    console.error('Unexpected error creating location:', err);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Update a location
 */
export async function updateLocation(
  orgId: string,
  locationId: string,
  name: string
): Promise<{ error?: string }> {
  const supabase = await createClient();

  try {
    const updateData: OrgLocationUpdate = {
      name: name.trim(),
    };

    const { error } = await supabase
      .from('org_locations')
      .update(updateData)
      .eq('id', locationId)
      .eq('org_id', orgId);

    if (error) {
      console.error('Error updating location:', JSON.stringify(error, null, 2));
      return { error: 'Failed to update location' };
    }

    revalidatePath(`/org/${orgId}/platser`);
    revalidatePath(`/org/${orgId}/bilkollen`);

    return {};
  } catch (err) {
    console.error('Unexpected error updating location:', err);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Set a location as the default
 * Unsets all other default locations for this org
 */
export async function setDefaultLocation(
  orgId: string,
  locationId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();

  try {
    // First, unset all defaults for this org
    const { error: unsetError } = await supabase
      .from('org_locations')
      .update({ is_default: false })
      .eq('org_id', orgId)
      .eq('is_default', true);

    if (unsetError) {
      console.error('Error unsetting defaults:', unsetError);
      return { error: 'Failed to unset existing defaults' };
    }

    // Set the new default
    const { error: setError } = await supabase
      .from('org_locations')
      .update({ is_default: true })
      .eq('id', locationId)
      .eq('org_id', orgId);

    if (setError) {
      console.error('Error setting default:', setError);

      // Handle unique constraint violation (shouldn't happen but defensive)
      if (setError.code === '23505' && setError.message?.includes('org_locations_unique_default')) {
        return { error: 'Kunde inte sätta standardplats. En annan standardplats finns redan.' };
      }

      return { error: 'Failed to set default location' };
    }

    revalidatePath(`/org/${orgId}/platser`);
    revalidatePath(`/org/${orgId}/bilkollen`);

    return {};
  } catch (err) {
    console.error('Unexpected error setting default:', err);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Delete a location
 * Cannot delete if it's the default location
 */
export async function deleteLocation(
  orgId: string,
  locationId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();

  try {
    // Check if this is the default location
    const { data: location, error: fetchError } = await supabase
      .from('org_locations')
      .select('is_default')
      .eq('id', locationId)
      .eq('org_id', orgId)
      .single();

    if (fetchError) {
      console.error('Error fetching location:', fetchError);
      return { error: 'Failed to fetch location' };
    }

    if (location?.is_default) {
      return { error: 'Cannot delete the default location. Set another location as default first.' };
    }

    const { error } = await supabase
      .from('org_locations')
      .delete()
      .eq('id', locationId)
      .eq('org_id', orgId);

    if (error) {
      console.error('Error deleting location:', JSON.stringify(error, null, 2));
      return { error: 'Failed to delete location' };
    }

    revalidatePath(`/org/${orgId}/platser`);
    revalidatePath(`/org/${orgId}/bilkollen`);

    return {};
  } catch (err) {
    console.error('Unexpected error deleting location:', err);
    return { error: 'An unexpected error occurred' };
  }
}
