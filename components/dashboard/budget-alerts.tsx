/**
 * Budget Alerts Component
 *
 * Displays prominent budget warnings and alerts when categories are
 * approaching or exceeding their budget limits. Shows as banner/toast
 * notifications on the dashboard.
 */

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Category, Transaction, BudgetInsight } from "@/lib/types"
import { calculateAllBudgetInsights, formatCurrency } from "@/lib/utils/budget-calculator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X, AlertCircle, AlertTriangle, TrendingUp } from "lucide-react"
import { BudgetOverviewDialog } from "./budget-overview-dialog"

interface BudgetAlertsProps {
  userId: string
}

export function BudgetAlerts({ userId }: BudgetAlertsProps) {
  const [alerts, setAlerts] = useState<BudgetInsight[]>([])
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchBudgetAlerts()
    // Load dismissed alerts from localStorage
    const dismissed = localStorage.getItem("dismissedBudgetAlerts")
    if (dismissed) {
      setDismissedAlerts(new Set(JSON.parse(dismissed)))
    }
  }, [userId])

  const fetchBudgetAlerts = async () => {
    setIsLoading(true)
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId)

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .eq("type", "expense")
        .order("date", { ascending: false })
        .limit(500)

      if (categoriesData && transactionsData) {
        // Ensure defaults for new fields
        const categories = categoriesData.map((cat) => ({
          ...cat,
          is_active: cat.is_active ?? true,
          budget_period: cat.budget_period ?? "monthly",
        }))

        // Calculate insights and filter for alerts only
        const insights = calculateAllBudgetInsights(categories, transactionsData)
        const criticalAlerts = insights.filter(
          (i) => i.status === "exceeded" || i.status === "critical" || i.status === "warning"
        )

        setAlerts(criticalAlerts)
      }
    } catch (error) {
      console.error("Error fetching budget alerts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const dismissAlert = (categoryId: string) => {
    const newDismissed = new Set(dismissedAlerts)
    newDismissed.add(categoryId)
    setDismissedAlerts(newDismissed)
    localStorage.setItem("dismissedBudgetAlerts", JSON.stringify(Array.from(newDismissed)))
  }

  const getAlertVariant = (status: string): "default" | "destructive" => {
    if (status === "exceeded" || status === "critical") return "destructive"
    return "default"
  }

  const getAlertIcon = (status: string) => {
    if (status === "exceeded") return <AlertCircle className="h-5 w-5" />
    if (status === "critical") return <AlertTriangle className="h-5 w-5" />
    return <TrendingUp className="h-5 w-5" />
  }

  const getAlertTitle = (status: string, categoryName: string) => {
    if (status === "exceeded") return `${categoryName} Budget Exceeded!`
    if (status === "critical") return `${categoryName} Budget Critical`
    return `${categoryName} Budget Warning`
  }

  // Filter out dismissed alerts
  const visibleAlerts = alerts.filter((alert) => !dismissedAlerts.has(alert.category_id))

  if (isLoading || visibleAlerts.length === 0) {
    return null
  }

  return (
    <div className="space-y-3 mb-6">
      {visibleAlerts.map((alert) => (
        <Alert
          key={alert.category_id}
          variant={getAlertVariant(alert.status)}
          className="relative"
        >
          {getAlertIcon(alert.status)}
          <AlertTitle className="pr-8">
            {getAlertTitle(alert.status, alert.category_name)}
          </AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>
                You've spent {formatCurrency(alert.amount_spent)} of your{" "}
                {formatCurrency(alert.budget_amount)} {alert.period} budget
                {" "}({alert.utilization_percentage.toFixed(1)}%).
              </p>
              {alert.amount_remaining < 0 ? (
                <p className="font-semibold">
                  You're over budget by {formatCurrency(Math.abs(alert.amount_remaining))}.
                </p>
              ) : (
                <p>
                  Only {formatCurrency(alert.amount_remaining)} remaining.
                </p>
              )}
              {alert.comparison_text && (
                <p className="text-sm opacity-90">{alert.comparison_text}</p>
              )}
              <div className="flex gap-2 mt-3">
                <BudgetOverviewDialog
                  userId={userId}
                  trigger={
                    <Button size="sm" variant="outline" className="bg-white">
                      View Budget Details
                    </Button>
                  }
                />
              </div>
            </div>
          </AlertDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => dismissAlert(alert.category_id)}
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      ))}

      {/* Summary Alert if multiple warnings */}
      {visibleAlerts.length > 3 && (
        <Alert>
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Multiple Budget Alerts</AlertTitle>
          <AlertDescription>
            You have {visibleAlerts.length} categories with budget warnings. Consider reviewing
            your spending patterns.
            <div className="mt-3">
              <BudgetOverviewDialog
                userId={userId}
                trigger={
                  <Button size="sm" variant="outline">
                    Review All Budgets
                  </Button>
                }
              />
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

/**
 * Compact Badge Alert for Navigation/Header
 */
interface BudgetAlertBadgeProps {
  userId: string
}

export function BudgetAlertBadge({ userId }: BudgetAlertBadgeProps) {
  const [alertCount, setAlertCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchAlertCount()
  }, [userId])

  const fetchAlertCount = async () => {
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
        .limit(500)

      if (categoriesData && transactionsData) {
        const categories = categoriesData.map((cat) => ({
          ...cat,
          is_active: cat.is_active ?? true,
          budget_period: cat.budget_period ?? "monthly",
        }))

        const insights = calculateAllBudgetInsights(categories, transactionsData)
        const criticalCount = insights.filter(
          (i) => i.status === "exceeded" || i.status === "critical"
        ).length

        setAlertCount(criticalCount)
      }
    } catch (error) {
      console.error("Error fetching alert count:", error)
    }
  }

  if (alertCount === 0) return null

  return (
    <div className="relative inline-flex">
      <BudgetOverviewDialog
        userId={userId}
        trigger={
          <Button variant="outline" size="sm" className="gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-red-600 font-semibold">
              {alertCount} Budget Alert{alertCount > 1 ? "s" : ""}
            </span>
          </Button>
        }
      />
    </div>
  )
}
