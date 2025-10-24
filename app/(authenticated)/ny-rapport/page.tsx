'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { reportSchema, ReportFormData } from '@/lib/schemas/report';
import { createReport } from './actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NewReportPage() {
  const router = useRouter();

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      technician_name: '',
      registration_numbers: [],
      days_taken: 0,
      problem_description: '',
      improvement_description: '',
      category_id: undefined,
      reporter_name: '',
    },
  });

  async function onSubmit(data: ReportFormData) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => formData.append(key, item));
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    const result = await createReport(formData);

    if (result.message.startsWith('Success')) {
      toast.success('Report Created', {
        description: 'The new report has been successfully created.',
      });
      router.push('/alla-rapporter');
    } else {
      toast.error('Error', {
        description: result.message,
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">New Report</h3>
        <p className="text-sm text-muted-foreground">
          Fill out the form to create a new report.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="technician_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Technician Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="registration_numbers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration Numbers</FormLabel>
                <FormControl>
                  <Input placeholder="ABC 123, XYZ 456" {...field} onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))} />
                </FormControl>
                <FormDescription>
                  Enter registration numbers separated by commas.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="days_taken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Days Taken</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="problem_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Problem Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the problem in detail..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="improvement_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Improvement Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe any improvements made..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reporter_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reporter Name (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Create Report</Button>
        </form>
      </Form>
    </div>
  );
}
