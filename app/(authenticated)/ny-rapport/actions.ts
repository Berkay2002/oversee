/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { createClient } from '@/lib/supabase/server';
import { reportSchema } from '@/lib/schemas/report';
import { updateTag } from 'next/cache';
import { z } from 'zod';

export async function createReport(formData: FormData) {
  const supabase = await createClient();

  const rawFormData = Object.fromEntries(formData.entries());

  const validatedFields = reportSchema.safeParse({
    ...rawFormData,
    registration_numbers: formData.getAll('registration_numbers'),
    days_taken: Number(formData.get('days_taken')),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error: Invalid form data.',
    };
  }

  const { data, error } = await supabase
    .from('reports')
    .insert([validatedFields.data])
    .select();

  if (error) {
    return {
      message: `Database Error: ${error.message}`,
    };
  }

  updateTag('reports');
  updateTag('dashboard');

  return {
    message: 'Success: Report created successfully.',
    data,
  };
}
