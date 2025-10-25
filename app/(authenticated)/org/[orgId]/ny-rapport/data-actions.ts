'use server';

import { createClient } from '@/lib/supabase/server';

export interface Category {
  id: string;
  name: string;
  color: string | null;
  description: string | null;
}

export interface Technician {
  id: string;
  name: string;
  description: string | null;
}

export interface Reporter {
  id: string;
  name: string;
  description: string | null;
}

export async function getCategories(orgId: string): Promise<{ data: Category[] | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('categories')
      .select('id, name, color, description')
      .eq('org_id', orgId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching categories:', error);
    return { data: null, error: 'Misslyckades med att hamta kategorier' };
  }
}

export async function getTechnicians(orgId: string): Promise<{ data: Technician[] | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('technicians')
      .select('id, name, description')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching technicians:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching technicians:', error);
    return { data: null, error: 'Misslyckades med att hamta tekniker' };
  }
}

export async function getReporters(orgId: string): Promise<{ data: Reporter[] | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('reporters')
      .select('id, name, description')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching reporters:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching reporters:', error);
    return { data: null, error: 'Misslyckades med att hamta rapportörer' };
  }
}

export async function getOrgMembers(orgId: string): Promise<{ data: Reporter[] | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: members, error: membersError } = await supabase
      .from('organization_members')
      .select('user_id, role')
      .eq('org_id', orgId);

    if (membersError) {
      console.error('Error fetching org members:', membersError);
      return { data: null, error: membersError.message };
    }

    const userIds = members.map(member => member.user_id);

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, name')
      .in('user_id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return { data: null, error: profilesError.message };
    }

    const reporters: Reporter[] = members.map(member => {
      const profile = profiles.find(p => p.user_id === member.user_id);
      return {
        id: member.user_id,
        name: profile?.name ?? 'Okänt namn',
        description: member.role,
      };
    });

    return { data: reporters, error: null };
  } catch (error) {
    console.error('Unexpected error fetching org members:', error);
    return { data: null, error: 'Misslyckades med att hamta organisationsmedlemmar' };
  }
}
