"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Transaction, TransactionFilters, TransactionSort, ExportFormat } from "@/lib/types"
import { AddTransactionDialog } from "./add-transaction-dialog"
import { EditTransactionDialog } from "./edit-transaction-dialog"
import { RecurringTransactionsDialog } from "./recurring-transactions-dialog"
import { TransactionFiltersComponent } from "./transaction-filters"
import { ExportDialog } from "./export-dialog"
import { buildTransactionQuery } from "@/lib/utils/filter-builder"
import { exportTransactionsToCSV } from "@/lib/utils/export-csv"
import { exportTransactionsToExcel } from "@/lib/utils/export-xlsx"
import { exportTransactionsToPDF } from "@/lib/utils/export-pdf"
import { format } from "date-fns"

interface ExpensesSectionProps {
  userId: string
}

export function ExpensesSection({ userId }: ExpensesSectionProps) {
  const [expenses, setExpenses] = useState<Transaction[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [filters, setFilters] = useState<TransactionFilters>({
    dateFrom: null,
    dateTo: null,
    categoryIds: [],
    amountMin: null,
    amountMax: null,
    walletIds: [],
    searchQuery: null,
  })
  const [sort, setSort] = useState<TransactionSort>({
    field: "date",
    order: "desc",
  })
  const supabase = createClient()

  useEffect(() => {
    fetchExpenses()
    fetchTotalCount()
  }, [userId, filters, sort, showAll])

  const fetchExpenses = async () => {
    const query = buildTransactionQuery(supabase, userId, "expense", filters, sort, showAll ? undefined : 5)

    const { data } = await query

    if (data) setExpenses(data)
  }

  const fetchTotalCount = async () => {
    const { count } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("type", "expense")

    if (count !== null) setTotalCount(count)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return

    const { error } = await supabase.from("transactions").delete().eq("id", id)

    if (!error) {
      fetchExpenses()
    }
  }

  const handleExport = async (
    exportFormat: ExportFormat,
    options: { includeFilters?: boolean; includeMetadata?: boolean }
  ) => {
    // Fetch all expenses (or filtered) for export
    const exportQuery = buildTransactionQuery(
      supabase,
      userId,
      "expense",
      options.includeFilters ? filters : {},
      sort,
      undefined // No limit for export
    )

    const { data } = await exportQuery
    if (!data || data.length === 0) {
      alert("No expenses to export")
      return
    }

    const filename = `expenses_${format(new Date(), "yyyy-MM-dd")}`

    // Export based on format
    switch (exportFormat) {
      case "csv":
        exportTransactionsToCSV(data, filename)
        break
      case "xlsx":
        exportTransactionsToExcel(data, filename)
        break
      case "pdf":
        const dateRange = filters.dateFrom && filters.dateTo
          ? { from: filters.dateFrom, to: filters.dateTo }
          : undefined
        exportTransactionsToPDF(data, {
          title: "Expense Report",
          dateRange,
          includeMetadata: options.includeMetadata,
        })
        break
    }
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: "#293F55" }}>
            Expenses
          </h2>
        </div>
        <div className="flex gap-2">
          <ExportDialog onExport={handleExport} exportType="transactions" />
          <RecurringTransactionsDialog userId={userId} onSuccess={fetchExpenses} />
          <AddTransactionDialog userId={userId} type="expense" onSuccess={fetchExpenses} />
          <Button
            size="sm"
            className="rounded-full text-white"
            style={{ backgroundColor: "#72ADFD" }}
            onClick={() => {
              setShowAll(!showAll)
            }}
          >
            {showAll ? "Show Less" : "All Items"}
          </Button>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="mb-4">
        <TransactionFiltersComponent
          userId={userId}
          filters={filters}
          sort={sort}
          onFiltersChange={setFilters}
          onSortChange={setSort}
          totalCount={totalCount}
          filteredCount={expenses.length}
        />
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-5 gap-4 mb-4">
        <div className="px-4 py-3 rounded-xl text-center font-medium text-white" style={{ backgroundColor: "#72ADFD" }}>
          Item
        </div>
        <div className="px-4 py-3 rounded-xl text-center font-medium text-white" style={{ backgroundColor: "#72ADFD" }}>
          Category
        </div>
        <div className="px-4 py-3 rounded-xl text-center font-medium text-white" style={{ backgroundColor: "#72ADFD" }}>
          Date
        </div>
        <div className="px-4 py-3 rounded-xl text-center font-medium text-white" style={{ backgroundColor: "#72ADFD" }}>
          Amount
        </div>
        <div className="px-4 py-3 rounded-xl text-center font-medium text-white" style={{ backgroundColor: "#72ADFD" }}>
          Actions
        </div>
      </div>

      {/* Table Rows */}
      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No expenses yet. Add your first expense above!</div>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className="grid grid-cols-5 gap-4 items-center">
              <div className="px-4 py-4 rounded-xl truncate" style={{ backgroundColor: "#F5F5F5", color: "#293F55" }}>
                {expense.description || "Expense"}
              </div>
              <div className="px-4 py-4 rounded-xl truncate" style={{ backgroundColor: "#F5F5F5", color: "#293F55" }}>
                {expense.category_name || "Uncategorized"}
              </div>
              <div className="px-4 py-4 rounded-xl" style={{ backgroundColor: "#F5F5F5", color: "#293F55" }}>
                {new Date(expense.date).toLocaleDateString()}
              </div>
              <div className="px-4 py-4 rounded-xl" style={{ backgroundColor: "#F5F5F5", color: "#293F55" }}>
                ₱{expense.amount.toFixed(2)}
              </div>
              <div className="px-4 py-4 rounded-xl flex gap-2 justify-center" style={{ backgroundColor: "#F5F5F5" }}>
                <button
                  onClick={() => setEditingTransaction(expense)}
                  className="p-1 hover:bg-gray-200 rounded"
                  style={{ color: "#72ADFD" }}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                  style={{ color: "#EF4444" }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          userId={userId}
          onSuccess={() => {
            setEditingTransaction(null)
            fetchExpenses()
          }}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  )
}
