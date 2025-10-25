import type { Transaction } from "@/lib/types"

export type Period = "daily" | "weekly" | "monthly"

export interface PeriodData {
  startDate: Date
  endDate: Date
  label: string
}

/**
 * Get the date range for a given period
 */
export function getPeriodRange(period: Period): PeriodData {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (period) {
    case "daily": {
      return {
        startDate: today,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        label: "Today"
      }
    }
    case "weekly": {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - 6)
      return {
        startDate: weekStart,
        endDate: today,
        label: "Last 7 Days"
      }
    }
    case "monthly": {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      return {
        startDate: monthStart,
        endDate: today,
        label: "This Month"
      }
    }
  }
}

/**
 * Get the previous period range for comparison
 */
export function getPreviousPeriodRange(period: Period): PeriodData {
  const currentRange = getPeriodRange(period)
  const daysDiff = Math.ceil(
    (currentRange.endDate.getTime() - currentRange.startDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  const prevEnd = new Date(currentRange.startDate.getTime() - 1)
  const prevStart = new Date(prevEnd.getTime() - daysDiff * 24 * 60 * 60 * 1000)

  return {
    startDate: prevStart,
    endDate: prevEnd,
    label: `Previous ${period === "daily" ? "Day" : period === "weekly" ? "Week" : "Month"}`
  }
}

/**
 * Filter transactions by date range
 */
export function filterTransactionsByPeriod(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] {
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date)
    return transactionDate >= startDate && transactionDate <= endDate
  })
}
