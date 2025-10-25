import type { Transaction, Goal } from "@/lib/types"
import { getPeriodRange, type Period } from "./period-utils"

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
