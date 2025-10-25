"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { Goal, Category, Transaction, BudgetInsight } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import { BudgetProgressBarCompact } from "@/components/ui/budget-progress-bar"
import { calculateBudgetInsight } from "@/lib/utils/budget-calculator"
import { Target, Calendar, TrendingUp, AlertCircle, PieChart } from "lucide-react"

// Lazy load dialogs - only loaded when user interacts
const AddGoalDialog = dynamic(
  () => import("./add-goal-dialog").then((mod) => ({ default: mod.AddGoalDialog })),
  { ssr: false }
)
const EditGoalDialog = dynamic(
  () => import("./edit-goal-dialog").then((mod) => ({ default: mod.EditGoalDialog })),
  { ssr: false }
)
const ContributeToGoalDialog = dynamic(
  () => import("./contribute-to-goal-dialog").then((mod) => ({ default: mod.ContributeToGoalDialog })),
  { ssr: false }
)
const ManageCategoriesDialog = dynamic(
  () => import("./manage-categories-dialog").then((mod) => ({ default: mod.ManageCategoriesDialog })),
  { ssr: false }
)
const BudgetOverviewDialog = dynamic(
  () => import("./budget-overview-dialog").then((mod) => ({ default: mod.BudgetOverviewDialog })),
  { ssr: false }
)

interface GoalsSectionProps {
  userId: string
}

export function GoalsSection({ userId }: GoalsSectionProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgetInsights, setBudgetInsights] = useState<BudgetInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchGoals()
    fetchCategories()
    fetchTransactions()
  }, [userId])

  useEffect(() => {
    if (categories.length > 0 && transactions.length > 0) {
      calculateCategoryInsights()
    }
  }, [categories, transactions])

  const fetchGoals = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching goals:", error)
      } else if (data) {
        // Filter out archived goals (in case the column doesn't exist yet)
        const activeGoalsData = data.filter((goal) => !goal.archived)
        setGoals(activeGoalsData)
      }
    } catch (error) {
      console.error("Error fetching goals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("name")

    if (data) {
      // Ensure is_active defaults to true if field doesn't exist
      const categoriesWithDefaults = data.map((cat) => ({
        ...cat,
        is_active: cat.is_active ?? true,
        budget_period: cat.budget_period ?? "monthly",
      }))
      setCategories(categoriesWithDefaults)
    }
  }

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "expense")
      .order("date", { ascending: false })
      .limit(500) // Last 500 transactions for calculations

    if (data) setTransactions(data)
  }

  const calculateCategoryInsights = () => {
    const insights = categories
      .filter((cat) => cat.is_active && cat.budget_amount > 0)
      .map((cat) => calculateBudgetInsight(cat, transactions))
      .sort((a, b) => {
        // Sort by status priority
        const statusPriority = { exceeded: 0, critical: 1, warning: 2, ok: 3 }
        return statusPriority[a.status] - statusPriority[b.status]
      })
      .slice(0, 4) // Top 4 for display

    setBudgetInsights(insights)
  }

  const getProgressColor = (progress: number): string => {
    if (progress >= 100) return "#10b981" // green - completed
    if (progress >= 70) return "#22c55e" // light green - on track
    if (progress >= 40) return "#f59e0b" // yellow - moderate
    return "#ef4444" // red - behind
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "#10b981"
      case "paused":
        return "#9ca3af"
      case "failed":
        return "#ef4444"
      default:
        return "#72ADFD"
    }
  }

  const calculateDaysRemaining = (endDate: string): number => {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const calculateProjectedCompletion = (goal: Goal): string => {
    const daysElapsed = Math.ceil(
      (new Date().getTime() - new Date(goal.start_date).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysElapsed === 0 || goal.current_amount === 0) return "No data yet"

    const dailyRate = goal.current_amount / daysElapsed
    const remainingAmount = goal.target_amount - goal.current_amount
    const daysNeeded = Math.ceil(remainingAmount / dailyRate)

    if (daysNeeded < 0) return "Completed!"
    if (daysNeeded === 0) return "Today!"
    if (daysNeeded === 1) return "Tomorrow"
    if (daysNeeded <= 7) return `In ${daysNeeded} days`
    if (daysNeeded <= 30) return `In ${Math.ceil(daysNeeded / 7)} weeks`
    return `In ${Math.ceil(daysNeeded / 30)} months`
  }

  const totalBudget = categories.reduce((sum, cat) => sum + Number(cat.budget_amount), 0)
  const activeGoals = goals.filter((g) => g.status === "active")
  const completedGoals = goals.filter((g) => g.status === "completed")

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "#72ADFD" }}>
            <Target className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-2xl font-semibold" style={{ color: "#293F55" }}>
            Goals
          </h2>
          <span className="text-sm text-gray-500 ml-2">
            ({activeGoals.length} active, {completedGoals.length} completed)
          </span>
        </div>
        <AddGoalDialog userId={userId} onSuccess={fetchGoals} />
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">No goals yet. Start tracking your financial goals!</p>
          <AddGoalDialog userId={userId} onSuccess={fetchGoals} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Active Goals */}
          {goals.map((goal) => {
            const progress = (goal.current_amount / goal.target_amount) * 100
            const progressColor = getProgressColor(progress)
            const daysRemaining = calculateDaysRemaining(goal.end_date)
            const isOverdue = daysRemaining < 0 && goal.status === "active"
            const projectedCompletion = calculateProjectedCompletion(goal)

            return (
              <div
                key={goal.id}
                className="bg-gray-50 rounded-2xl p-5 space-y-4 hover:shadow-md transition-shadow"
                style={{
                  borderLeft: `4px solid ${getStatusColor(goal.status)}`,
                  opacity: goal.status === "paused" ? 0.7 : 1,
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1" style={{ color: "#293F55" }}>
                      {goal.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {goal.category && (
                        <span className="px-2 py-1 rounded-full text-xs bg-white text-gray-600">{goal.category}</span>
                      )}
                      <span
                        className="px-2 py-1 rounded-full text-xs text-white capitalize"
                        style={{ backgroundColor: getStatusColor(goal.status) }}
                      >
                        {goal.status}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs bg-white text-gray-600">{goal.type}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold" style={{ color: progressColor }}>
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: progressColor,
                      }}
                    />
                  </div>
                </div>

                {/* Amount Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-gray-500 text-xs mb-1">Saved</div>
                    <div className="font-bold" style={{ color: "#72ADFD" }}>
                      ₱{goal.current_amount.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-gray-500 text-xs mb-1">Target</div>
                    <div className="font-bold" style={{ color: "#293F55" }}>
                      ₱{goal.target_amount.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Timeline & Projection */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {isOverdue ? (
                        <span className="text-red-600 font-medium">Overdue by {Math.abs(daysRemaining)} days</span>
                      ) : (
                        <span>{daysRemaining} days remaining</span>
                      )}
                    </span>
                  </div>
                  {goal.status === "active" && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <TrendingUp className="h-4 w-4" />
                      <span>Projected: {projectedCompletion}</span>
                    </div>
                  )}
                  {goal.auto_contribution_amount && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>
                        Auto: ₱{goal.auto_contribution_amount} / {goal.auto_contribution_frequency}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  {goal.status === "active" && (
                    <ContributeToGoalDialog
                      goal={goal}
                      onSuccess={fetchGoals}
                      trigger={
                        <Button size="sm" className="flex-1 text-white" style={{ backgroundColor: "#72ADFD" }}>
                          Contribute
                        </Button>
                      }
                    />
                  )}
                  <EditGoalDialog
                    goal={goal}
                    onSuccess={fetchGoals}
                    trigger={
                      <Button size="sm" variant="outline" className="flex-1">
                        Manage
                      </Button>
                    }
                  />
                </div>
              </div>
            )
          })}

          {/* Budget Tracking Card */}
          <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "#72ADFD" }}>
                  <PieChart className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-lg" style={{ color: "#293F55" }}>
                  Budget Tracking
                </h3>
              </div>
              <BudgetOverviewDialog
                userId={userId}
                trigger={
                  <Button size="sm" variant="outline">
                    View All
                  </Button>
                }
              />
            </div>

            {budgetInsights.length === 0 ? (
              <div className="text-center py-8">
                <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-sm mb-4">No budget tracking data yet.</p>
                <ManageCategoriesDialog userId={userId} onSuccess={fetchCategories} />
              </div>
            ) : (
              <>
                {/* Top Budget Alerts */}
                <div className="space-y-3">
                  {budgetInsights.map((insight) => (
                    <div
                      key={insight.category_id}
                      className="bg-white rounded-lg p-3 space-y-2"
                    >
                      <BudgetProgressBarCompact
                        spent={insight.amount_spent}
                        budget={insight.budget_amount}
                        utilization={insight.utilization_percentage}
                        status={insight.status}
                        categoryName={insight.category_name}
                      />
                      {insight.suggestion && (
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {insight.suggestion}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-500">Total Budget</div>
                    <div className="text-sm font-bold" style={{ color: "#72ADFD" }}>
                      ₱{totalBudget.toFixed(0)}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-500">Categories</div>
                    <div className="text-sm font-bold" style={{ color: "#293F55" }}>
                      {categories.length}
                    </div>
                  </div>
                </div>

                {/* Manage Link */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-gray-600">Manage categories</span>
                  <ManageCategoriesDialog userId={userId} onSuccess={fetchCategories} />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
