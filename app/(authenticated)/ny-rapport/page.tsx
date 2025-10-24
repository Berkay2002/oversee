/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { reportSchema, ReportFormData } from '@/lib/schemas/report';
import { createReport } from './actions';
import { getCategories, getTechnicians, getReporters, type Category, type Technician, type Reporter } from './data-actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { differenceInDays } from 'date-fns';
import { Wrench, Car, AlertCircle, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import { RegistrationInput } from '@/components/reports/registration-input';
import { DateRangePicker } from '@/components/reports/date-range-picker';

const CUSTOM_REPORTER_VALUE = '__custom__';

export default function NewReportPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showCustomReporter, setShowCustomReporter] = React.useState(false);

  // Data from Supabase
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [technicians, setTechnicians] = React.useState<Technician[]>([]);
  const [reporters, setReporters] = React.useState<Reporter[]>([]);
  const technicianInputRef = React.useRef<HTMLButtonElement>(null);

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    mode: 'onBlur',
    defaultValues: {
      technician_id: '',
      technician_name: '',
      registration_numbers: [],
      start_date: undefined,
      end_date: undefined,
      days_taken: 0,
      problem_description: '',
      improvement_description: '',
      category_id: '',
      reporter_id: undefined,
      reporter_name: '',
      custom_reporter_name: '',
    },
  });

  // Load data on mount
  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [categoriesResult, techniciansResult, reportersResult] = await Promise.all([
        getCategories(),
        getTechnicians(),
        getReporters(),
      ]);

      if (categoriesResult.data) setCategories(categoriesResult.data);
      if (techniciansResult.data) setTechnicians(techniciansResult.data);
      if (reportersResult.data) setReporters(reportersResult.data);

      setIsLoading(false);
    }

    loadData();
  }, []);

  // Auto-focus the first field when data is loaded
  React.useEffect(() => {
    if (!isLoading) {
      technicianInputRef.current?.focus();
    }
  }, [isLoading]);

  // Watch dates and calculate days_taken
  // eslint-disable-next-line react-hooks/incompatible-library
  const startDate = form.watch('start_date');
  const endDate = form.watch('end_date');

  React.useEffect(() => {
    if (startDate && endDate) {
      const days = differenceInDays(endDate, startDate) + 1;
      form.setValue('days_taken', days);
    }
  }, [startDate, endDate, form]);

  // Watch reporter selection for custom reporter
  const reporterId = form.watch('reporter_id');

  React.useEffect(() => {
    if (reporterId === CUSTOM_REPORTER_VALUE) {
      setShowCustomReporter(true);
    } else {
      setShowCustomReporter(false);
      form.setValue('custom_reporter_name', '');

      // Set reporter_name from selected reporter
      const selectedReporter = reporters.find(r => r.id === reporterId);
      if (selectedReporter) {
        form.setValue('reporter_name', selectedReporter.name);
      }
    }
  }, [reporterId, reporters, form]);

  async function onSubmit(data: ReportFormData) {
    setIsSubmitting(true);

    // Use custom reporter name if "Other" was selected
    if (data.reporter_id === CUSTOM_REPORTER_VALUE) {
      data.reporter_name = data.custom_reporter_name || '';
      data.reporter_id = undefined;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'registration_numbers' && Array.isArray(value)) {
        value.forEach(item => formData.append(key, item));
      } else if (key === 'start_date' || key === 'end_date') {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        }
      } else if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value));
      }
    });

    const result = await createReport(formData);

    setIsSubmitting(false);

    if (result.message.startsWith('Success')) {
      toast.success('Report Created', {
        description: 'The new report has been successfully created.',
        action: {
          label: 'View All Reports',
          onClick: () => router.push('/alla-rapporter'),
        },
      });

      // Reset form for next entry
      form.reset();
    } else {
      toast.error('Error Creating Report', {
        description: result.message,
      });
    }
  }

  // Prepare combobox options
  const categoryOptions: ComboboxOption[] = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
    metadata: { color: cat.color, description: cat.description },
  }));

  const technicianOptions: ComboboxOption[] = technicians.map(tech => ({
    value: tech.id,
    label: tech.name,
    metadata: { description: tech.description },
  }));

  const reporterOptions: ComboboxOption[] = [
    ...reporters.map(rep => ({
      value: rep.id,
      label: rep.name,
      metadata: { description: rep.description },
    })),
    { value: CUSTOM_REPORTER_VALUE, label: 'Other / Custom', metadata: {} },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">New Service Report</CardTitle>
          <CardDescription>
            Create a new service report to document an issue and any corrective work done.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Work Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Work Information</h3>
                </div>
                <Separator />

                <FormField
                  control={form.control}
                  name="technician_id"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>
                        Technician Assigned <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Combobox
                          ref={technicianInputRef}
                          options={technicianOptions}
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            const tech = technicians.find(t => t.id === value);
                            if (tech) {
                              form.setValue('technician_name', tech.name);
                            }
                          }}
                          placeholder="Select technician..."
                          searchPlaceholder="Search technicians..."
                          emptyText="No technician found."
                        />
                      </FormControl>
                      <FormDescription>
                        Select the technician who worked on this repair.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reporter_id"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Reported By (Optional)</FormLabel>
                      <FormControl>
                        <Combobox
                          options={reporterOptions}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select reporter..."
                          searchPlaceholder="Search reporters..."
                          emptyText="No reporter found."
                        />
                      </FormControl>
                      <FormDescription>
                        Who reported or inspected this issue?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showCustomReporter && (
                  <FormField
                    control={form.control}
                  name="custom_reporter_name"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>
                          Custom Reporter Name <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter reporter name..."
                            {...field}
                            className={cn(fieldState.invalid && 'border-destructive')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="space-y-2">
                  <FormLabel>
                    Work Period <span className="text-destructive">*</span>
                  </FormLabel>
                  <DateRangePicker
                    startDate={form.watch('start_date')}
                    endDate={form.watch('end_date')}
                    onStartDateChange={(date) => form.setValue('start_date', date as Date)}
                    onEndDateChange={(date) => form.setValue('end_date', date as Date)}
                  />
                  {form.formState.errors.start_date && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.start_date.message}
                    </p>
                  )}
                  {form.formState.errors.end_date && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.end_date.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Vehicle Details Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Vehicle Details</h3>
                </div>
                <Separator />

                <FormField
                  control={form.control}
                  name="registration_numbers"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>
                        Registration Numbers <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <RegistrationInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Type registration and press Enter (e.g., ABC123)"
                          className={cn(fieldState.invalid && 'border-destructive focus-within:ring-destructive')}
                        />
                      </FormControl>
                      <FormDescription>
                        Add vehicle registration numbers. Press Enter after each one, or paste multiple separated by commas.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>
                        Problem Category <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Combobox
                          options={categoryOptions}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select category..."
                          searchPlaceholder="Search categories..."
                          emptyText="No category found."
                          renderOption={(option) => {
                            const colorValue = option.metadata?.color;
                            const color = typeof colorValue === 'string' ? colorValue : null;
                            return (
                              <div className="flex items-center gap-2">
                                {color && (
                                  <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                )}
                                <span>{option.label}</span>
                              </div>
                            );
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Categorize the type of issue for tracking and analytics.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Problem & Resolution Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Problem & Resolution</h3>
                </div>
                <Separator />

                <FormField
                  control={form.control}
                  name="problem_description"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>
                        Problem Description <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What went wrong or needs attention?"
                          className={cn('min-h-24 resize-none', fieldState.invalid && 'border-destructive')}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe the issue in detail, including symptoms and any diagnostic findings.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="improvement_description"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Improvement Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What fixes or improvements were applied?"
                          className="min-h-24 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Document the corrective actions taken, parts replaced, or preventive measures implemented.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.formState.isValid}
                  size="lg"
                  className="min-w-48"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Report...
                    </>
                  ) : (
                    'Create Report'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
