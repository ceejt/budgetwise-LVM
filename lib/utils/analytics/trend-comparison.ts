import type { Transaction } from "@/lib/types"

export interface TrendComparison {
  currentPeriodTotal: number
  previousPeriodTotal: number
  percentageChange: number
  trend: "up" | "down" | "stable"
}

/**
 * Calculate trend comparison between current and previous period
 */
export function calculateTrendComparison(
  currentExpenses: Transaction[],
  previousExpenses: Transaction[]
): TrendComparison {
  const currentPeriodTotal = currentExpenses.reduce((sum, t) => sum + Number(t.amount), 0)
  const previousPeriodTotal = previousExpenses.reduce((sum, t) => sum + Number(t.amount), 0)

  let percentageChange = 0
  if (previousPeriodTotal > 0) {
    percentageChange = ((currentPeriodTotal - previousPeriodTotal) / previousPeriodTotal) * 100
  } else if (currentPeriodTotal > 0) {
    percentageChange = 100
  }

  let trend: "up" | "down" | "stable" = "stable"
  if (Math.abs(percentageChange) < 5) {
    trend = "stable"
  } else if (percentageChange > 0) {
    trend = "up"
  } else {
    trend = "down"
  }

  return {
    currentPeriodTotal,
    previousPeriodTotal,
    percentageChange,
    trend
  }
}
