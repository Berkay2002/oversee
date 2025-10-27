import { z } from 'zod';

export const reportSchema = z.object({
  technician_id: z.string().min(1, { message: 'Technician is required' }),
  technician_name: z.string().min(1, { message: 'Technician name is required' }),
  registration_numbers: z.array(z.string()).min(1, { message: 'At least one registration number is required' }),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  days_taken: z.number().min(0, { message: 'Days taken must be a positive number' }),
  problem_description: z.string().min(1, { message: 'Problem description is required' }),
  improvement_description: z.string().nullable(),
  category_id: z.string().min(1, { message: 'Category is required' }),
  reporter_id: z.string().optional(),
  reporter_name: z.string().nullable(),
  custom_reporter_name: z.string().optional(),
})
.refine((data) => !!data.start_date, {
  message: 'Start date is required',
  path: ['start_date'],
})
.refine((data) => !!data.end_date, {
  message: 'End date is required',
  path: ['end_date'],
})
.refine((data) => {
  if (data.start_date && data.end_date) {
    return data.end_date >= data.start_date;
  }
  return true;
}, {
  message: 'End date must be after or equal to start date',
  path: ['end_date'],
});

export type ReportFormData = z.infer<typeof reportSchema>;

// Database report type (excludes form-only fields that are stripped before insertion)
export type Report = Omit<ReportFormData, 'technician_id' | 'reporter_id' | 'custom_reporter_name' | 'start_date' | 'end_date' | 'category_id'> & {
  id: string;
  created_at: string;
  org_id: string;
  category_id: string | null;  // nullable in database
};
