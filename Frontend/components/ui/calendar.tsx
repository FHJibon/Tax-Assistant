"use client"

import * as React from "react"
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface SimpleCalendarProps {
  value?: Date | null
  onChange?: (date: Date | null) => void
  initialMonth?: Date
  disabled?: (date: Date) => boolean
  className?: string
}

export function Calendar({
  value,
  onChange,
  initialMonth,
  disabled,
  className,
}: SimpleCalendarProps) {
  const today = React.useMemo(() => new Date(), [])
  const initial = initialMonth ?? value ?? today
  const [month, setMonth] = React.useState<Date>(initial)
  const [view, setView] = React.useState<"year" | "month" | "day">("year")
  const [yearBase, setYearBase] = React.useState<number>(
    new Date(initial).getFullYear() - 5
  )

  // Build days grid for current month
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 })
  const end = endOfMonth(month)
  const weeks: Date[][] = []
  let cursor = start
  while (cursor <= end || weeks.length === 0) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(cursor)
      cursor = addDays(cursor, 1)
    }
    weeks.push(week)
  }

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
  const months = Array.from({ length: 12 }, (_, i) =>
    format(new Date(2000, i, 1), "MMM")
  )

  return (
    <div className={cn("select-none", className)}>
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => {
            if (view === "year") setYearBase((y) => y - 12)
            else if (view === "month") setMonth((m) => new Date(m.getFullYear() - 1, m.getMonth(), 1))
            else setMonth((m) => addMonths(m, -1))
          }}
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <button
          className="text-sm font-semibold hover:underline"
          onClick={() => setView((v) => (v === "day" ? "month" : v === "month" ? "year" : "year"))}
        >
          {view === "day" && format(month, "MMMM yyyy")}
          {view === "month" && format(month, "yyyy")}
          {view === "year" && `${yearBase} - ${yearBase + 11}`}
        </button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => {
            if (view === "year") setYearBase((y) => y + 12)
            else if (view === "month") setMonth((m) => new Date(m.getFullYear() + 1, m.getMonth(), 1))
            else setMonth((m) => addMonths(m, 1))
          }}
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Year view */}
      {view === "year" && (
        <div className="w-full h-full rounded-2xl border border-gray-700 bg-gray-900/40 shadow mb-2 backdrop-blur-xl grid grid-cols-3 gap-1 text-base items-stretch justify-center p-0" style={{minHeight:'11.4rem'}}>
          {Array.from({ length: 12 }, (_, i) => yearBase + i).map((y) => {
            const selected = (value ?? null)?.getFullYear?.() === y
            return (
              <button
                key={y}
                onClick={() => {
                  setMonth(new Date(y, month.getMonth(), 1))
                  setView("month")
                }}
                className={cn(
                  "w-full h-full rounded-md transition-colors flex items-center justify-center hover:bg-accent hover:text-accent-foreground",
                  selected && "bg-primary text-primary-foreground"
                )}
              >
                {y}
              </button>
            )
          })}
        </div>
      )}

      {/* Month view */}
      {view === "month" && (
        <div className="w-full h-full rounded-2xl border border-gray-700 bg-gray-900/40 shadow mb-2 backdrop-blur-xl grid grid-cols-3 gap-1 text-base items-stretch justify-center p-0" style={{minHeight:'11.4rem'}}>
          {months.map((mName, i) => {
            const selected = (value ?? null)?.getFullYear?.() === month.getFullYear() && (value ?? null)?.getMonth?.() === i
            return (
              <button
                key={mName}
                onClick={() => {
                  setMonth(new Date(month.getFullYear(), i, 1))
                  setView("day")
                }}
                className={cn(
                  "w-full h-full rounded-md transition-colors flex items-center justify-center hover:bg-accent hover:text-accent-foreground",
                  selected && "bg-primary text-primary-foreground"
                )}
              >
                {mName}
              </button>
            )
          })}
        </div>
      )}

      {/* Day view */}
      {view === "day" && (
        <div className="w-full h-full rounded-2xl border border-gray-700 bg-gray-900/40 shadow p-0 mb-2 backdrop-blur-xl flex flex-col justify-start" style={{minHeight:'11.4rem'}}>
          <div className="grid grid-cols-7 gap-0 text-center text-xs text-muted-foreground" style={{padding:'6px 6px 0 6px'}}>
            {weekDays.map((d) => (
              <div key={d} className="py-0 text-[11px]">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0 flex-1" style={{padding:'6px'}}>
            {weeks.map((week, wi) =>
              week.map((day) => {
                const outside = !isSameMonth(day, month)
                const selected = value ? isSameDay(value, day) : false
                const isDisabled = disabled ? disabled(day) : false
                return (
                  <button
                    key={`${wi}-${day.toISOString()}`}
                    disabled={isDisabled}
                    onClick={() => onChange?.(day)}
                    className={cn(
                      "w-full h-full rounded-md text-sm transition-colors flex items-center justify-center",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selected
                        ? "bg-primary text-primary-foreground"
                        : outside
                        ? "text-muted-foreground/50"
                        : "hover:bg-accent hover:text-accent-foreground",
                      isDisabled && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    {format(day, "d")}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
