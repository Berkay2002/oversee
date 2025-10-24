"use client"

import * as React from "react"
import { type DateRange } from "react-day-picker"
import { enUS } from "react-day-picker/locale"

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
  return (
    <Card className={className}>
      <CardContent className="p-0">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={onDateRangeChange}
          defaultMonth={dateRange?.from}
          numberOfMonths={2}
          locale={enUS}
          className="bg-transparent p-3"
        />
      </CardContent>
    </Card>
  )
}
