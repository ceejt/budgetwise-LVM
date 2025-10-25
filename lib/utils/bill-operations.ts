/**
 * Bill Operations Utility
 * Provides functions for bill management, smart matching, and analytics
 */

import { createClient } from "@/lib/supabase/client"
import type {
  Bill,
  UpcomingBill,
  BillAnalytics,
  BillMatchResult,
  Transaction,
  RecurrencePattern,
} from "@/lib/types"

const supabase = createClient()

/**
 * Fetch all bills for the current user
 */
export async function fetchBills(): Promise<Bill[]> {
  const { data, error } = await supabase
    .from("bills")
    .select(`
      *,
      category:categories(name, icon, color)
    `)
    .order("due_date", { ascending: true })

  if (error) {
    console.error("Error fetching bills:", error)
    throw error
  }

  return (data || []).map((bill) => ({
    ...bill,
    category_name: bill.category?.name || null,
    category_icon: bill.category?.icon || null,
    category_color: bill.category?.color || null,
  }))
}

/**
 * Fetch upcoming bills with reminder information
 */
export async function fetchUpcomingBills(): Promise<UpcomingBill[]> {
  const { data, error } = await supabase
    .from("upcoming_bills_view")
    .select("*")
    .order("due_date", { ascending: true })

  if (error) {
    console.error("Error fetching upcoming bills:", error)
    throw error
  }

  return data || []
}

/**
 * Fetch bills that need reminders (within reminder window)
 */
export async function fetchBillsNeedingReminders(): Promise<UpcomingBill[]> {
  const { data, error } = await supabase
    .from("upcoming_bills_view")
    .select("*")
    .eq("should_show_reminder", true)
    .order("due_date", { ascending: true })

  if (error) {
    console.error("Error fetching bills needing reminders:", error)
    throw error
  }

  return data || []
}

/**
 * Fetch overdue bills
 */
export async function fetchOverdueBills(): Promise<UpcomingBill[]> {
  const { data, error } = await supabase
    .from("upcoming_bills_view")
    .select("*")
    .eq("is_overdue", true)
    .order("due_date", { ascending: true })

  if (error) {
    console.error("Error fetching overdue bills:", error)
    throw error
  }

  return data || []
}

/**
 * Fetch bill analytics for the current user
 */
export async function fetchBillAnalytics(): Promise<BillAnalytics | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from("bill_analytics_view")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) {
    console.error("Error fetching bill analytics:", error)
    return null
  }

  // Return default analytics if user has no bills yet
  if (!data) {
    return {
      user_id: user.id,
      monthly_bills_count: 0,
      monthly_bills_total: 0,
      recurring_bills_count: 0,
      paid_count: 0,
      unpaid_count: 0,
      overdue_count: 0,
      max_bill_amount: 0,
      most_expensive_bill: null,
      on_time_payment_rate: 0,
    }
  }

  return data
}

/**
 * Create a new bill
 */
export async function createBill(
  billData: Omit<Bill, "id" | "user_id" | "created_at" | "updated_at" | "payment_count">
): Promise<Bill> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("bills")
    .insert({
      user_id: user.id,
      ...billData,
      payment_count: 0,
    })
    .select(`
      *,
      category:categories(name, icon, color)
    `)
    .single()

  if (error) {
    console.error("Error creating bill:", error)
    throw error
  }

  return {
    ...data,
    category_name: data.category?.name || null,
    category_icon: data.category?.icon || null,
    category_color: data.category?.color || null,
  }
}

/**
 * Update a bill
 */
export async function updateBill(
  billId: string,
  updates: Partial<Omit<Bill, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<Bill> {
  const { data, error } = await supabase
    .from("bills")
    .update(updates)
    .eq("id", billId)
    .select(`
      *,
      category:categories(name, icon, color)
    `)
    .single()

  if (error) {
    console.error("Error updating bill:", error)
    throw error
  }

  return {
    ...data,
    category_name: data.category?.name || null,
    category_icon: data.category?.icon || null,
    category_color: data.category?.color || null,
  }
}

/**
 * Delete a bill
 */
export async function deleteBill(billId: string): Promise<void> {
  const { error } = await supabase.from("bills").delete().eq("id", billId)

  if (error) {
    console.error("Error deleting bill:", error)
    throw error
  }
}

/**
 * Mark a bill as paid and optionally link to a transaction
 */
export async function markBillAsPaid(
  billId: string,
  transactionId?: string
): Promise<void> {
  const { error } = await supabase.rpc("mark_bill_as_paid", {
    p_bill_id: billId,
    p_transaction_id: transactionId || null,
  })

  if (error) {
    console.error("Error marking bill as paid:", error)
    throw error
  }
}

/**
 * Calculate match score between a bill and a transaction
 */
export async function calculateBillMatchScore(
  billId: string,
  transactionId: string
): Promise<number> {
  const { data, error } = await supabase.rpc("calculate_bill_match_score", {
    p_bill_id: billId,
    p_transaction_id: transactionId,
  })

  if (error) {
    console.error("Error calculating match score:", error)
    return 0
  }

  return data || 0
}

/**
 * Find potential matching bills for a transaction
 */
export async function findMatchingBills(
  transaction: Transaction
): Promise<BillMatchResult[]> {
  // Fetch unpaid bills
  const { data: bills, error } = await supabase
    .from("bills")
    .select("*")
    .eq("status", "unpaid")

  if (error || !bills) {
    console.error("Error fetching bills for matching:", error)
    return []
  }

  // Calculate match scores for each bill
  const matches: BillMatchResult[] = []

  for (const bill of bills) {
    const score = await calculateBillMatchScore(bill.id, transaction.id)

    if (score > 0) {
      matches.push({
        transaction_id: transaction.id,
        bill_id: bill.id,
        confidence_score: score,
        match_level: score >= 70 ? "high" : score >= 50 ? "medium" : "low",
      })
    }
  }

  // Sort by confidence score (highest first)
  return matches.sort((a, b) => b.confidence_score - a.confidence_score)
}

/**
 * Auto-match transactions to bills based on smart matching
 */
export async function autoMatchTransactionsToBills(): Promise<{
  matched: number
  suggestions: BillMatchResult[]
}> {
  // Fetch recent unlinked expense transactions (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: transactions, error: txError } = await supabase
    .from("transactions")
    .select("*")
    .eq("type", "expense")
    .is("linked_transaction_id", null)
    .gte("date", thirtyDaysAgo.toISOString())

  if (txError || !transactions) {
    console.error("Error fetching transactions:", txError)
    return { matched: 0, suggestions: [] }
  }

  let matchedCount = 0
  const suggestions: BillMatchResult[] = []

  for (const transaction of transactions) {
    const matches = await findMatchingBills(transaction)

    if (matches.length > 0 && matches[0].match_level === "high") {
      // Auto-match high confidence matches
      await markBillAsPaid(matches[0].bill_id, transaction.id)
      matchedCount++
    } else if (matches.length > 0 && matches[0].confidence_score >= 50) {
      // Add medium confidence matches as suggestions
      suggestions.push(matches[0])
    }
  }

  return { matched: matchedCount, suggestions }
}

/**
 * Update overdue bill statuses
 */
export async function updateOverdueBills(): Promise<void> {
  const { error } = await supabase.rpc("update_overdue_bills")

  if (error) {
    console.error("Error updating overdue bills:", error)
    throw error
  }
}

/**
 * Calculate next due date based on recurrence pattern
 */
export function calculateNextDueDate(
  currentDueDate: string,
  pattern: RecurrencePattern
): string {
  const date = new Date(currentDueDate)

  switch (pattern) {
    case "daily":
      date.setDate(date.getDate() + 1)
      break
    case "weekly":
      date.setDate(date.getDate() + 7)
      break
    case "biweekly":
      date.setDate(date.getDate() + 14)
      break
    case "monthly":
      date.setMonth(date.getMonth() + 1)
      break
    case "yearly":
      date.setFullYear(date.getFullYear() + 1)
      break
  }

  return date.toISOString().split("T")[0]
}

/**
 * Get bills due in the next N days
 */
export async function getBillsDueInDays(days: number): Promise<UpcomingBill[]> {
  const today = new Date()
  const futureDate = new Date()
  futureDate.setDate(today.getDate() + days)

  const { data, error } = await supabase
    .from("upcoming_bills_view")
    .select("*")
    .gte("due_date", today.toISOString().split("T")[0])
    .lte("due_date", futureDate.toISOString().split("T")[0])
    .order("due_date", { ascending: true })

  if (error) {
    console.error("Error fetching bills due in days:", error)
    throw error
  }

  return data || []
}

/**
 * Format bill status for display
 */
export function formatBillStatus(bill: UpcomingBill): {
  label: string
  variant: "default" | "secondary" | "destructive" | "outline"
  color: string
} {
  if (bill.is_overdue) {
    return {
      label: "Overdue",
      variant: "destructive",
      color: "text-red-600",
    }
  }

  if (bill.status === "paid") {
    return {
      label: "Paid",
      variant: "secondary",
      color: "text-green-600",
    }
  }

  if (bill.days_until_due === 0) {
    return {
      label: "Due Today",
      variant: "destructive",
      color: "text-orange-600",
    }
  }

  if (bill.days_until_due <= 3) {
    return {
      label: `Due in ${bill.days_until_due} day${bill.days_until_due > 1 ? "s" : ""}`,
      variant: "outline",
      color: "text-orange-500",
    }
  }

  return {
    label: `Due in ${bill.days_until_due} days`,
    variant: "default",
    color: "text-muted-foreground",
  }
}

/**
 * Calculate total monthly bill obligations
 */
export function calculateMonthlyBillTotal(bills: Bill[]): number {
  return bills
    .filter((bill) => bill.is_recurring && bill.recurrence_pattern === "monthly")
    .reduce((sum, bill) => sum + bill.amount, 0)
}
