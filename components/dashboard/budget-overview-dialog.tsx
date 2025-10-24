/**
 * Budget Overview Dialog Component
 *
 * Comprehensive budget tracking interface showing:
 * - Budget vs actual spending by category
 * - Visual progress bars with color coding
 * - Spending trends and comparisons
 * - Actionable insights and suggestions
 * - Overall budget health summary
 */

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Category, Transaction, BudgetInsight, BudgetPeriod } from "@/lib/types"
import {
  calculateAllBudgetInsights,
  calculateBudgetHealth,
  formatCurrency,
  type BudgetHealthSummary,
} from "@/lib/utils/budget-calculator"
import { BudgetProgressBar, CircularBudgetProgress } from "@/components/ui/budget-progress-bar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  DollarSign,
  PieChart,
  Calendar,
  Lightbulb,
} from "lucide-react"

interface BudgetOverviewDialogProps {
  userId: string
  trigger?: React.ReactNode
}

export function BudgetOverviewDialog({ userId, trigger }: BudgetOverviewDialogProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [insights, setInsights] = useState<BudgetInsight[]>([])
  const [healthSummary, setHealthSummary] = useState<BudgetHealthSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<BudgetPeriod>("monthly")
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [userId, isOpen])

  useEffect(() => {
    if (categories.length > 0 && transactions.length > 0) {
      calculateInsights()
    }
  }, [categories, transactions, selectedPeriod])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId)
        .order("name")

      if (categoriesError) throw categoriesError

      // Fetch all transactions for calculations
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .eq("type", "expense")
        .order("date", { ascending: false })

      if (transactionsError) throw transactionsError

      setCategories(categoriesData || [])
      setTransactions(transactionsData || [])
    } catch (error) {
      console.error("Error fetching budget data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateInsights = () => {
    // Filter categories by selected period
    const filteredCategories = categories
      .map((cat) => ({
        ...cat,
        budget_period: selectedPeriod, // Override with selected period for calculation
        is_active: cat.is_active ?? true, // Default to true if undefined
      }))
      .filter((cat) => cat.is_active && cat.budget_amount > 0)

    const budgetInsights = calculateAllBudgetInsights(filteredCategories, transactions)
    const health = calculateBudgetHealth(budgetInsights)

    setInsights(budgetInsights)
    setHealthSummary(health)
  }

  const getHealthStatusColor = () => {
    if (!healthSummary) return "#72ADFD"
    const { categories_exceeded, categories_critical, categories_warning } = healthSummary
    if (categories_exceeded > 0) return "#ef4444"
    if (categories_critical > 0) return "#f97316"
    if (categories_warning > 0) return "#f59e0b"
    return "#22c55e"
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <PieChart className="h-4 w-4" />
            Budget Overview
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Budget Overview
          </DialogTitle>
          <DialogDescription>
            Track your spending against budgets and get personalized insights
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading budget data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Period Selector */}
            <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as BudgetPeriod)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Health Summary Cards */}
            {healthSummary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Total Budget
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" style={{ color: "#293F55" }}>
                      {formatCurrency(healthSummary.total_budget)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Total Spent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(healthSummary.total_spent)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {healthSummary.overall_utilization.toFixed(1)}% of budget
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" />
                      Remaining
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: healthSummary.total_remaining >= 0 ? "#22c55e" : "#ef4444" }}
                    >
                      {formatCurrency(healthSummary.total_remaining)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <PieChart className="h-4 w-4" />
                      Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center">
                      <CircularBudgetProgress
                        utilization={healthSummary.overall_utilization}
                        status={
                          healthSummary.categories_exceeded > 0
                            ? "exceeded"
                            : healthSummary.categories_critical > 0
                              ? "critical"
                              : healthSummary.categories_warning > 0
                                ? "warning"
                                : "ok"
                        }
                        size={60}
                        strokeWidth={6}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Budget Status Summary */}
            {healthSummary && (healthSummary.categories_exceeded > 0 || healthSummary.categories_critical > 0) && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Budget Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm">
                    {healthSummary.categories_exceeded > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-600"></div>
                        <span className="text-red-800">
                          {healthSummary.categories_exceeded} over budget
                        </span>
                      </div>
                    )}
                    {healthSummary.categories_critical > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-orange-800">
                          {healthSummary.categories_critical} critical
                        </span>
                      </div>
                    )}
                    {healthSummary.categories_warning > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-yellow-800">
                          {healthSummary.categories_warning} warning
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>
                  Spending across all categories for the {selectedPeriod} period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {insights.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No budget data available.</p>
                    <p className="text-sm mt-2">Set budgets for your categories to track spending.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {insights.map((insight) => (
                      <div key={insight.category_id} className="space-y-2">
                        <BudgetProgressBar
                          spent={insight.amount_spent}
                          budget={insight.budget_amount}
                          utilization={insight.utilization_percentage}
                          status={insight.status}
                          categoryName={insight.category_name}
                          showLabels={true}
                          showPercentage={true}
                          showAmounts={true}
                          showStatusIcon={true}
                          comparisonText={insight.comparison_text}
                        />
                        {insight.suggestion && (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
                            <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-800">{insight.suggestion}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
              <Button
                onClick={fetchData}
                className="text-white"
                style={{ backgroundColor: "#72ADFD" }}
              >
                Refresh Data
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
