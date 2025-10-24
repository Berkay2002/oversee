'use client';

import * as React from 'react';
import { type DateRange } from 'react-day-picker';
import { enUS, sv, tr, ar } from 'react-day-picker/locale';
import { CalendarIcon } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';

import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const locales = {
  en: enUS,
  sv: sv,
  tr: tr,
  ar: ar,
} as const;

const localizedStrings = {
  en: {
    title: 'Work Duration',
    description: 'Select start and end dates for the work',
    startDate: 'Start Date',
    endDate: 'End Date',
    duration: 'Duration',
    days: 'days',
    selectDate: 'Select date range',
    language: 'Language',
  },
  sv: {
    title: 'Arbetsperiod',
    description: 'Välj start- och slutdatum för arbetet',
    startDate: 'Startdatum',
    endDate: 'Slutdatum',
    duration: 'Varaktighet',
    days: 'dagar',
    selectDate: 'Välj datumintervall',
    language: 'Språk',
  },
  tr: {
    title: 'Çalışma Süresi',
    description: 'İş için başlangıç ve bitiş tarihlerini seçin',
    startDate: 'Başlangıç Tarihi',
    endDate: 'Bitiş Tarihi',
    duration: 'Süre',
    days: 'gün',
    selectDate: 'Tarih aralığı seçin',
    language: 'Dil',
  },
  ar: {
    title: 'مدة العمل',
    description: 'حدد تواريخ البداية والنهاية للعمل',
    startDate: 'تاريخ البدء',
    endDate: 'تاريخ الانتهاء',
    duration: 'المدة',
    days: 'أيام',
    selectDate: 'حدد نطاق التاريخ',
    language: 'اللغة',
  },
} as const;

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  disabled?: boolean;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  disabled = false,
  className,
}: DateRangePickerProps) {
  const [locale, setLocale] = React.useState<keyof typeof localizedStrings>('en');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: startDate,
    to: endDate,
  });

  // Calculate duration in days
  const duration = React.useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    return differenceInDays(dateRange.to, dateRange.from) + 1; // +1 to include both start and end days
  }, [dateRange]);

  // Sync internal state with external props
  React.useEffect(() => {
    setDateRange({
      from: startDate,
      to: endDate,
    });
  }, [startDate, endDate]);

  const handleSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    onStartDateChange(range?.from);
    onEndDateChange(range?.to);
  };

  const strings = localizedStrings[locale];

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">{strings.title}</h4>
          <p className="text-sm text-muted-foreground">{strings.description}</p>
        </div>
        <Select
          value={locale}
          onValueChange={(value) => setLocale(value as keyof typeof localizedStrings)}
          disabled={disabled}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder={strings.language} />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="sv">Svenska</SelectItem>
            <SelectItem value="tr">Türkçe</SelectItem>
            <SelectItem value="ar">العربية</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal',
              !dateRange?.from && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'PPP', { locale: locales[locale] })} -{' '}
                  {format(dateRange.to, 'PPP', { locale: locales[locale] })}
                </>
              ) : (
                format(dateRange.from, 'PPP', { locale: locales[locale] })
              )
            ) : (
              <span>{strings.selectDate}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleSelect}
            defaultMonth={dateRange?.from}
            numberOfMonths={2}
            locale={locales[locale]}
            className="bg-transparent p-0"
            buttonVariant="outline"
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>

      {dateRange?.from && dateRange?.to && duration > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2">
          <span className="text-sm font-medium text-muted-foreground">
            {strings.duration}:
          </span>
          <Badge variant="default" className="font-mono">
            {duration} {strings.days}
          </Badge>
        </div>
      )}
    </div>
  );
}
