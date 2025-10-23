"use client"

import { Button } from "@/components/ui/button"

interface CalendarSectionProps {
  userId: string
}

export function CalendarSection({ userId }: CalendarSectionProps) {
  const daysInMonth = 31
  const startDay = 0 // Sunday

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📅</span>
          <h2 className="text-2xl font-semibold" style={{ color: "#293F55" }}>
            Calendar
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full bg-transparent"
          style={{ borderColor: "#E0E0E0", color: "#293F55" }}
        >
          Add Task
        </Button>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2" style={{ color: "#293F55" }}>
          JULY
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm text-gray-500">
              {day}
            </div>
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
            <div
              key={day}
              className="aspect-square flex items-center justify-center text-sm rounded-lg hover:bg-gray-100 cursor-pointer"
              style={{ color: "#293F55" }}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
