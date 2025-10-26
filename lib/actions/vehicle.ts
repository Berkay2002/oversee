'use server';

import { createClient } from '@/lib/supabase/server';
import { updateTag } from 'next/cache';
import type { Database } from '@/types/database';

// Types from database
type VehicleCaseInsert = Database['public']['Tables']['vehicle_cases']['Insert'];
type VehicleCaseUpdate = Database['public']['Tables']['vehicle_cases']['Update'];
type OrgLocationRow = Database['public']['Tables']['org_locations']['Row'];
type VehicleCaseAuditInsert = Database['public']['Tables']['vehicle_case_audits']['Insert'];

// View type (denormalized)
export type VehicleCaseView = {
  id: string;
  org_id: string;
  registration_number: string;
  klar: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  days_to_klar: number | null;
  dropoff_location_id: string;
  dropoff_location_name: string | null;
  dropoff_location_is_default: boolean | null;
  photo_inspection_done: boolean;
  raknad_pa: boolean;
  insurance_status: 'pending' | 'approved' | 'rejected';
  funding_source: 'insurance' | 'internal' | 'customer';
  handler_user_id: string | null;
  handler_user_name: string | null;
  handler_note: string | null;
  created_by: string | null;
  updated_by: string | null;
  archived_by: string | null;
};

export type VehicleCaseFilters = {
  search?: string;
  funding_source?: 'insurance' | 'internal' | 'customer';
  insurance_status?: 'pending' | 'approved' | 'rejected';
  location?: string;
  handler_user_id?: string;
  page?: number;
  pageSize?: number;
};

export type OrgMember = {
  user_id: string;
  name: string;
  role: string;
};

/**
 * Fetch vehicle cases from the denormalized view
 * Filters by archived status (ongoing vs archive)
 */
export async function getVehicleCases(
  orgId: string,
  archived: boolean,
  filters: VehicleCaseFilters = {}
) {
  const supabase = await createClient();

  let query = supabase
    .from('vehicle_cases_view')
    .select('*', { count: 'exact' })
    .eq('org_id', orgId);

  // Filter by archived status
  if (archived) {
    query = query.not('archived_at', 'is', null);
  } else {
    query = query.is('archived_at', null);
  }

  // Apply search filter
  if (filters.search) {
    query = query.ilike('registration_number', `%${filters.search}%`);
  }

  // Apply funding source filter
  if (filters.funding_source) {
    query = query.eq('funding_source', filters.funding_source);
  }

  // Apply insurance status filter
  if (filters.insurance_status) {
    query = query.eq('insurance_status', filters.insurance_status);
  }

  // Apply location filter
  if (filters.location) {
    query = query.eq('dropoff_location_id', filters.location);
  }

  // Apply handler filter
  if (filters.handler_user_id) {
    query = query.eq('handler_user_id', filters.handler_user_id);
  }

  // Pagination
  const pageSize = filters.pageSize || 10;
  const page = filters.page || 1;
  const { data, error, count } = await query
    .order(archived ? 'archived_at' : 'created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    console.error('Error fetching vehicle cases:', JSON.stringify(error, null, 2));
    throw new Error('Failed to fetch vehicle cases');
  }

  return { data: (data || []) as VehicleCaseView[], count: count ?? 0 };
}

/**
 * Fetch org locations for dropdown
 */
export async function getOrgLocations(orgId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('org_locations')
    .select('id, name, is_default')
    .eq('org_id', orgId)
    .order('name');

  if (error) {
    console.error('Error fetching org locations:', JSON.stringify(error, null, 2));
    throw new Error('Failed to fetch org locations');
  }

  return data as OrgLocationRow[];
}

/**
 * Fetch org members for handler assignment
 */
export async function getOrgMembers(orgId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('organization_members')
    .select('user_id, role, profiles!inner(name)')
    .eq('org_id', orgId)
    .order('profiles(name)');

  if (error) {
    console.error('Error fetching org members:', JSON.stringify(error, null, 2));
    throw new Error('Failed to fetch org members');
  }

  // Transform the data - Supabase returns profiles as an object with inner join
  type MemberWithProfile = {
    user_id: string;
    role: string;
    profiles: { name: string } | { name: string }[] | null;
  };

  return (data || []).map((member: MemberWithProfile) => {
    const profiles = member.profiles;
    const profileName = Array.isArray(profiles) ? profiles[0]?.name : profiles?.name;

    return {
      user_id: member.user_id,
      name: profileName || 'Unknown',
      role: member.role,
    };
  }) as OrgMember[];
}

/**
 * Fetch audit trail for a vehicle case
 */
export async function getVehicleCaseAudits(caseId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vehicle_case_audits')
    .select('*, profiles!inner(name)')
    .eq('case_id', caseId)
    .order('changed_at', { ascending: true });

  if (error) {
    console.error('Error fetching vehicle case audits:', JSON.stringify(error, null, 2));
    throw new Error('Failed to fetch vehicle case audits');
  }

  return data;
}

/**
 * Fetch analytics/milestones from materialized view
 */
export async function getVehicleCaseAnalytics(caseId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vehicle_case_status_summary')
    .select('*')
    .eq('case_id', caseId)
    .single();

  if (error) {
    // May not exist yet if no audits
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching vehicle case analytics:', JSON.stringify(error, null, 2));
    throw new Error('Failed to fetch vehicle case analytics');
  }

  return data;
}

/**
 * Create a new vehicle case
 * Automatically fetches default location and sets defaults
 */
export async function createVehicleCase(orgId: string, registrationNumber: string) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Användaren är inte autentiserad' };
  }

  // Trim and uppercase registration number
  const cleanedRegNumber = registrationNumber.trim().toUpperCase();

  if (cleanedRegNumber.length === 0) {
    return { error: 'Registreringsnummer får inte vara tomt' };
  }

  // Fetch default location
  const { data: locations, error: locationError } = await supabase
    .from('org_locations')
    .select('id')
    .eq('org_id', orgId)
    .eq('is_default', true)
    .limit(1);

  if (locationError || !locations || locations.length === 0) {
    return { error: 'Ingen standardplats hittades för organisationen' };
  }

  const defaultLocationId = locations[0].id;

  // Insert new case with current user as handler
  const insertData: VehicleCaseInsert = {
    org_id: orgId,
    registration_number: cleanedRegNumber,
    dropoff_location_id: defaultLocationId,
    funding_source: 'insurance',
    insurance_status: 'pending',
    photo_inspection_done: false,
    klar: false,
    handler_user_id: user.id, // Auto-assign current user as handler
  };

  const { data, error } = await supabase
    .from('vehicle_cases')
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error('Error creating vehicle case:', JSON.stringify(error, null, 2));
    return { error: `Fel vid skapande av fordon: ${error.message}` };
  }

  // Revalidate cache
  updateTag(`vehicle-cases-${orgId}`);

  return { data };
}

/**
 * Update a vehicle case field
 * Also creates an audit log entry
 */
export async function updateVehicleCase(
  orgId: string,
  caseId: string,
  updates: Partial<VehicleCaseUpdate>,
  field: string,
  oldValue: string,
  newValue: string
) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Användaren är inte autentiserad' };
  }

  // Validate case belongs to org
  const { data: existingCase } = await supabase
    .from('vehicle_cases')
    .select('org_id, *')
    .eq('id', caseId)
    .single();

  if (!existingCase || existingCase.org_id !== orgId) {
    return { error: 'Fordonet hittades inte eller åtkomst nekad' };
  }

  // Auto-set raknad_pa to true when insurance_status changes to 'approved'
  if (
    updates.insurance_status === 'approved' &&
    existingCase.insurance_status !== 'approved'
  ) {
    updates.raknad_pa = true;
  }

  // Update the case
  const { data, error } = await supabase
    .from('vehicle_cases')
    .update(updates)
    .eq('id', caseId)
    .eq('org_id', orgId)
    .select()
    .single();

  if (error) {
    console.error('Error updating vehicle case:', JSON.stringify(error, null, 2));
    return { error: `Fel vid uppdatering: ${error.message}` };
  }

  // Create audit log entry
  const auditEntry: VehicleCaseAuditInsert = {
    case_id: caseId,
    changed_by: user.id,
    field,
    old_value: oldValue,
    new_value: newValue,
    snapshot: data as unknown as Database['public']['Tables']['vehicle_case_audits']['Insert']['snapshot'],
  };

  const { error: auditError } = await supabase
    .from('vehicle_case_audits')
    .insert([auditEntry]);

  if (auditError) {
    console.error('Error creating audit entry:', JSON.stringify(auditError, null, 2));
    // Don't fail the update if audit fails, just log it
  }

  // Revalidate cache
  updateTag(`vehicle-cases-${orgId}`);

  return { data };
}

/**
 * Mark a vehicle case as "klar" (complete)
 * Validates business rules before archiving
 */
export async function markVehicleCaseKlar(orgId: string, caseId: string) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Användaren är inte autentiserad' };
  }

  // Fetch the case to validate
  const { data: existingCase, error: fetchError } = await supabase
    .from('vehicle_cases')
    .select('*')
    .eq('id', caseId)
    .eq('org_id', orgId)
    .single();

  if (fetchError || !existingCase) {
    return { error: 'Fordonet hittades inte eller åtkomst nekad' };
  }

  // Validation rules
  const errors: string[] = [];

  // Only validate insurance approval for non-internal funding
  if (
    existingCase.funding_source !== 'internal' &&
    existingCase.insurance_status !== 'approved'
  ) {
    errors.push('Försäkring är inte godkänd ännu');
  }

  if (errors.length > 0) {
    return { error: errors.join(', '), validationErrors: errors };
  }

  // Mark as klar
  const { data, error } = await supabase
    .from('vehicle_cases')
    .update({
      klar: true,
      archived_at: new Date().toISOString(),
      archived_by: user.id,
    })
    .eq('id', caseId)
    .eq('org_id', orgId)
    .select()
    .single();

  if (error) {
    console.error('Error marking case as klar:', JSON.stringify(error, null, 2));
    return { error: `Fel vid arkivering: ${error.message}` };
  }

  // Create audit log for klar action
  const auditEntry: VehicleCaseAuditInsert = {
    case_id: caseId,
    changed_by: user.id,
    field: 'klar',
    old_value: 'false',
    new_value: 'true',
    snapshot: data as unknown as Database['public']['Tables']['vehicle_case_audits']['Insert']['snapshot'],
  };

  await supabase.from('vehicle_case_audits').insert([auditEntry]);

  // Revalidate cache
  updateTag(`vehicle-cases-${orgId}`);

  return { data };
}

/**
 * Create an audit log entry manually
 */
export async function createVehicleCaseAudit(
  caseId: string,
  field: string,
  oldValue: string,
  newValue: string,
  snapshot?: Database['public']['Tables']['vehicle_case_audits']['Insert']['snapshot']
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Användaren är inte autentiserad' };
  }

  const auditEntry: VehicleCaseAuditInsert = {
    case_id: caseId,
    changed_by: user.id,
    field,
    old_value: oldValue,
    new_value: newValue,
    snapshot,
  };

  const { error } = await supabase.from('vehicle_case_audits').insert([auditEntry]);

  if (error) {
    console.error('Error creating audit entry:', JSON.stringify(error, null, 2));
    return { error: `Fel vid skapande av logg: ${error.message}` };
  }

  return { success: true };
}

/**
 * Delete a vehicle case
 */
export async function deleteVehicleCase(orgId: string, caseId: string) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Användaren är inte autentiserad' };
  }

  // Validate case belongs to org
  const { data: existingCase } = await supabase
    .from('vehicle_cases')
    .select('org_id')
    .eq('id', caseId)
    .single();

  if (!existingCase || existingCase.org_id !== orgId) {
    return { error: 'Fordonet hittades inte eller åtkomst nekad' };
  }

  // Delete the case
  const { error } = await supabase
    .from('vehicle_cases')
    .delete()
    .eq('id', caseId)
    .eq('org_id', orgId);

  if (error) {
    console.error('Error deleting vehicle case:', JSON.stringify(error, null, 2));
    return { error: `Fel vid borttagning: ${error.message}` };
  }

  // Revalidate cache
  updateTag(`vehicle-cases-${orgId}`);

  return { success: true };
}

/**
 * Restore an archived vehicle case back to ongoing
 * Clears klar, archived_at, and archived_by fields
 */
export async function restoreVehicleCase(orgId: string, caseId: string) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Användaren är inte autentiserad' };
  }

  // Validate case belongs to org and is archived
  const { data: existingCase } = await supabase
    .from('vehicle_cases')
    .select('org_id, archived_at')
    .eq('id', caseId)
    .single();

  if (!existingCase || existingCase.org_id !== orgId) {
    return { error: 'Fordonet hittades inte eller åtkomst nekad' };
  }

  if (!existingCase.archived_at) {
    return { error: 'Fordonet är inte arkiverat' };
  }

  // Call the database function to restore
  const { error } = await supabase.rpc('restore_vehicle_case', {
    p_case_id: caseId,
    p_user_id: user.id,
  });

  if (error) {
    console.error('Error restoring vehicle case:', JSON.stringify(error, null, 2));
    return { error: `Fel vid återställning: ${error.message}` };
  }

  // Revalidate cache
  updateTag(`vehicle-cases-${orgId}`);

  return { success: true };
}

/**
 * Get statistics and analytics for vehicle cases
 * Can be filtered by handler or show org-wide stats
 */
export async function getVehicleCaseStatistics(
  orgId: string,
  handlerUserId?: string
) {
  const supabase = await createClient();

  // Base query for all cases in the org
  let query = supabase
    .from('vehicle_cases')
    .select('*')
    .eq('org_id', orgId);

  // Filter by handler if specified
  if (handlerUserId) {
    query = query.eq('handler_user_id', handlerUserId);
  }

  const { data: cases, error } = await query;

  if (error) {
    console.error('Error fetching vehicle case statistics:', JSON.stringify(error, null, 2));
    throw new Error('Failed to fetch statistics');
  }

  // Calculate statistics
  const totalCases = cases?.length || 0;
  const ongoingCases = cases?.filter((c) => !c.archived_at).length || 0;
  const archivedCases = cases?.filter((c) => c.archived_at).length || 0;

  // By funding source
  const byFundingSource = {
    insurance: cases?.filter((c) => c.funding_source === 'insurance').length || 0,
    internal: cases?.filter((c) => c.funding_source === 'internal').length || 0,
    customer: cases?.filter((c) => c.funding_source === 'customer').length || 0,
  };

  // By insurance status (for insurance cases only)
  const byInsuranceStatus = {
    pending: cases?.filter((c) => c.insurance_status === 'pending').length || 0,
    approved: cases?.filter((c) => c.insurance_status === 'approved').length || 0,
    rejected: cases?.filter((c) => c.insurance_status === 'rejected').length || 0,
  };

  // Per-handler breakdown (only if not filtered by handler already)
  let perHandlerStats: Array<{
    handler_user_id: string | null;
    handler_name: string | null;
    total: number;
    ongoing: number;
    completed: number;
  }> = [];

  if (!handlerUserId) {
    // Group by handler
    const handlerMap = new Map<string | null, typeof cases>();
    cases?.forEach((c) => {
      const key = c.handler_user_id || null;
      if (!handlerMap.has(key)) {
        handlerMap.set(key, []);
      }
      handlerMap.get(key)?.push(c);
    });

    // Fetch handler names
    const handlerIds = Array.from(handlerMap.keys()).filter((id) => id !== null) as string[];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, name')
      .in('user_id', handlerIds);

    const profileMap = new Map(profiles?.map((p) => [p.user_id, p.name]) || []);

    // Build stats
    perHandlerStats = Array.from(handlerMap.entries()).map(([handlerId, handlerCases]) => ({
      handler_user_id: handlerId,
      handler_name: handlerId ? profileMap.get(handlerId) || 'Unknown' : 'Ej tilldelad',
      total: handlerCases.length,
      ongoing: handlerCases.filter((c) => !c.archived_at).length,
      completed: handlerCases.filter((c) => c.archived_at && c.klar).length,
    }));
  }

  // Cases created per day (last 30 weekdays)
  const now = new Date();
  const casesPerDay: Array<{ date: string; count: number }> = [];
  let daysAdded = 0;
  for (let i = 0; daysAdded < 30; i++) {
    const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayOfWeek = dayStart.getDay();

    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayCases = cases?.filter((c) => {
        const createdAt = new Date(c.created_at);
        return createdAt >= dayStart && createdAt < dayEnd;
      }) || [];

      casesPerDay.push({
        date: `${dayStart.getFullYear()}-${String(dayStart.getMonth() + 1).padStart(2, '0')}-${String(dayStart.getDate()).padStart(2, '0')}`,
        count: dayCases.length,
      });
      daysAdded++;
    }
  }
  casesPerDay.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Cases created per week (last 12 weeks, weekdays only)
  const casesPerWeek: Array<{ week: string; count: number }> = [];
  const weekMap = new Map<string, number>();

  // Initialize last 12 weeks (starting on Mondays)
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const weekStart = new Date(date.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    const weekKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, 0);
    }
  }

  cases?.forEach((c) => {
    const createdAt = new Date(c.created_at);
    const dayOfWeek = createdAt.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
      const day = createdAt.getDay();
      const diff = createdAt.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      const weekStart = new Date(new Date(c.created_at).setDate(diff));
      weekStart.setHours(0, 0, 0, 0);
      const weekKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;

      if (weekMap.has(weekKey)) {
        weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + 1);
      }
    }
  });

  weekMap.forEach((count, week) => {
    casesPerWeek.push({ week, count });
  });

  casesPerWeek.sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime());

  // Cases created per month (last 12 months)
  const casesPerMonth: Array<{ month: string; count: number }> = [];
  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

    const monthCases = cases?.filter((c) => {
      const createdAt = new Date(c.created_at);
      return createdAt >= monthStart && createdAt <= monthEnd;
    }) || [];

    // Format as "YYYY-MM"
    const monthLabel = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;

    casesPerMonth.push({
      month: monthLabel,
      count: monthCases.length,
    });
  }

  // Average processing time (for completed cases)
  const completedCases = cases?.filter((c) => c.klar && c.archived_at) || [];
  let avgProcessingDays = 0;

  if (completedCases.length > 0) {
    const totalDays = completedCases.reduce((sum, c) => {
      const created = new Date(c.created_at);
      const archived = new Date(c.archived_at!);
      const days = Math.floor((archived.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    avgProcessingDays = Math.round(totalDays / completedCases.length);
  }

  return {
    totalCases,
    ongoingCases,
    archivedCases,
    byFundingSource,
    byInsuranceStatus,
    perHandlerStats,
    casesPerDay,
    casesPerWeek,
    casesPerMonth,
    avgProcessingDays,
  };
}

export type VehicleCaseStatistics = Awaited<ReturnType<typeof getVehicleCaseStatistics>>;
