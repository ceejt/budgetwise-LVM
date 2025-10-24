export type UserType = "student" | "general"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  user_type: UserType
  university_email?: string | null
  currency?: string
  theme?: string
  tip_frequency?: string
  notifications_enabled?: boolean
  created_at: string
  updated_at: string
}

export type BudgetPeriod = "weekly" | "monthly" | "yearly"

export interface Category {
  id: string
  user_id: string
  name: string
  icon: string | null
  budget_amount: number
  color: string | null
  budget_period: BudgetPeriod
  description?: string | null
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface BudgetSpending {
  category_id: string
  user_id: string
  category_name: string
  icon: string | null
  color: string | null
  budget_amount: number
  budget_period: BudgetPeriod
  is_active: boolean
  spent_last_7_days: number
  spent_this_month: number
  spent_this_year: number
  spent_previous_7_days: number
  spent_last_month: number
  total_transactions: number
}

export type BudgetStatus = "ok" | "warning" | "critical" | "exceeded"

export interface BudgetInsight {
  category_id: string
  category_name: string
  status: BudgetStatus
  utilization_percentage: number
  amount_spent: number
  amount_remaining: number
  budget_amount: number
  period: BudgetPeriod
  comparison_text?: string // e.g., "↑15% vs last week"
  suggestion?: string // e.g., "Consider reducing Entertainment budget"
}

export type RecurrencePattern = "daily" | "weekly" | "biweekly" | "monthly" | "yearly"

export interface Transaction {
  id: string
  user_id: string
  type: "income" | "expense"
  amount: number
  category_id: string | null
  category_name: string | null
  description: string | null
  date: string
  created_at: string
  // Wallet integration fields
  wallet_id?: string | null
  is_transfer?: boolean
  linked_transaction_id?: string | null
  // Recurring transaction fields
  is_recurring?: boolean
  recurrence_pattern?: RecurrencePattern | null
  recurrence_end_date?: string | null
  parent_transaction_id?: string | null
  is_template?: boolean
  next_occurrence_date?: string | null
  recurrence_enabled?: boolean
}

export interface Goal {
  id: string
  user_id: string
  name: string
  type: "weekly" | "monthly" | "custom"
  target_amount: number
  current_amount: number
  start_date: string
  end_date: string
  status: "active" | "completed" | "failed" | "paused"
  category?: string | null
  auto_contribution_amount?: number | null
  auto_contribution_frequency?: "daily" | "weekly" | "monthly" | null
  paused?: boolean
  archived?: boolean
  completed_at?: string | null
  created_at: string
  updated_at?: string
}

export interface FinancialTip {
  id: string
  user_id: string
  tip_text: string
  tip_type: "saving" | "spending" | "income" | "general"
  is_read: boolean
  created_at: string
}

export interface EWallet {
  id: string
  user_id: string
  wallet_type: "gcash" | "maya" | "other"
  account_number: string
  account_name: string | null
  balance: number
  is_primary: boolean
  created_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  theme: "light" | "dark"
  currency: string
  tip_frequency: "daily" | "weekly" | "never"
  notifications_enabled: boolean
  created_at: string
  updated_at: string
}

export interface CalendarTask {
  id: string
  user_id: string
  title: string
  date: string
  completed: boolean
  created_at: string
}

export interface Wallet {
  id: string
  user_id: string
  provider: "gcash" | "maya"
  account_number: string
  account_name: string
  balance: number
  is_primary: boolean
  created_at: string
}

// Transaction filtering and sorting types
export type SortField = "date" | "amount" | "category"
export type SortOrder = "asc" | "desc"

export interface TransactionFilters {
  dateFrom?: string | null
  dateTo?: string | null
  categoryIds?: string[]
  amountMin?: number | null
  amountMax?: number | null
  walletIds?: string[]
  searchQuery?: string | null
}

export interface TransactionSort {
  field: SortField
  order: SortOrder
}

export interface FilterPreset {
  id: string
  user_id: string
  name: string
  filters: TransactionFilters
  sort?: TransactionSort
  created_at: string
  updated_at: string
}
