import type { Transaction } from "@/lib/types"

export interface DailySpendingData {
  date: string
  amount: number
}

/**
 * Get daily spending data for charting
 */
export function getDailySpendingData(
  expenses: Transaction[],
  startDate: Date,
  endDate: Date
): DailySpendingData[] {
  // Create a map of dates to amounts
  const dailyTotals = new Map<string, number>()

  // Fill in all dates in range with 0
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    dailyTotals.set(dateStr, 0)
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Add actual expense amounts
  expenses.forEach(expense => {
    const dateStr = expense.date.split('T')[0]
    const current = dailyTotals.get(dateStr) || 0
    dailyTotals.set(dateStr, current + Number(expense.amount))
  })

  // Convert to array and sort
  return Array.from(dailyTotals.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Get category spending comparison between periods
 */
export function getCategoryComparison(
  currentExpenses: Transaction[],
  previousExpenses: Transaction[]
): Array<{
  category: string
  currentAmount: number
  previousAmount: number
  change: number
}> {
  const currentByCategory = currentExpenses.reduce((acc, t) => {
    const cat = t.category_name || "Other"
    acc[cat] = (acc[cat] || 0) + Number(t.amount)
    return acc
  }, {} as Record<string, number>)

  const previousByCategory = previousExpenses.reduce((acc, t) => {
    const cat = t.category_name || "Other"
    acc[cat] = (acc[cat] || 0) + Number(t.amount)
    return acc
  }, {} as Record<string, number>)

  // Get all unique categories
  const allCategories = new Set([
    ...Object.keys(currentByCategory),
    ...Object.keys(previousByCategory)
  ])

  return Array.from(allCategories).map(category => {
    const currentAmount = currentByCategory[category] || 0
    const previousAmount = previousByCategory[category] || 0
    const change = previousAmount > 0
      ? ((currentAmount - previousAmount) / previousAmount) * 100
      : currentAmount > 0 ? 100 : 0

    return {
      category,
      currentAmount,
      previousAmount,
      change
    }
  }).sort((a, b) => b.currentAmount - a.currentAmount)
}
