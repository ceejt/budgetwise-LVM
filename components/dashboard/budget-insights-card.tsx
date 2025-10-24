/**
 * Budget Insights Card Component
 *
 * Displays intelligent budget insights and suggestions in the summary section.
 * Shows spending trends, recommendations, and actionable tips based on
 * actual spending patterns vs budgets.
 */

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Category, Transaction, BudgetInsight } from "@/lib/types"
import { calculateAllBudgetInsights, formatCurrency } from "@/lib/utils/budget-calculator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, TrendingDown, TrendingUp, Target, DollarSign } from "lucide-react"
import { BudgetOverviewDialog } from "./budget-overview-dialog"
import { Button } from "@/components/ui/button"

interface BudgetInsightsCardProps {
  userId: string
}

export function BudgetInsightsCard({ userId }: BudgetInsightsCardProps) {
  const [insights, setInsights] = useState<BudgetInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchInsights()
  }, [userId])

  const fetchInsights = async () => {
    setIsLoading(true)
    try {
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId)

      const { data: transactionsData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .eq("type", "expense")
        .order("date", { ascending: false })
        .limit(500)

      if (categoriesData && transactionsData) {
        const categories = categoriesData.map((cat) => ({
          ...cat,
          is_active: cat.is_active ?? true,
          budget_period: cat.budget_period ?? "monthly",
        }))

        const allInsights = calculateAllBudgetInsights(categories, transactionsData)

        // Get top insights with suggestions
        const topInsights = allInsights
          .filter((i) => i.suggestion)
          .slice(0, 3)

        setInsights(topInsights)
      }
    } catch (error) {
      console.error("Error fetching budget insights:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getInsightIcon = (status: string) => {
    switch (status) {
      case "exceeded":
      case "critical":
        return <TrendingUp className="h-4 w-4 text-red-600" />
      case "warning":
        return <Target className="h-4 w-4 text-yellow-600" />
      case "ok":
        return <TrendingDown className="h-4 w-4 text-green-600" />
      default:
        return <DollarSign className="h-4 w-4 text-blue-600" />
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "exceeded":
        return "#ef4444"
      case "critical":
        return "#f97316"
      case "warning":
        return "#f59e0b"
      default:
        return "#22c55e"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Budget Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-sm text-gray-500">Loading insights...</div>
        </CardContent>
      </Card>
    )
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Budget Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Lightbulb className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500 mb-3">No insights available yet.</p>
            <p className="text-xs text-gray-400">
              Set budgets for your categories to get personalized spending insights.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-600" />
          Budget Insights
        </CardTitle>
        <BudgetOverviewDialog
          userId={userId}
          trigger={
            <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
              View All
            </Button>
          }
        />
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.category_id}
            className="p-3 rounded-lg border bg-gradient-to-br from-gray-50 to-white hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{getInsightIcon(insight.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-900">
                    {insight.category_name}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: getStatusColor(insight.status) }}
                  >
                    {insight.utilization_percentage.toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">{insight.suggestion}</p>
                {insight.comparison_text && (
                  <p className="text-xs text-gray-500 mt-1">{insight.comparison_text}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Quick tip at the bottom */}
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-600 leading-relaxed">
            <span className="font-semibold">💡 Tip:</span> Review your budgets weekly to stay on
            track with your financial goals.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
