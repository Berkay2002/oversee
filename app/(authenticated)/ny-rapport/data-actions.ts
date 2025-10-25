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

export async function getCategories(): Promise<{ data: Category[] | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('categories')
      .select('id, name, color, description')
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

export async function getTechnicians(): Promise<{ data: Technician[] | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('technicians')
      .select('id, name, description')
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

export async function getReporters(): Promise<{ data: Reporter[] | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('reporters')
      .select('id, name, description')
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
