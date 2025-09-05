"use client"

import * as React from "react"
import { type DateRange } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"

interface RangeCalendarProps {
  selected?: DateRange
  onSelect?: (date: DateRange | undefined) => void
  className?: string
}

export function RangeCalendar({
  selected,
  onSelect,
  className
}: RangeCalendarProps) {
  return (
    <Calendar
      mode="range"
      defaultMonth={selected?.from}
      selected={selected}
      onSelect={onSelect}
      className={className || "rounded-md border shadow-sm"}
    />
  )
}