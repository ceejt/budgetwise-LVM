"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Transaction } from "@/lib/types"
import { AddTransactionDialog } from "./add-transaction-dialog"
import { EditTransactionDialog } from "./edit-transaction-dialog"

interface ExpensesSectionProps {
  userId: string
}

export function ExpensesSection({ userId }: ExpensesSectionProps) {
  const [expenses, setExpenses] = useState<Transaction[]>([])
  const [showAll, setShowAll] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchExpenses()
  }, [userId])

  const fetchExpenses = async () => {
    const query = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "expense")
      .order("date", { ascending: false })

    if (!showAll) {
      query.limit(5)
    }

    const { data } = await query

    if (data) setExpenses(data)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return

    const { error } = await supabase.from("transactions").delete().eq("id", id)

    if (!error) {
      fetchExpenses()
    }
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: "#293F55" }}>
            Expenses
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: "#E0E0E0", color: "#293F55" }}>
                Date: Recent
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <AddTransactionDialog userId={userId} type="expense" onSuccess={fetchExpenses} />
          <Button
            size="sm"
            className="rounded-full text-white"
            style={{ backgroundColor: "#72ADFD" }}
            onClick={() => {
              setShowAll(!showAll)
              setTimeout(fetchExpenses, 0)
            }}
          >
            {showAll ? "Show Less" : "All Items"}
          </Button>
        </div>
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
