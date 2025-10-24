import { z } from 'zod';

export const reportSchema = z.object({
  technician_id: z.string().min(1, { message: 'Technician is required' }),
  technician_name: z.string().min(1, { message: 'Technician name is required' }),
  registration_numbers: z.array(z.string()).min(1, { message: 'At least one registration number is required' }),
  start_date: z.date({ required_error: 'Start date is required' }),
  end_date: z.date({ required_error: 'End date is required' }),
  days_taken: z.number().min(0, { message: 'Days taken must be a positive number' }),
  problem_description: z.string().min(1, { message: 'Problem description is required' }),
  improvement_description: z.string().optional(),
  category_id: z.string().uuid({ message: 'Category is required' }),
  reporter_id: z.string().optional(),
  reporter_name: z.string().optional(),
  custom_reporter_name: z.string().optional(),
}).refine((data) => data.end_date >= data.start_date, {
  message: 'End date must be after or equal to start date',
  path: ['end_date'],
});

export type ReportFormData = z.infer<typeof reportSchema>;
