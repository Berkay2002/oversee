"use client"

import * as React from "react"
import { type DateRange } from "react-day-picker"
import { sv } from "date-fns/locale"

import { useMobile } from "@/hooks/use-mobile"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"

interface DateRangePickerCardProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
  className?: string;
}

export function DateRangePickerCard({
  dateRange,
  onDateRangeChange,
  className,
}: DateRangePickerCardProps) {
  const isMobile = useMobile()

  return (
    <Card className={className}>
      <CardContent className="flex justify-center p-0">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={onDateRangeChange}
          defaultMonth={dateRange?.from}
          numberOfMonths={isMobile ? 1 : 2}
          locale={sv}
          className="bg-transparent p-3"
        />
      </CardContent>
    </Card>
  )
}
