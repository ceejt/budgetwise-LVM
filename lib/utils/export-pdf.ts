/**
 * PDF Export Utility
 *
 * Provides functions to export financial reports to PDF format
 * Uses jsPDF and jspdf-autotable for professional PDF generation
 */

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { Transaction, Category, Goal, Bill, MonthlyReportData } from "@/lib/types"
import { format } from "date-fns"

/**
 * Export transactions to PDF
 */
export function exportTransactionsToPDF(
  transactions: Transaction[],
  options?: {
    title?: string
    dateRange?: { from: string; to: string }
    includeMetadata?: boolean
  }
) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.text(options?.title || "Transaction Report", 14, 20)

  // Metadata
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generated on: ${format(new Date(), "MMMM dd, yyyy 'at' HH:mm")}`, 14, 28)

  if (options?.dateRange) {
    doc.text(
      `Period: ${format(new Date(options.dateRange.from), "MMM dd, yyyy")} - ${format(new Date(options.dateRange.to), "MMM dd, yyyy")}`,
      14,
      33
    )
  }

  // Summary stats
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)
  const netSavings = totalIncome - totalExpenses

  doc.setFontSize(11)
  doc.setTextColor(0)
  const startY = options?.dateRange ? 40 : 35
  doc.text(`Total Income: ₱${totalIncome.toFixed(2)}`, 14, startY)
  doc.text(`Total Expenses: ₱${totalExpenses.toFixed(2)}`, 14, startY + 5)
  doc.text(`Net Savings: ₱${netSavings.toFixed(2)}`, 14, startY + 10)

  // Transaction table
  const tableData = transactions.map((t) => [
    format(new Date(t.date), "MMM dd, yyyy"),
    t.type === "income" ? "Income" : "Expense",
    `₱${t.amount.toFixed(2)}`,
    t.category_name || "Uncategorized",
    t.description || "",
  ])

  autoTable(doc, {
    head: [["Date", "Type", "Amount", "Category", "Description"]],
    body: tableData,
    startY: startY + 15,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [79, 70, 229] }, // Indigo color
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 20 },
      2: { cellWidth: 25, halign: "right" },
      3: { cellWidth: 30 },
      4: { cellWidth: "auto" },
    },
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    )
  }

  doc.save(`transactions_${format(new Date(), "yyyy-MM-dd")}.pdf`)
}

/**
 * Export monthly summary report to PDF
 */
export function exportMonthlySummaryToPDF(data: MonthlyReportData) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(22)
  doc.text("Monthly Financial Summary", 14, 20)

  doc.setFontSize(12)
  doc.setTextColor(100)
  doc.text(data.period, 14, 28)
  doc.text(`Generated: ${format(new Date(), "MMMM dd, yyyy")}`, 14, 35)

  // Overview box
  doc.setDrawColor(79, 70, 229)
  doc.setLineWidth(0.5)
  doc.rect(14, 42, 182, 45)

  doc.setFontSize(14)
  doc.setTextColor(0)
  doc.text("Financial Overview", 20, 50)

  doc.setFontSize(11)
  doc.text(`Total Income:`, 20, 60)
  doc.text(`₱${data.total_income.toFixed(2)}`, 80, 60)

  doc.text(`Total Expenses:`, 20, 68)
  doc.text(`₱${data.total_expenses.toFixed(2)}`, 80, 68)

  doc.text(`Net Savings:`, 20, 76)
  // Set color: green if positive, red if negative
  if (data.net_savings >= 0) {
    doc.setTextColor(34, 197, 94) // Green
  } else {
    doc.setTextColor(239, 68, 68) // Red
  }
  doc.text(`₱${data.net_savings.toFixed(2)}`, 80, 76)

  doc.setTextColor(0)
  doc.text(`Savings Rate:`, 20, 84)
  doc.text(`${data.savings_rate.toFixed(2)}%`, 80, 84)

  // Top Expense Categories
  doc.setFontSize(14)
  doc.text("Top Expense Categories", 14, 97)

  const categoryTableData = data.top_expense_categories.map((cat) => [
    cat.category_name,
    `₱${cat.amount.toFixed(2)}`,
    `${cat.percentage.toFixed(1)}%`,
    cat.transaction_count.toString(),
  ])

  autoTable(doc, {
    head: [["Category", "Amount", "% of Total", "Transactions"]],
    body: categoryTableData,
    startY: 102,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [79, 70, 229] },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "center" },
    },
  })

  // Income Sources
  const finalY = (doc as any).lastAutoTable.finalY || 102
  doc.setFontSize(14)
  doc.text("Income Sources", 14, finalY + 15)

  const incomeTableData = data.income_sources.map((source) => [
    source.category_name,
    `₱${source.amount.toFixed(2)}`,
    `${source.percentage.toFixed(1)}%`,
  ])

  autoTable(doc, {
    head: [["Source", "Amount", "% of Total"]],
    body: incomeTableData,
    startY: finalY + 20,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [34, 197, 94] }, // Green for income
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
    },
  })

  // Goals Progress (if available)
  if (data.goals_progress && data.goals_progress.length > 0) {
    const goalsY = (doc as any).lastAutoTable.finalY || finalY + 20
    doc.setFontSize(14)
    doc.text("Goals Progress", 14, goalsY + 15)

    const goalsTableData = data.goals_progress.map((goal) => [
      goal.goal_name,
      `₱${goal.current_amount.toFixed(2)}`,
      `₱${goal.target_amount.toFixed(2)}`,
      `${goal.progress_percentage.toFixed(1)}%`,
    ])

    autoTable(doc, {
      head: [["Goal", "Current", "Target", "Progress"]],
      body: goalsTableData,
      startY: goalsY + 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [168, 85, 247] }, // Purple for goals
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
    })
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `BudgetWise Monthly Report - Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    )
  }

  doc.save(`monthly_summary_${format(new Date(), "yyyy-MM-dd")}.pdf`)
}

/**
 * Export category analysis to PDF
 */
export function exportCategoryAnalysisToPDF(
  categories: Array<{
    category_name: string
    total_spent: number
    transaction_count: number
    average_transaction: number
    budget_amount: number | null
    trend: "increasing" | "decreasing" | "stable"
  }>
) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.text("Category Spending Analysis", 14, 20)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generated on: ${format(new Date(), "MMMM dd, yyyy")}`, 14, 28)

  // Category table
  const tableData = categories.map((cat) => {
    const utilization = cat.budget_amount
      ? ((cat.total_spent / cat.budget_amount) * 100).toFixed(1)
      : "N/A"

    return [
      cat.category_name,
      `₱${cat.total_spent.toFixed(2)}`,
      cat.transaction_count.toString(),
      `₱${cat.average_transaction.toFixed(2)}`,
      cat.budget_amount ? `₱${cat.budget_amount.toFixed(2)}` : "No budget",
      utilization !== "N/A" ? `${utilization}%` : "N/A",
      cat.trend.charAt(0).toUpperCase() + cat.trend.slice(1),
    ]
  })

  autoTable(doc, {
    head: [["Category", "Total", "Count", "Avg", "Budget", "Usage %", "Trend"]],
    body: tableData,
    startY: 35,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [79, 70, 229] },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "center" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
      6: { halign: "center" },
    },
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    )
  }

  doc.save(`category_analysis_${format(new Date(), "yyyy-MM-dd")}.pdf`)
}

/**
 * Export goals progress to PDF
 */
export function exportGoalsToPDF(goals: Goal[]) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.text("Goals Progress Report", 14, 20)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generated on: ${format(new Date(), "MMMM dd, yyyy")}`, 14, 28)

  // Goals table
  const tableData = goals.map((goal) => {
    const progress = (goal.current_amount / goal.target_amount) * 100
    const remaining = goal.target_amount - goal.current_amount
    const daysRemaining = Math.ceil(
      (new Date(goal.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )

    return [
      goal.name,
      `₱${goal.current_amount.toFixed(2)}`,
      `₱${goal.target_amount.toFixed(2)}`,
      `${progress.toFixed(1)}%`,
      `₱${remaining.toFixed(2)}`,
      format(new Date(goal.end_date), "MMM dd, yyyy"),
      daysRemaining > 0 ? `${daysRemaining} days` : "Overdue",
      goal.status.charAt(0).toUpperCase() + goal.status.slice(1),
    ]
  })

  autoTable(doc, {
    head: [["Goal", "Current", "Target", "Progress", "Remaining", "Due Date", "Time Left", "Status"]],
    body: tableData,
    startY: 35,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [168, 85, 247] },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { halign: "right", cellWidth: 22 },
      2: { halign: "right", cellWidth: 22 },
      3: { halign: "right", cellWidth: 18 },
      4: { halign: "right", cellWidth: 22 },
      5: { cellWidth: 24 },
      6: { halign: "center", cellWidth: 18 },
      7: { halign: "center", cellWidth: 18 },
    },
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    )
  }

  doc.save(`goals_${format(new Date(), "yyyy-MM-dd")}.pdf`)
}

/**
 * Export bills to PDF
 */
export function exportBillsToPDF(bills: Bill[]) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.text("Bills Report", 14, 20)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generated on: ${format(new Date(), "MMMM dd, yyyy")}`, 14, 28)

  // Bills table
  const tableData = bills.map((bill) => [
    bill.name,
    `₱${bill.amount.toFixed(2)}`,
    format(new Date(bill.due_date), "MMM dd, yyyy"),
    bill.status.charAt(0).toUpperCase() + bill.status.slice(1),
    bill.category_name || "N/A",
    bill.is_recurring ? "Yes" : "No",
    bill.last_paid_date ? format(new Date(bill.last_paid_date), "MMM dd") : "Never",
  ])

  autoTable(doc, {
    head: [["Bill", "Amount", "Due Date", "Status", "Category", "Recurring", "Last Paid"]],
    body: tableData,
    startY: 35,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [239, 68, 68] }, // Red for bills
    columnStyles: {
      1: { halign: "right" },
      3: { halign: "center" },
      5: { halign: "center" },
    },
  })

  // Summary
  const finalY = (doc as any).lastAutoTable.finalY || 35
  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0)
  const paidCount = bills.filter((b) => b.status === "paid").length
  const unpaidCount = bills.filter((b) => b.status === "unpaid").length
  const overdueCount = bills.filter((b) => b.status === "overdue").length

  doc.setFontSize(12)
  doc.setTextColor(0)
  doc.text("Summary:", 14, finalY + 15)
  doc.setFontSize(10)
  doc.text(`Total Amount: ₱${totalAmount.toFixed(2)}`, 14, finalY + 22)
  doc.text(`Paid: ${paidCount} | Unpaid: ${unpaidCount} | Overdue: ${overdueCount}`, 14, finalY + 28)

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    )
  }

  doc.save(`bills_${format(new Date(), "yyyy-MM-dd")}.pdf`)
}
