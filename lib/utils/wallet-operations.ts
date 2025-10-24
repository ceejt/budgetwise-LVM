import { createClient } from "@/lib/supabase/client"
import type { EWallet, Transaction } from "@/lib/types"

/**
 * Wallet Operations Utility
 * Handles all wallet-related operations including:
 * - Cash In/Out
 * - Wallet transfers
 * - Balance calculations
 * - Transaction history filtering
 */

export interface CashInOutParams {
  userId: string
  walletId: string
  amount: number
  description?: string
  date?: string
  type: "cash-in" | "cash-out"
}

export interface WalletTransferParams {
  userId: string
  fromWalletId: string
  toWalletId: string
  amount: number
  description?: string
  date?: string
}

export interface WalletBalanceHistory {
  date: string
  balance: number
  transaction: Transaction
}

/**
 * Create a cash-in transaction (adds money to wallet)
 */
export async function cashIn(params: Omit<CashInOutParams, "type">) {
  const supabase = createClient()
  const { userId, walletId, amount, description, date } = params

  const transactionData: any = {
    user_id: userId,
    wallet_id: walletId,
    type: "income",
    amount,
    description: description || "Cash In",
    date: date || new Date().toISOString().split("T")[0],
    category_name: "Cash In",
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert(transactionData)
    .select()
    .single()

  if (error) throw error

  // Balance is automatically updated by database trigger
  return data as Transaction
}

/**
 * Create a cash-out transaction (removes money from wallet)
 */
export async function cashOut(params: Omit<CashInOutParams, "type">) {
  const supabase = createClient()
  const { userId, walletId, amount, description, date } = params

  const transactionData: any = {
    user_id: userId,
    wallet_id: walletId,
    type: "expense",
    amount,
    description: description || "Cash Out",
    date: date || new Date().toISOString().split("T")[0],
    category_name: "Cash Out",
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert(transactionData)
    .select()
    .single()

  if (error) throw error

  // Balance is automatically updated by database trigger
  return data as Transaction
}

/**
 * Transfer money between two wallets
 * Creates two linked transactions: expense from source, income to destination
 */
export async function transferBetweenWallets(params: WalletTransferParams) {
  const supabase = createClient()
  const { userId, fromWalletId, toWalletId, amount, description, date } = params

  // Validate wallets exist and belong to user
  const { data: wallets, error: walletError } = await supabase
    .from("e_wallets")
    .select("id")
    .in("id", [fromWalletId, toWalletId])
    .eq("user_id", userId)

  if (walletError) throw walletError
  if (!wallets || wallets.length !== 2) {
    throw new Error("Invalid wallet IDs or wallets don't belong to user")
  }

  // Use the database function to create linked transfer transactions
  const { data, error } = await supabase.rpc("create_wallet_transfer", {
    p_user_id: userId,
    p_from_wallet_id: fromWalletId,
    p_to_wallet_id: toWalletId,
    p_amount: amount,
    p_description: description || "Wallet Transfer",
    p_date: date || new Date().toISOString().split("T")[0],
  })

  if (error) throw error

  return data
}

/**
 * Get all transactions for a specific wallet
 */
export async function getWalletTransactions(
  userId: string,
  walletId: string,
  options?: {
    startDate?: string
    endDate?: string
    limit?: number
  }
) {
  const supabase = createClient()
  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .eq("wallet_id", walletId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (options?.startDate) {
    query = query.gte("date", options.startDate)
  }

  if (options?.endDate) {
    query = query.lte("date", options.endDate)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Transaction[]
}

/**
 * Get wallet balance history over time
 */
export async function getWalletBalanceHistory(
  userId: string,
  walletId: string,
  options?: {
    startDate?: string
    endDate?: string
  }
): Promise<WalletBalanceHistory[]> {
  const transactions = await getWalletTransactions(userId, walletId, options)

  let runningBalance = 0
  const history: WalletBalanceHistory[] = []

  // Process transactions in chronological order
  const sortedTransactions = [...transactions].reverse()

  for (const transaction of sortedTransactions) {
    if (transaction.type === "income") {
      runningBalance += Number(transaction.amount)
    } else if (transaction.type === "expense") {
      runningBalance -= Number(transaction.amount)
    }

    history.push({
      date: transaction.date,
      balance: runningBalance,
      transaction,
    })
  }

  // Return in reverse chronological order (most recent first)
  return history.reverse()
}

/**
 * Recalculate wallet balance from all transactions
 * Useful for fixing discrepancies
 */
export async function recalculateWalletBalance(walletId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("recalculate_wallet_balance", {
    p_wallet_id: walletId,
  })

  if (error) throw error
  return data as number
}

/**
 * Get all wallets for a user
 */
export async function getUserWallets(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("e_wallets")
    .select("*")
    .eq("user_id", userId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true })

  if (error) throw error
  return data as EWallet[]
}

/**
 * Get primary wallet for a user
 */
export async function getPrimaryWallet(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("e_wallets")
    .select("*")
    .eq("user_id", userId)
    .eq("is_primary", true)
    .single()

  if (error) {
    // If no primary wallet found, return the first wallet
    const { data: wallets } = await supabase
      .from("e_wallets")
      .select("*")
      .eq("user_id", userId)
      .limit(1)
      .single()

    return wallets as EWallet | null
  }

  return data as EWallet
}

/**
 * Set a wallet as primary
 */
export async function setPrimaryWallet(userId: string, walletId: string) {
  const supabase = createClient()

  // First, remove primary status from all wallets
  await supabase
    .from("e_wallets")
    .update({ is_primary: false })
    .eq("user_id", userId)

  // Then set the specified wallet as primary
  const { data, error } = await supabase
    .from("e_wallets")
    .update({ is_primary: true })
    .eq("id", walletId)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) throw error
  return data as EWallet
}

/**
 * Get wallet spending by category
 */
export async function getWalletSpendingByCategory(
  userId: string,
  walletId: string,
  options?: {
    startDate?: string
    endDate?: string
  }
) {
  const transactions = await getWalletTransactions(userId, walletId, options)

  const expenses = transactions.filter((t) => t.type === "expense")

  const categoryTotals = expenses.reduce(
    (acc, transaction) => {
      const category = transaction.category_name || "Uncategorized"
      acc[category] = (acc[category] || 0) + Number(transaction.amount)
      return acc
    },
    {} as Record<string, number>
  )

  return Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)
}

/**
 * Calculate total income and expenses for a wallet
 */
export async function getWalletSummary(
  userId: string,
  walletId: string,
  options?: {
    startDate?: string
    endDate?: string
  }
) {
  const transactions = await getWalletTransactions(userId, walletId, options)

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return {
    income,
    expenses,
    netIncome: income - expenses,
    transactionCount: transactions.length,
  }
}
