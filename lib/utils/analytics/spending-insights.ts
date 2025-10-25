import type { Transaction } from "@/lib/types"

export interface SpendingInsights {
  topCategory: { name: string; amount: number } | null
  averageDailySpending: number
  largestExpense: { description: string; amount: number } | null
  mostFrequentCategory: { name: string; count: number } | null
  totalExpenses: number
  totalIncome: number
}

/**
 * Calculate spending insights for a period
 */
export function calculateSpendingInsights(
  expenses: Transaction[],
  income: Transaction[]
): SpendingInsights {
  const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0)
  const totalIncome = income.reduce((sum, t) => sum + Number(t.amount), 0)

  // Top category by spending
  const categoryTotals = expenses.reduce((acc, t) => {
    const cat = t.category_name || "Other"
    acc[cat] = (acc[cat] || 0) + Number(t.amount)
    return acc
  }, {} as Record<string, number>)

  const topCategory = Object.entries(categoryTotals).length > 0
    ? Object.entries(categoryTotals).reduce((max, [name, amount]) =>
        amount > max.amount ? { name, amount } : max
      , { name: "", amount: 0 })
    : null

  // Average daily spending
  const uniqueDates = new Set(expenses.map(t => t.date.split('T')[0]))
  const dayCount = Math.max(uniqueDates.size, 1)
  const averageDailySpending = totalExpenses / dayCount

  // Largest expense
  const largestExpense = expenses.length > 0
    ? expenses.reduce((max, t) =>
        Number(t.amount) > Number(max.amount) ? t : max
      )
    : null

  // Most frequent category
  const categoryCounts = expenses.reduce((acc, t) => {
    const cat = t.category_name || "Other"
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const mostFrequentCategory = Object.entries(categoryCounts).length > 0
    ? Object.entries(categoryCounts).reduce((max, [name, count]) =>
        count > max.count ? { name, count } : max
      , { name: "", count: 0 })
    : null

  return {
    topCategory: topCategory && topCategory.amount > 0 ? topCategory : null,
    averageDailySpending,
    largestExpense: largestExpense ? {
      description: largestExpense.description || "Unnamed",
      amount: Number(largestExpense.amount)
    } : null,
    mostFrequentCategory: mostFrequentCategory && mostFrequentCategory.count > 0
      ? mostFrequentCategory
      : null,
    totalExpenses,
    totalIncome
  }
}
