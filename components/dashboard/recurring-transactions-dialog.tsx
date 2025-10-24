"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { Transaction } from "@/lib/types"
import { Repeat, Pause, Play, Trash2, Edit, Calendar } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RecurringTransactionsDialogProps {
  userId: string
  onSuccess: () => void
}

export function RecurringTransactionsDialog({ userId, onSuccess }: RecurringTransactionsDialogProps) {
  const [open, setOpen] = useState(false)
  const [recurringTransactions, setRecurringTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchRecurringTransactions()
    }
  }, [open])

  const fetchRecurringTransactions = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .eq("is_recurring", true)
        .eq("is_template", true)
        .order("created_at", { ascending: false })

      if (error) throw error
      setRecurringTransactions(data || [])
    } catch (error) {
      console.error("Error fetching recurring transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRecurrence = async (transactionId: string, currentlyEnabled: boolean) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ recurrence_enabled: !currentlyEnabled })
        .eq("id", transactionId)

      if (error) throw error
      await fetchRecurringTransactions()
      onSuccess()
    } catch (error) {
      console.error("Error toggling recurrence:", error)
    }
  }

  const deleteRecurring = async (transactionId: string) => {
    if (!confirm("Are you sure you want to delete this recurring transaction? This will also delete all future occurrences.")) {
      return
    }

    try {
      const { error } = await supabase.from("transactions").delete().eq("id", transactionId)

      if (error) throw error
      await fetchRecurringTransactions()
      onSuccess()
    } catch (error) {
      console.error("Error deleting recurring transaction:", error)
    }
  }

  const getRecurrenceLabel = (pattern: string | null | undefined): string => {
    if (!pattern) return "Unknown"
    const labels: Record<string, string> = {
      daily: "Daily",
      weekly: "Weekly",
      biweekly: "Every 2 weeks",
      monthly: "Monthly",
      yearly: "Yearly",
    }
    return labels[pattern] || pattern
  }

  const getOccurrenceCount = async (parentId: string): Promise<number> => {
    const { count } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("parent_transaction_id", parentId)

    return count || 0
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Repeat className="h-4 w-4" />
          Manage Recurring
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recurring Transactions</DialogTitle>
          <DialogDescription>
            Manage your recurring income and expenses. Pause, resume, or delete recurring transactions.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : recurringTransactions.length === 0 ? (
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              No recurring transactions yet. Create one by checking "This is a recurring transaction" when adding income or expenses.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {recurringTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 border rounded-lg space-y-3"
                style={{
                  backgroundColor: transaction.recurrence_enabled ? "#FFFFFF" : "#F5F5F5",
                  opacity: transaction.recurrence_enabled ? 1 : 0.6,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{transaction.description || "Untitled"}</h4>
                      <Badge variant={transaction.type === "income" ? "default" : "destructive"}>
                        {transaction.type}
                      </Badge>
                      {!transaction.recurrence_enabled && (
                        <Badge variant="outline" className="bg-gray-200">
                          Paused
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        <strong>Amount:</strong> {formatCurrency(transaction.amount)}
                      </p>
                      {transaction.category_name && (
                        <p>
                          <strong>Category:</strong> {transaction.category_name}
                        </p>
                      )}
                      <p>
                        <strong>Frequency:</strong> {getRecurrenceLabel(transaction.recurrence_pattern)}
                      </p>
                      {transaction.next_occurrence_date && (
                        <p>
                          <strong>Next occurrence:</strong>{" "}
                          {new Date(transaction.next_occurrence_date).toLocaleDateString()}
                        </p>
                      )}
                      {transaction.recurrence_end_date && (
                        <p>
                          <strong>Ends on:</strong> {new Date(transaction.recurrence_end_date).toLocaleDateString()}
                        </p>
                      )}
                      <p>
                        <strong>Started:</strong> {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleRecurrence(transaction.id, transaction.recurrence_enabled || false)}
                      className="gap-2"
                    >
                      {transaction.recurrence_enabled ? (
                        <>
                          <Pause className="h-4 w-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Resume
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteRecurring(transaction.id)}
                      className="gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
