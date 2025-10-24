/**
 * Budget Calculator Utility
 *
 * Provides functions for calculating budget vs actual spending,
 * generating insights, and determining budget health status.
 *
 * Features:
 * - Calculate spending by period (weekly, monthly, yearly)
 * - Determine budget utilization percentage
 * - Generate budget status (ok, warning, critical, exceeded)
 * - Create comparison text (vs previous period)
 * - Generate actionable suggestions
 */

import type { BudgetPeriod, BudgetStatus, Transaction, Category, BudgetInsight } from "@/lib/types"

/**
 * Calculate total spending for a specific category within a date range
 */
export function calculateSpendingInRange(
  transactions: Transaction[],
  categoryId: string,
  startDate: Date,
  endDate: Date
): number {
  return transactions
    .filter((t) => {
      if (t.type !== "expense" || t.category_id !== categoryId) return false
      const transactionDate = new Date(t.date)
      return transactionDate >= startDate && transactionDate <= endDate
    })
    .reduce((sum, t) => sum + Number(t.amount), 0)
}

/**
 * Get date range for a given budget period
 */
export function getDateRangeForPeriod(period: BudgetPeriod): { start: Date; end: Date } {
  const now = new Date()
  const end = new Date(now)
  let start = new Date(now)

  switch (period) {
    case "weekly":
      start.setDate(now.getDate() - 7)
      break
    case "monthly":
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case "yearly":
      start = new Date(now.getFullYear(), 0, 1)
      break
  }

  return { start, end }
}

/**
 * Get previous period date range for comparison
 */
export function getPreviousPeriodRange(period: BudgetPeriod): { start: Date; end: Date } {
  const now = new Date()
  let start = new Date()
  let end = new Date()

  switch (period) {
    case "weekly":
      start.setDate(now.getDate() - 14)
      end.setDate(now.getDate() - 7)
      break
    case "monthly":
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      end = new Date(now.getFullYear(), now.getMonth(), 0) // Last day of previous month
      break
    case "yearly":
      start = new Date(now.getFullYear() - 1, 0, 1)
      end = new Date(now.getFullYear() - 1, 11, 31)
      break
  }

  return { start, end }
}

/**
 * Calculate budget utilization percentage
 */
export function calculateUtilization(spent: number, budget: number): number {
  if (budget === 0) return 0
  return (spent / budget) * 100
}

/**
 * Determine budget status based on utilization percentage
 */
export function getBudgetStatus(utilization: number): BudgetStatus {
  if (utilization >= 100) return "exceeded"
  if (utilization >= 90) return "critical"
  if (utilization >= 70) return "warning"
  return "ok"
}

/**
 * Get color for budget status (for UI)
 */
export function getStatusColor(status: BudgetStatus): string {
  switch (status) {
    case "ok":
      return "#22c55e" // green
    case "warning":
      return "#f59e0b" // yellow
    case "critical":
      return "#f97316" // orange
    case "exceeded":
      return "#ef4444" // red
  }
}

/**
 * Get progress bar color based on utilization percentage
 */
export function getProgressColor(utilization: number): string {
  if (utilization >= 100) return "#ef4444" // red - exceeded
  if (utilization >= 90) return "#f97316" // orange - critical
  if (utilization >= 70) return "#f59e0b" // yellow - warning
  return "#22c55e" // green - ok
}

/**
 * Format currency with Philippine Peso symbol
 */
export function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Calculate percentage change between current and previous period
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * Generate comparison text for spending trends
 */
export function generateComparisonText(current: number, previous: number, period: BudgetPeriod): string {
  const change = calculatePercentageChange(current, previous)
  const absChange = Math.abs(change)

  if (absChange < 1) return "No change"

  const direction = change > 0 ? "↑" : "↓"
  const periodText = period === "weekly" ? "last week" : period === "monthly" ? "last month" : "last year"

  return `${direction} ${absChange.toFixed(0)}% vs ${periodText}`
}

/**
 * Generate actionable budget suggestion
 */
export function generateSuggestion(
  categoryName: string,
  utilization: number,
  amountRemaining: number,
  period: BudgetPeriod,
  change: number
): string | undefined {
  // Exceeded budget
  if (utilization >= 100) {
    const excess = Math.abs(amountRemaining)
    return `You've exceeded your ${categoryName} budget by ${formatCurrency(excess)}. Consider reducing spending.`
  }

  // Critical - approaching limit
  if (utilization >= 90) {
    return `Only ${formatCurrency(amountRemaining)} left in your ${categoryName} budget. Spend carefully!`
  }

  // Warning - but increasing rapidly
  if (utilization >= 70 && change > 20) {
    return `${categoryName} spending is up ${change.toFixed(0)}%. Consider reviewing this category.`
  }

  // Positive - spending decreased significantly
  if (utilization < 50 && change < -20) {
    return `Great job! You're spending ${Math.abs(change).toFixed(0)}% less on ${categoryName}.`
  }

  // Under budget with room
  if (utilization < 70) {
    const daysRemaining = getDaysRemainingInPeriod(period)
    const dailyBudget = amountRemaining / daysRemaining
    if (dailyBudget > 0) {
      return `You can spend ${formatCurrency(dailyBudget)} per day on ${categoryName} for the rest of this ${period}.`
    }
  }

  return undefined
}

/**
 * Get days remaining in current period
 */
export function getDaysRemainingInPeriod(period: BudgetPeriod): number {
  const now = new Date()
  let endDate = new Date()

  switch (period) {
    case "weekly":
      endDate.setDate(now.getDate() + (7 - now.getDay())) // End of week (Sunday)
      break
    case "monthly":
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0) // Last day of month
      break
    case "yearly":
      endDate = new Date(now.getFullYear(), 11, 31) // Dec 31
      break
  }

  const diffTime = endDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Calculate comprehensive budget insights for a category
 */
export function calculateBudgetInsight(
  category: Category,
  transactions: Transaction[]
): BudgetInsight {
  const period = category.budget_period
  const currentRange = getDateRangeForPeriod(period)
  const previousRange = getPreviousPeriodRange(period)

  const currentSpending = calculateSpendingInRange(
    transactions,
    category.id,
    currentRange.start,
    currentRange.end
  )

  const previousSpending = calculateSpendingInRange(
    transactions,
    category.id,
    previousRange.start,
    previousRange.end
  )

  const utilization = calculateUtilization(currentSpending, category.budget_amount)
  const status = getBudgetStatus(utilization)
  const amountRemaining = category.budget_amount - currentSpending
  const change = calculatePercentageChange(currentSpending, previousSpending)

  return {
    category_id: category.id,
    category_name: category.name,
    status,
    utilization_percentage: Math.round(utilization * 10) / 10, // Round to 1 decimal
    amount_spent: currentSpending,
    amount_remaining: amountRemaining,
    budget_amount: category.budget_amount,
    period,
    comparison_text: generateComparisonText(currentSpending, previousSpending, period),
    suggestion: generateSuggestion(category.name, utilization, amountRemaining, period, change),
  }
}

/**
 * Calculate insights for all categories
 */
export function calculateAllBudgetInsights(
  categories: Category[],
  transactions: Transaction[]
): BudgetInsight[] {
  return categories
    .filter((c) => c.is_active && c.budget_amount > 0)
    .map((category) => calculateBudgetInsight(category, transactions))
    .sort((a, b) => {
      // Sort by status priority (exceeded first, then critical, warning, ok)
      const statusPriority = { exceeded: 0, critical: 1, warning: 2, ok: 3 }
      return statusPriority[a.status] - statusPriority[b.status]
    })
}

/**
 * Get overall budget health summary
 */
export interface BudgetHealthSummary {
  total_budget: number
  total_spent: number
  total_remaining: number
  overall_utilization: number
  categories_on_track: number
  categories_warning: number
  categories_critical: number
  categories_exceeded: number
}

export function calculateBudgetHealth(insights: BudgetInsight[]): BudgetHealthSummary {
  const totalBudget = insights.reduce((sum, i) => sum + i.budget_amount, 0)
  const totalSpent = insights.reduce((sum, i) => sum + i.amount_spent, 0)
  const totalRemaining = totalBudget - totalSpent

  return {
    total_budget: totalBudget,
    total_spent: totalSpent,
    total_remaining: totalRemaining,
    overall_utilization: calculateUtilization(totalSpent, totalBudget),
    categories_on_track: insights.filter((i) => i.status === "ok").length,
    categories_warning: insights.filter((i) => i.status === "warning").length,
    categories_critical: insights.filter((i) => i.status === "critical").length,
    categories_exceeded: insights.filter((i) => i.status === "exceeded").length,
  }
}
