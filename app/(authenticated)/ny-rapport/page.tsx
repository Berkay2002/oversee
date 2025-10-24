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
import { type DateRange } from 'react-day-picker';
import { Wrench, Car, ClipboardCheck, Loader2 } from 'lucide-react';

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
import { DateRangePickerCard } from '@/components/reports/date-range-picker-card';

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
      form.setValue('days_taken', days > 0 ? days : 1);
    } else {
      form.setValue('days_taken', 0);
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
      toast.success('Rapport skapad', {
        description: 'Den nya rapporten har skapats.',
        action: {
          label: 'Visa alla rapporter',
          onClick: () => router.push('/alla-rapporter'),
        },
      });

      // Reset form for next entry
      form.reset();
    } else {
      toast.error('Fel vid skapande av rapport', {
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
    { value: CUSTOM_REPORTER_VALUE, label: 'Annan / Anpassad', metadata: {} },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Card className="overflow-hidden rounded-xl border-border/60 bg-linear-to-b from-card to-card/95 shadow-sm">
        <CardHeader className="bg-card/50 p-6 md:p-8">
          <CardTitle className="text-3xl font-bold">Skapa Rapport</CardTitle>
          <CardDescription className="max-w-prose text-muted-foreground">
            Logga ett problem och allt arbete som utförts.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-2">
                {/* Left Column */}
                <div className="flex flex-col gap-10">
                  {/* Work Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Wrench className="h-6 w-6 text-muted-foreground" />
                      <h3 className="text-xl font-semibold">Arbetsinformation</h3>
                    </div>
                    <Separator />

                    <FormField
                      control={form.control}
                      name="technician_id"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>
                            Tilldelad tekniker <span className="text-destructive">*</span>
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
                              placeholder="Välj tekniker..."
                              searchPlaceholder="Sök tekniker..."
                              emptyText="Ingen tekniker hittades."
                            />
                          </FormControl>
                          <FormDescription>
                            Personen som arbetade med denna reparation.
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
                          <FormLabel>Rapportör (Valfritt)</FormLabel>
                          <FormControl>
                            <Combobox
                              options={reporterOptions}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Välj rapportör..."
                              searchPlaceholder="Sök rapportörer..."
                              emptyText="Ingen rapportör hittades."
                            />
                          </FormControl>
                          <FormDescription>
                            Vem som rapporterade eller inspekterade detta problem.
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
                              Anpassat rapportörnamn <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ange rapportörnamn..."
                                {...field}
                                className={cn(fieldState.invalid && 'border-destructive')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <div className="space-y-2 pt-2">
                      <FormLabel>
                        Arbetsperiod <span className="text-destructive">*</span>
                      </FormLabel>
                      <DateRangePickerCard
                        dateRange={{ from: form.watch('start_date'), to: form.watch('end_date') }}
                        onDateRangeChange={(range: DateRange | undefined) => {
                          form.setValue('start_date', range?.from ?? undefined);
                          form.setValue('end_date', range?.to ?? undefined);
                        }}
                      />
                      <FormDescription className="px-1">
                        När arbetet påbörjades och när det slutfördes.
                      </FormDescription>
                      {form.formState.errors.start_date && (
                        <p className="px-1 text-sm font-medium text-destructive">
                          {form.formState.errors.start_date.message}
                        </p>
                      )}
                      {form.formState.errors.end_date && (
                        <p className="px-1 text-sm font-medium text-destructive">
                          {form.formState.errors.end_date.message}
                        </p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-10">
                  {/* Vehicle Details Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Car className="h-6 w-6 text-muted-foreground" />
                        <h3 className="text-xl font-semibold">Fordonsinformation</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">Kan inkludera flera fordon.</p>
                    </div>
                    <Separator />

                    <FormField
                      control={form.control}
                      name="registration_numbers"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>
                            Registreringsnummer <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <RegistrationInput
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Skriv en registreringsskylt och tryck på Enter (t.ex. ABC123)"
                              className={cn(fieldState.invalid && 'border-destructive focus-within:ring-destructive')}
                            />
                          </FormControl>
                          <FormDescription>
                            Lägg till ett eller flera fordon som är involverade i denna rapport.
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
                            Problemkategori <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Combobox
                              options={categoryOptions}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Välj kategori..."
                              searchPlaceholder="Sök kategorier..."
                              emptyText="Ingen kategori hittades."
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
                            Används för spårning och analys.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* Issue & Fix Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <ClipboardCheck className="h-6 w-6 text-muted-foreground" />
                      <h3 className="text-xl font-semibold">Problem & Lösning</h3>
                    </div>
                    <Separator />

                    <FormField
                      control={form.control}
                      name="problem_description"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>
                            Problembeskrivning <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Beskriv vad som gick fel..."
                              className={cn('min-h-[140px] resize-none', fieldState.invalid && 'border-destructive')}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Beskriv vad som gick fel, symptom och vad som behöver åtgärdas.
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
                          <FormLabel>Utförd arbete (Valfritt)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Beskriv det utförda arbetet..."
                              className="min-h-[140px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Beskriv det utförda arbetet, utbytta delar eller gjorda justeringar.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.formState.isValid}
                  size="lg"
                  className="h-12 min-w-56 text-base"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Skapar rapport...
                    </>
                  ) : (
                    'Skapa rapport'
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  eller{' '}
                  <Button
                    variant="link"
                    type="button"
                    className="h-auto p-0"
                    onClick={() => router.push('/alla-rapporter')}
                  >
                    Visa alla rapporter
                  </Button>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
