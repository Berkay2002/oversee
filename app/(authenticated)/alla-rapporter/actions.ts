/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { createClient } from '@/lib/supabase/server';
import { updateTag, revalidateTag } from 'next/cache';

export async function getReports(filters: {
  search?: string;
  technician?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}) {
  const supabase = await createClient();
  let query = supabase
    .from('reports')
    .select('*, categories(*)', { count: 'exact' });

  if (filters.search) {
    query = query.ilike('problem_description', `%${filters.search}%`);
  }
  if (filters.technician) {
    query = query.eq('technician_name', filters.technician);
  }
  if (filters.category) {
    query = query.eq('category_id', filters.category);
  }

  const pageSize = filters.pageSize || 10;
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(
      ((filters.page || 1) - 1) * pageSize,
      (filters.page || 1) * pageSize - 1
    );

  if (error) {
    console.error('Error fetching reports:', JSON.stringify(error, null, 2));
    throw new Error('Failed to fetch reports');
  }

  return { data, count: count ?? 0 };
}

export async function updateReport(reportId: string, formData: FormData) {
  const supabase = await createClient();
  const rawFormData = Object.fromEntries(formData.entries());

  const { error } = await supabase
    .from('reports')
    .update(rawFormData)
    .eq('id', reportId);

  if (error) {
    return { message: `Database Error: ${error.message}` };
  }

  updateTag('reports');
  updateTag('dashboard');
  return { message: 'Success: Report updated successfully.' };
}

export async function deleteReport(reportId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('reports').delete().eq('id', reportId);

  if (error) {
    return { message: `Database Error: ${error.message}` };
  }

  updateTag('reports');
  updateTag('dashboard');
  return { message: 'Success: Report deleted successfully.' };
}
