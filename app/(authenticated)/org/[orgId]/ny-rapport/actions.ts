'use server';

import { createClient } from '@/lib/supabase/server';
import { reportSchema } from '@/lib/schemas/report';
import { updateTag } from 'next/cache';
import { differenceInDays } from 'date-fns';

export async function createReport(orgId: string, formData: FormData) {
  const supabase = await createClient();

  const rawFormData = Object.fromEntries(formData.entries());

  // Prepare data for validation, converting types as needed
  const dataToValidate = {
    ...rawFormData,
    registration_numbers: formData.getAll('registration_numbers'),
    start_date: formData.get('start_date')
      ? new Date(formData.get('start_date') as string)
      : undefined,
    end_date: formData.get('end_date')
      ? new Date(formData.get('end_date') as string)
      : undefined,
    days_taken: 0, // Will be recalculated
    reporter_name: rawFormData.reporter_name || undefined,
  };

  // Server-side calculation of days_taken
  if (dataToValidate.start_date && dataToValidate.end_date) {
    const start = dataToValidate.start_date;
    const end = dataToValidate.end_date;
    if (end >= start) {
      dataToValidate.days_taken = differenceInDays(end, start) + 1;
    }
  }

  const validatedFields = reportSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    console.error('Validation Errors:', validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Fel: Ogiltig formulärdata.',
    };
  }

  // Remove form-only fields before database insertion
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { custom_reporter_name, start_date, end_date, reporter_id, technician_id, ...dbData } = validatedFields.data;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      message: 'Fel: Användaren är inte autentiserad.',
    };
  }

  const dataToInsert = {
    ...dbData,
    created_by_user_id: user.id,
    org_id: orgId,
  };

  const { data, error } = await supabase
    .from('reports')
    .insert([dataToInsert])
    .select();

  if (error) {
    console.error('Database Error:', error);
    return {
      message: `Databasfel: ${error.message}`,
    };
  }

  // Revalidate caches for relevant pages
  updateTag(`reports-${orgId}`);
  updateTag(`dashboard-${orgId}`);

  return {
    message: 'Success: Rapporten har skapats.',
    data,
  };
}
