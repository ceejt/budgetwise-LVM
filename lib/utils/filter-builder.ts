import type { SupabaseClient } from "@supabase/supabase-js"
import type { TransactionFilters, TransactionSort } from "@/lib/types"

/**
 * Builds a dynamic Supabase query with filters and sorting applied
 * @param supabase - The Supabase client
 * @param userId - The user ID to filter by
 * @param transactionType - "income" or "expense"
 * @param filters - Optional filter criteria
 * @param sort - Optional sort configuration
 * @param limit - Optional result limit
 * @returns A configured Supabase query builder
 */
export function buildTransactionQuery(
  supabase: SupabaseClient,
  userId: string,
  transactionType: "income" | "expense",
  filters?: TransactionFilters | null,
  sort?: TransactionSort | null,
  limit?: number
) {
  // Start with base query
  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .eq("type", transactionType)

  // Apply date range filters
  if (filters?.dateFrom) {
    query = query.gte("date", filters.dateFrom)
  }
  if (filters?.dateTo) {
    query = query.lte("date", filters.dateTo)
  }

  // Apply category filters
  if (filters?.categoryIds && filters.categoryIds.length > 0) {
    query = query.in("category_id", filters.categoryIds)
  }

  // Apply amount range filters
  if (filters?.amountMin !== null && filters?.amountMin !== undefined) {
    query = query.gte("amount", filters.amountMin)
  }
  if (filters?.amountMax !== null && filters?.amountMax !== undefined) {
    query = query.lte("amount", filters.amountMax)
  }

  // Apply wallet filters
  if (filters?.walletIds && filters.walletIds.length > 0) {
    query = query.in("wallet_id", filters.walletIds)
  }

  // Apply search query (searches in description)
  if (filters?.searchQuery && filters.searchQuery.trim()) {
    query = query.ilike("description", `%${filters.searchQuery.trim()}%`)
  }

  // Apply sorting
  if (sort) {
    switch (sort.field) {
      case "date":
        query = query.order("date", { ascending: sort.order === "asc" })
        break
      case "amount":
        query = query.order("amount", { ascending: sort.order === "asc" })
        break
      case "category":
        query = query.order("category_name", { ascending: sort.order === "asc" })
        break
    }
  } else {
    // Default sorting: most recent first
    query = query.order("date", { ascending: false })
  }

  // Apply limit if provided
  if (limit) {
    query = query.limit(limit)
  }

  return query
}

/**
 * Counts how many active filters are applied
 * @param filters - The filters object
 * @returns Number of active filters
 */
export function countActiveFilters(filters: TransactionFilters | null): number {
  if (!filters) return 0

  let count = 0
  if (filters.dateFrom) count++
  if (filters.dateTo) count++
  if (filters.categoryIds && filters.categoryIds.length > 0) count++
  if (filters.amountMin !== null && filters.amountMin !== undefined) count++
  if (filters.amountMax !== null && filters.amountMax !== undefined) count++
  if (filters.walletIds && filters.walletIds.length > 0) count++
  if (filters.searchQuery && filters.searchQuery.trim()) count++

  return count
}

/**
 * Creates a human-readable description of active filters
 * @param filters - The filters object
 * @returns Array of filter descriptions
 */
export function getFilterDescriptions(filters: TransactionFilters | null): string[] {
  if (!filters) return []

  const descriptions: string[] = []

  if (filters.dateFrom && filters.dateTo) {
    descriptions.push(`Date: ${filters.dateFrom} to ${filters.dateTo}`)
  } else if (filters.dateFrom) {
    descriptions.push(`Date from: ${filters.dateFrom}`)
  } else if (filters.dateTo) {
    descriptions.push(`Date to: ${filters.dateTo}`)
  }

  if (filters.categoryIds && filters.categoryIds.length > 0) {
    descriptions.push(`Categories: ${filters.categoryIds.length} selected`)
  }

  if (filters.amountMin !== null && filters.amountMin !== undefined && filters.amountMax !== null && filters.amountMax !== undefined) {
    descriptions.push(`Amount: ₱${filters.amountMin} - ₱${filters.amountMax}`)
  } else if (filters.amountMin !== null && filters.amountMin !== undefined) {
    descriptions.push(`Amount min: ₱${filters.amountMin}`)
  } else if (filters.amountMax !== null && filters.amountMax !== undefined) {
    descriptions.push(`Amount max: ₱${filters.amountMax}`)
  }

  if (filters.walletIds && filters.walletIds.length > 0) {
    descriptions.push(`Wallets: ${filters.walletIds.length} selected`)
  }

  if (filters.searchQuery && filters.searchQuery.trim()) {
    descriptions.push(`Search: "${filters.searchQuery}"`)
  }

  return descriptions
}

/**
 * Predefined date range presets
 */
export const DATE_PRESETS = {
  today: {
    label: "Today",
    getRange: () => {
      const today = new Date().toISOString().split("T")[0]
      return { dateFrom: today, dateTo: today }
    },
  },
  last7Days: {
    label: "Last 7 Days",
    getRange: () => {
      const today = new Date()
      const last7Days = new Date(today)
      last7Days.setDate(today.getDate() - 7)
      return {
        dateFrom: last7Days.toISOString().split("T")[0],
        dateTo: today.toISOString().split("T")[0],
      }
    },
  },
  thisMonth: {
    label: "This Month",
    getRange: () => {
      const today = new Date()
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      return {
        dateFrom: firstDay.toISOString().split("T")[0],
        dateTo: today.toISOString().split("T")[0],
      }
    },
  },
  lastMonth: {
    label: "Last Month",
    getRange: () => {
      const today = new Date()
      const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      return {
        dateFrom: firstDayLastMonth.toISOString().split("T")[0],
        dateTo: lastDayLastMonth.toISOString().split("T")[0],
      }
    },
  },
  thisYear: {
    label: "This Year",
    getRange: () => {
      const today = new Date()
      const firstDay = new Date(today.getFullYear(), 0, 1)
      return {
        dateFrom: firstDay.toISOString().split("T")[0],
        dateTo: today.toISOString().split("T")[0],
      }
    },
  },
}
