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

// Bill tracking and reminder types
export type BillStatus = "unpaid" | "paid" | "overdue" | "scheduled"

export interface Bill {
  id: string
  user_id: string
  name: string
  amount: number
  due_date: string // ISO date string
  category_id: string | null
  category_name?: string | null
  category_icon?: string | null
  category_color?: string | null
  status: BillStatus

  // Recurrence settings
  is_recurring: boolean
  recurrence_pattern?: RecurrencePattern | null
  recurrence_end_date?: string | null

  // Reminder settings
  reminder_days_before: number
  reminder_enabled: boolean

  // Auto-payment settings
  auto_pay_enabled: boolean
  wallet_id?: string | null

  // Matching and tracking
  linked_transaction_id?: string | null
  last_paid_date?: string | null
  payment_count: number

  // Notes and metadata
  notes?: string | null
  merchant_name?: string | null

  created_at: string
  updated_at: string
}

export interface UpcomingBill extends Bill {
  days_until_due: number
  reminder_date: string
  should_show_reminder: boolean
  is_overdue: boolean
}

export interface BillAnalytics {
  user_id: string
  monthly_bills_count: number
  monthly_bills_total: number
  recurring_bills_count: number
  paid_count: number
  unpaid_count: number
  overdue_count: number
  max_bill_amount: number
  most_expensive_bill: string | null
  on_time_payment_rate: number
}

export interface BillMatchResult {
  transaction_id: string
  bill_id: string
  confidence_score: number // 0-100
  match_level: "high" | "medium" | "low" // >70, 50-70, <50
}

// Export and reporting types
export type ExportFormat = "csv" | "xlsx" | "pdf"
export type ReportType = "monthly_summary" | "category_analysis" | "goal_progress" | "tax_report" | "transactions"
export type ReportPeriod = "today" | "this_week" | "this_month" | "last_month" | "this_year" | "last_year" | "custom"

export interface ExportOptions {
  format: ExportFormat
  includeFilters?: boolean
  dateRange?: {
    from: string
    to: string
  }
  categories?: string[]
  includeMetadata?: boolean
}

export interface ReportOptions {
  type: ReportType
  period: ReportPeriod
  customDateRange?: {
    from: string
    to: string
  }
  categories?: string[]
  includeCharts?: boolean
  includeInsights?: boolean
}

export interface ExportPreset {
  id: string
  user_id: string
  name: string
  description?: string | null
  report_type: ReportType
  format: ExportFormat
  options: ReportOptions
  is_scheduled?: boolean
  schedule_frequency?: "daily" | "weekly" | "monthly" | null
  created_at: string
  updated_at: string
}

export interface MonthlyReportData {
  period: string
  total_income: number
  total_expenses: number
  net_savings: number
  savings_rate: number
  top_expense_categories: Array<{
    category_name: string
    amount: number
    percentage: number
    transaction_count: number
  }>
  income_sources: Array<{
    category_name: string
    amount: number
    percentage: number
  }>
  goals_progress: Array<{
    goal_name: string
    target_amount: number
    current_amount: number
    progress_percentage: number
  }>
}

export interface CategoryAnalysisData {
  category_name: string
  total_spent: number
  transaction_count: number
  average_transaction: number
  budget_amount: number | null
  utilization_percentage: number | null
  trend: "increasing" | "decreasing" | "stable"
  monthly_breakdown: Array<{
    month: string
    amount: number
  }>
}
