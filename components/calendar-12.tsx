"use client"

import * as React from "react"
import { type DateRange } from "react-day-picker"
import { sv } from "date-fns/locale"

import { useMobile } from "@/hooks/use-mobile"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"

interface Calendar12Props {
  dateRange: DateRange | undefined
  onDateRangeChange: (dateRange: DateRange | undefined) => void
  className?: string
}

export function Calendar12({
  dateRange,
  onDateRangeChange,
  className,
}: Calendar12Props) {
  const isMobile = useMobile()
  const cardRef = React.useRef<HTMLDivElement>(null)
  const [isNarrow, setIsNarrow] = React.useState(false)

  React.useEffect(() => {
    const cardElement = cardRef.current
    if (!cardElement) return

    const resizeObserver = new ResizeObserver(() => {
      setIsNarrow(cardElement.offsetWidth < 520)
    })

    resizeObserver.observe(cardElement)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const numberOfMonths = isMobile || isNarrow ? 1 : 2

  return (
    <Card className={className} ref={cardRef}>
      <CardContent className="p-0">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={onDateRangeChange}
          defaultMonth={dateRange?.from}
          numberOfMonths={numberOfMonths}
          locale={sv}
          className="w-full bg-transparent"
          buttonVariant="outline"
        />
      </CardContent>
    </Card>
  )
}
