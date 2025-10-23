"use client"

import { Button } from "@/components/ui/button"
import type { Transaction } from "@/lib/types"
import { useRouter } from "next/navigation"

interface TipsSectionProps {
  expenses: Transaction[]
}

export function TipsSection({ expenses }: TipsSectionProps) {
  const router = useRouter()

  const tips = [
    "Look for part-time jobs or side gigs to earn extra income.",
    "Save a small portion of any money you receive, even if it's just ₱10.",
  ]

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  if (totalExpenses > 1000) {
    tips.push("Your expenses are high this week. Try to cut back on non-essentials.")
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#72ADFD" }}>
          <span className="text-white">💡</span>
        </div>
        <h2 className="text-2xl font-semibold" style={{ color: "#293F55" }}>
          Tips
        </h2>
      </div>
      <div className="space-y-3">
        {tips.map((tip, index) => (
          <div key={index} className="flex gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#72ADFD" }}
            >
              <span className="text-white text-xs">{index + 1}</span>
            </div>
            <p className="text-sm" style={{ color: "#293F55" }}>
              {tip}
            </p>
          </div>
        ))}
      </div>
      <Button
        variant="link"
        className="mt-4 p-0 h-auto"
        style={{ color: "#72ADFD" }}
        onClick={() => alert("More tips coming soon!")}
      >
        See more →
      </Button>
    </div>
  )
}
