/**
 * Excel (XLSX) Export Utility
 *
 * Provides functions to export data to Excel format with multiple sheets
 * Uses SheetJS (xlsx) library for comprehensive Excel file generation
 */

import * as XLSX from "xlsx"
import type { Transaction, Category, Goal, Bill, MonthlyReportData } from "@/lib/types"
import { format } from "date-fns"

/**
 * Export transactions to Excel
 */
export function exportTransactionsToExcel(
  transactions: Transaction[],
  filename?: string
) {
  const data = transactions.map((t) => ({
    Date: format(new Date(t.date), "yyyy-MM-dd"),
    Type: t.type === "income" ? "Income" : "Expense",
    Amount: t.amount,
    Category: t.category_name || "Uncategorized",
    Description: t.description || "",
    Wallet: t.wallet_id || "N/A",
    "Is Transfer": t.is_transfer ? "Yes" : "No",
    "Is Recurring": t.is_recurring ? "Yes" : "No",
    "Recurrence Pattern": t.recurrence_pattern || "N/A",
    "Created At": format(new Date(t.created_at), "yyyy-MM-dd HH:mm:ss"),
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions")

  // Auto-size columns
  const maxWidth = data.reduce((w, r) => Math.max(w, r.Description?.length || 0), 10)
  worksheet["!cols"] = [
    { wch: 12 }, // Date
    { wch: 10 }, // Type
    { wch: 12 }, // Amount
    { wch: 15 }, // Category
    { wch: Math.min(maxWidth, 50) }, // Description
    { wch: 15 }, // Wallet
    { wch: 12 }, // Is Transfer
    { wch: 12 }, // Is Recurring
    { wch: 18 }, // Recurrence Pattern
    { wch: 20 }, // Created At
  ]

  XLSX.writeFile(workbook, filename || `transactions_${format(new Date(), "yyyy-MM-dd")}.xlsx`)
}

/**
 * Export comprehensive financial report with multiple sheets
 */
export function exportCompleteReportToExcel(
  data: {
    transactions: Transaction[]
    categories: Category[]
    goals: Goal[]
    bills?: Bill[]
    monthlyData?: MonthlyReportData
  },
  filename?: string
) {
  const workbook = XLSX.utils.book_new()

  // Sheet 1: Summary
  if (data.monthlyData) {
    const summaryData = [
      { Metric: "Period", Value: data.monthlyData.period },
      { Metric: "Total Income", Value: data.monthlyData.total_income },
      { Metric: "Total Expenses", Value: data.monthlyData.total_expenses },
      { Metric: "Net Savings", Value: data.monthlyData.net_savings },
      {
        Metric: "Savings Rate",
        Value: `${data.monthlyData.savings_rate.toFixed(2)}%`,
      },
      { Metric: "", Value: "" },
      { Metric: "Top Expense Categories", Value: "" },
      ...data.monthlyData.top_expense_categories.map((cat) => ({
        Metric: cat.category_name,
        Value: cat.amount,
        Percentage: `${cat.percentage.toFixed(2)}%`,
      })),
    ]

    const summarySheet = XLSX.utils.json_to_sheet(summaryData)
    summarySheet["!cols"] = [{ wch: 25 }, { wch: 20 }, { wch: 12 }]
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary")
  }

  // Sheet 2: Transactions
  const transactionData = data.transactions.map((t) => ({
    Date: format(new Date(t.date), "yyyy-MM-dd"),
    Type: t.type === "income" ? "Income" : "Expense",
    Amount: t.amount,
    Category: t.category_name || "Uncategorized",
    Description: t.description || "",
    Wallet: t.wallet_id || "N/A",
  }))

  const transactionSheet = XLSX.utils.json_to_sheet(transactionData)
  transactionSheet["!cols"] = [
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 15 },
    { wch: 40 },
    { wch: 15 },
  ]
  XLSX.utils.book_append_sheet(workbook, transactionSheet, "Transactions")

  // Sheet 3: Categories & Budgets
  const categoryData = data.categories.map((cat) => ({
    Category: cat.name,
    "Budget Amount": cat.budget_amount,
    "Budget Period": cat.budget_period,
    Status: cat.is_active ? "Active" : "Inactive",
    Description: cat.description || "",
  }))

  const categorySheet = XLSX.utils.json_to_sheet(categoryData)
  categorySheet["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 30 }]
  XLSX.utils.book_append_sheet(workbook, categorySheet, "Categories")

  // Sheet 4: Goals
  const goalData = data.goals.map((goal) => {
    const progress = (goal.current_amount / goal.target_amount) * 100
    const remaining = goal.target_amount - goal.current_amount

    return {
      Goal: goal.name,
      Type: goal.type,
      "Target Amount": goal.target_amount,
      "Current Amount": goal.current_amount,
      "Progress %": progress.toFixed(2),
      Remaining: remaining,
      "End Date": format(new Date(goal.end_date), "yyyy-MM-dd"),
      Status: goal.status,
    }
  })

  const goalSheet = XLSX.utils.json_to_sheet(goalData)
  goalSheet["!cols"] = [
    { wch: 20 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
  ]
  XLSX.utils.book_append_sheet(workbook, goalSheet, "Goals")

  // Sheet 5: Bills (if provided)
  if (data.bills && data.bills.length > 0) {
    const billData = data.bills.map((bill) => ({
      Bill: bill.name,
      Amount: bill.amount,
      "Due Date": format(new Date(bill.due_date), "yyyy-MM-dd"),
      Status: bill.status,
      Category: bill.category_name || "N/A",
      "Is Recurring": bill.is_recurring ? "Yes" : "No",
      "Last Paid": bill.last_paid_date
        ? format(new Date(bill.last_paid_date), "yyyy-MM-dd")
        : "Never",
    }))

    const billSheet = XLSX.utils.json_to_sheet(billData)
    billSheet["!cols"] = [
      { wch: 25 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
    ]
    XLSX.utils.book_append_sheet(workbook, billSheet, "Bills")
  }

  XLSX.writeFile(
    workbook,
    filename || `financial_report_${format(new Date(), "yyyy-MM-dd")}.xlsx`
  )
}

/**
 * Export category analysis to Excel with charts-ready data
 */
export function exportCategoryAnalysisToExcel(
  categories: Array<{
    category_name: string
    total_spent: number
    transaction_count: number
    average_transaction: number
    budget_amount: number | null
    monthly_breakdown: Array<{ month: string; amount: number }>
  }>,
  filename?: string
) {
  const workbook = XLSX.utils.book_new()

  // Sheet 1: Summary
  const summaryData = categories.map((cat) => ({
    Category: cat.category_name,
    "Total Spent": cat.total_spent,
    "Transaction Count": cat.transaction_count,
    "Average Transaction": cat.average_transaction,
    Budget: cat.budget_amount || "No budget",
    "Utilization %": cat.budget_amount
      ? ((cat.total_spent / cat.budget_amount) * 100).toFixed(2)
      : "N/A",
  }))

  const summarySheet = XLSX.utils.json_to_sheet(summaryData)
  summarySheet["!cols"] = [
    { wch: 20 },
    { wch: 15 },
    { wch: 18 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
  ]
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary")

  // Sheet 2: Monthly Breakdown (Pivot-ready format)
  const monthlyData: Array<{ Category: string; Month: string; Amount: number }> = []
  categories.forEach((cat) => {
    cat.monthly_breakdown.forEach((month) => {
      monthlyData.push({
        Category: cat.category_name,
        Month: month.month,
        Amount: month.amount,
      })
    })
  })

  if (monthlyData.length > 0) {
    const monthlySheet = XLSX.utils.json_to_sheet(monthlyData)
    monthlySheet["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(workbook, monthlySheet, "Monthly Breakdown")
  }

  XLSX.writeFile(
    workbook,
    filename || `category_analysis_${format(new Date(), "yyyy-MM-dd")}.xlsx`
  )
}

/**
 * Export goals progress report to Excel
 */
export function exportGoalsToExcel(goals: Goal[], filename?: string) {
  const data = goals.map((goal) => {
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
      "Progress %": `${progress.toFixed(2)}%`,
      Remaining: remaining,
      "Start Date": format(new Date(goal.start_date), "yyyy-MM-dd"),
      "End Date": format(new Date(goal.end_date), "yyyy-MM-dd"),
      "Days Remaining": daysRemaining,
      Status: goal.status,
      Category: goal.category || "N/A",
    }
  })

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()

  worksheet["!cols"] = [
    { wch: 25 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
  ]

  XLSX.utils.book_append_sheet(workbook, worksheet, "Goals Progress")
  XLSX.writeFile(workbook, filename || `goals_${format(new Date(), "yyyy-MM-dd")}.xlsx`)
}
