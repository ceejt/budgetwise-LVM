import type { Transaction, Goal } from "@/lib/types"

export type Period = "daily" | "weekly" | "monthly"

export interface PeriodData {
  startDate: Date
  endDate: Date
  label: string
}

export interface SpendingInsights {
  topCategory: { name: string; amount: number } | null
  averageDailySpending: number
  largestExpense: { description: string; amount: number } | null
  mostFrequentCategory: { name: string; count: number } | null
  totalExpenses: number
  totalIncome: number
}

export interface TrendComparison {
  currentPeriodTotal: number
  previousPeriodTotal: number
  percentageChange: number
  trend: "up" | "down" | "stable"
}

export interface AvailableToSpend {
  amount: number
  dailyAmount: number
  daysRemaining: number
  breakdown: {
    totalIncome: number
    totalExpenses: number
    goalAllocations: number
    upcomingBills: number
  }
}

export interface DailySpendingData {
  date: string
  amount: number
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

/**
 * Calculate available amount to spend
 */
export function calculateAvailableToSpend(
  income: Transaction[],
  expenses: Transaction[],
  goals: Goal[],
  period: Period
): AvailableToSpend {
  const totalIncome = income.reduce((sum, t) => sum + Number(t.amount), 0)
  const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0)

  // Calculate goal allocations (money set aside for goals)
  const goalAllocations = goals
    .filter(g => g.status === "active" && !g.paused)
    .reduce((sum, g) => sum + Number(g.current_amount || 0), 0)

  // For now, upcoming bills is 0 (will be implemented in Phase 7)
  const upcomingBills = 0

  // Calculate available amount
  const available = totalIncome - totalExpenses - goalAllocations - upcomingBills

  // Calculate days remaining in period
  const periodRange = getPeriodRange(period)
  const now = new Date()
  const daysRemaining = Math.max(
    Math.ceil((periodRange.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    1
  )

  const dailyAmount = available / daysRemaining

  return {
    amount: available,
    dailyAmount,
    daysRemaining,
    breakdown: {
      totalIncome,
      totalExpenses,
      goalAllocations,
      upcomingBills
    }
  }
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
