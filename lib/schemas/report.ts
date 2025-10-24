import { z } from 'zod';

export const reportSchema = z.object({
  technician_name: z.string().min(1, { message: 'Technician name is required' }),
  registration_numbers: z.array(z.string()).min(1, { message: 'At least one registration number is required' }),
  days_taken: z.number().min(0, { message: 'Days taken must be a positive number' }),
  problem_description: z.string().min(1, { message: 'Problem description is required' }),
  improvement_description: z.string().optional(),
  category_id: z.string().uuid().optional(),
  reporter_name: z.string().optional(),
});

export type ReportFormData = z.infer<typeof reportSchema>;
