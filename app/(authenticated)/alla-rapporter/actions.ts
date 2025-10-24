/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { createClient } from '@/lib/supabase/server';
import { updateTag, revalidateTag } from 'next/cache';

export async function getReports(filters: {
  search?: string;
  technician?: string;
  category?: string;
  page?: number;
}) {
  const supabase = await createClient();
  let query = supabase.from('reports').select('*, categories(*)');

  if (filters.search) {
    query = query.ilike('problem_description', `%${filters.search}%`);
  }
  if (filters.technician) {
    query = query.eq('technician_name', filters.technician);
  }
  if (filters.category) {
    query = query.eq('category_id', filters.category);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range(((filters.page || 1) - 1) * 10, (filters.page || 1) * 10 - 1);

  if (error) {
    throw new Error(error.message);
  }

  return data;
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
  return { message: 'Success: Report updated successfully.' };
}

export async function deleteReport(reportId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('reports').delete().eq('id', reportId);

  if (error) {
    return { message: `Database Error: ${error.message}` };
  }

  updateTag('reports');
  return { message: 'Success: Report deleted successfully.' };
}
