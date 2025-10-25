/**
 * CSV Export Utility
 *
 * Provides functions to export transactions, categories, goals, and bills to CSV format
 * Uses the export-to-csv library for TypeScript-first, zero-dependency exports
 */

import { mkConfig, generateCsv, download } from "export-to-csv"
import type { Transaction, Category, Goal, Bill } from "@/lib/types"
import { format } from "date-fns"

/**
 * Export transactions to CSV
 */
export function exportTransactionsToCSV(
  transactions: Transaction[],
  filename?: string
) {
  const csvConfig = mkConfig({
    fieldSeparator: ",",
    filename: filename || `transactions_${format(new Date(), "yyyy-MM-dd")}`,
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  })

  const csvData = transactions.map((t) => ({
    Date: format(new Date(t.date), "yyyy-MM-dd"),
    Type: t.type === "income" ? "Income" : "Expense",
    Amount: t.amount,
    Category: t.category_name || "Uncategorized",
    Description: t.description || "",
    Wallet: t.wallet_id || "N/A",
    "Is Transfer": t.is_transfer ? "Yes" : "No",
    "Is Recurring": t.is_recurring ? "Yes" : "No",
    "Recurrence Pattern": t.recurrence_pattern || "N/A",
  }))

  const csv = generateCsv(csvConfig)(csvData)
  download(csvConfig)(csv)
}

/**
 * Export categories with budget information to CSV
 */
export function exportCategoriesToCSV(
  categories: Category[],
  spendingData?: Array<{ category_id: string; spent: number }>,
  filename?: string
) {
  const csvConfig = mkConfig({
    fieldSeparator: ",",
    filename: filename || `categories_${format(new Date(), "yyyy-MM-dd")}`,
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  })

  const csvData = categories.map((cat) => {
    const spent = spendingData?.find((s) => s.category_id === cat.id)?.spent || 0
    const utilization = cat.budget_amount > 0 ? (spent / cat.budget_amount) * 100 : 0

    return {
      Category: cat.name,
      "Budget Amount": cat.budget_amount,
      "Budget Period": cat.budget_period,
      "Amount Spent": spent,
      "Utilization %": utilization.toFixed(2),
      Remaining: Math.max(0, cat.budget_amount - spent),
      Status: cat.is_active ? "Active" : "Inactive",
      Description: cat.description || "",
    }
  })

  const csv = generateCsv(csvConfig)(csvData)
  download(csvConfig)(csv)
}

/**
 * Export goals to CSV
 */
export function exportGoalsToCSV(goals: Goal[], filename?: string) {
  const csvConfig = mkConfig({
    fieldSeparator: ",",
    filename: filename || `goals_${format(new Date(), "yyyy-MM-dd")}`,
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  })

  const csvData = goals.map((goal) => {
    const progress = (goal.current_amount / goal.target_amount) * 100
    const remaining = goal.target_amount - goal.current_amount
    const daysRemaining = Math.ceil(
      (new Date(goal.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )

    return {
      Goal: goal.name,
      Type: goal.type,
      "Target Amount": goal.target_amount,
      "Current Amount": goal.current_amount,
      "Progress %": progress.toFixed(2),
      Remaining: remaining,
      "Start Date": format(new Date(goal.start_date), "yyyy-MM-dd"),
      "End Date": format(new Date(goal.end_date), "yyyy-MM-dd"),
      "Days Remaining": daysRemaining,
      Status: goal.status,
      Category: goal.category || "N/A",
      "Auto Contribution": goal.auto_contribution_amount || "N/A",
      Paused: goal.paused ? "Yes" : "No",
    }
  })

  const csv = generateCsv(csvConfig)(csvData)
  download(csvConfig)(csv)
}

/**
 * Export bills to CSV
 */
export function exportBillsToCSV(bills: Bill[], filename?: string) {
  const csvConfig = mkConfig({
    fieldSeparator: ",",
    filename: filename || `bills_${format(new Date(), "yyyy-MM-dd")}`,
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  })

  const csvData = bills.map((bill) => ({
    Bill: bill.name,
    Amount: bill.amount,
    "Due Date": format(new Date(bill.due_date), "yyyy-MM-dd"),
    Status: bill.status,
    Category: bill.category_name || "N/A",
    "Is Recurring": bill.is_recurring ? "Yes" : "No",
    "Recurrence Pattern": bill.recurrence_pattern || "N/A",
    "Reminder Days": bill.reminder_days_before,
    "Auto Pay": bill.auto_pay_enabled ? "Yes" : "No",
    "Last Paid": bill.last_paid_date ? format(new Date(bill.last_paid_date), "yyyy-MM-dd") : "Never",
    "Payment Count": bill.payment_count,
    Merchant: bill.merchant_name || "N/A",
    Notes: bill.notes || "",
  }))

  const csv = generateCsv(csvConfig)(csvData)
  download(csvConfig)(csv)
}

/**
 * Export monthly summary report to CSV
 */
export function exportMonthlySummaryToCSV(
  data: {
    period: string
    total_income: number
    total_expenses: number
    net_savings: number
    top_categories: Array<{ category: string; amount: number; percentage: number }>
    income_sources: Array<{ source: string; amount: number; percentage: number }>
  },
  filename?: string
) {
  const csvConfig = mkConfig({
    fieldSeparator: ",",
    filename: filename || `monthly_summary_${format(new Date(), "yyyy-MM-dd")}`,
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  })

  // Summary section
  const summaryData = [
    { Metric: "Period", Value: data.period },
    { Metric: "Total Income", Value: data.total_income },
    { Metric: "Total Expenses", Value: data.total_expenses },
    { Metric: "Net Savings", Value: data.net_savings },
    { Metric: "Savings Rate", Value: `${((data.net_savings / data.total_income) * 100).toFixed(2)}%` },
    { Metric: "", Value: "" }, // Empty row for separation
  ]

  // Top expense categories
  const categoryHeader = [{ Metric: "Top Expense Categories", Value: "" }]
  const categoryData = data.top_categories.map((cat) => ({
    Metric: cat.category,
    Value: cat.amount,
    Percentage: `${cat.percentage.toFixed(2)}%`,
  }))

  // Income sources
  const incomeHeader = [
    { Metric: "", Value: "" },
    { Metric: "Income Sources", Value: "" },
  ]
  const incomeData = data.income_sources.map((source) => ({
    Metric: source.source,
    Value: source.amount,
    Percentage: `${source.percentage.toFixed(2)}%`,
  }))

  const allData = [...summaryData, ...categoryHeader, ...categoryData, ...incomeHeader, ...incomeData]

  const csv = generateCsv(csvConfig)(allData)
  download(csvConfig)(csv)
}

/**
 * Export category analysis to CSV
 */
export function exportCategoryAnalysisToCSV(
  categories: Array<{
    category_name: string
    total_spent: number
    transaction_count: number
    average_transaction: number
    budget_amount: number | null
    trend: "increasing" | "decreasing" | "stable"
  }>,
  filename?: string
) {
  const csvConfig = mkConfig({
    fieldSeparator: ",",
    filename: filename || `category_analysis_${format(new Date(), "yyyy-MM-dd")}`,
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  })

  const csvData = categories.map((cat) => ({
    Category: cat.category_name,
    "Total Spent": cat.total_spent,
    "Transaction Count": cat.transaction_count,
    "Average Transaction": cat.average_transaction.toFixed(2),
    Budget: cat.budget_amount || "No budget",
    "Budget Utilization %": cat.budget_amount
      ? ((cat.total_spent / cat.budget_amount) * 100).toFixed(2)
      : "N/A",
    Trend: cat.trend,
  }))

  const csv = generateCsv(csvConfig)(csvData)
  download(csvConfig)(csv)
}
