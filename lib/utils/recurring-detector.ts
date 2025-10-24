import type { Transaction, RecurrencePattern } from "@/lib/types"

interface RecurringPattern {
  transactions: Transaction[]
  pattern: RecurrencePattern
  confidence: number
  suggestedDescription: string
  averageAmount: number
  category?: string
}

/**
 * Detects potential recurring transactions in a user's transaction history
 * Uses pattern matching to identify transactions with similar amounts, categories, and intervals
 */
export class RecurringDetector {
  private readonly MIN_OCCURRENCES = 3 // Minimum number of similar transactions to consider a pattern
  private readonly AMOUNT_TOLERANCE = 0.05 // 5% tolerance for amount matching
  private readonly DATE_TOLERANCE_DAYS = 3 // Days of tolerance for interval matching

  /**
   * Analyze transactions and detect potential recurring patterns
   */
  detectPatterns(transactions: Transaction[]): RecurringPattern[] {
    const patterns: RecurringPattern[] = []

    // Sort transactions by date
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Group by similar characteristics
    const groups = this.groupSimilarTransactions(sortedTransactions)

    // Analyze each group for recurring patterns
    for (const group of groups) {
      if (group.length < this.MIN_OCCURRENCES) continue

      const detectedPattern = this.analyzeGroupForPattern(group)
      if (detectedPattern) {
        patterns.push(detectedPattern)
      }
    }

    // Sort by confidence
    return patterns.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Group transactions with similar amounts and categories
   */
  private groupSimilarTransactions(transactions: Transaction[]): Transaction[][] {
    const groups: Transaction[][] = []
    const processed = new Set<string>()

    for (const transaction of transactions) {
      if (processed.has(transaction.id)) continue

      const similarTransactions = transactions.filter((t) => {
        if (processed.has(t.id) || t.id === transaction.id) return false

        // Check if amounts are similar
        const amountDiff = Math.abs(t.amount - transaction.amount)
        const amountThreshold = transaction.amount * this.AMOUNT_TOLERANCE
        const amountMatch = amountDiff <= amountThreshold

        // Check if categories match
        const categoryMatch = t.category_id === transaction.category_id

        // Check if types match
        const typeMatch = t.type === transaction.type

        return amountMatch && categoryMatch && typeMatch
      })

      if (similarTransactions.length >= this.MIN_OCCURRENCES - 1) {
        const group = [transaction, ...similarTransactions]
        group.forEach((t) => processed.add(t.id))
        groups.push(group)
      }
    }

    return groups
  }

  /**
   * Analyze a group of similar transactions to detect recurring pattern
   */
  private analyzeGroupForPattern(transactions: Transaction[]): RecurringPattern | null {
    // Sort by date
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate intervals between transactions (in days)
    const intervals: number[] = []
    for (let i = 1; i < sorted.length; i++) {
      const diff = this.daysBetween(sorted[i - 1].date, sorted[i].date)
      intervals.push(diff)
    }

    // Determine the pattern type
    const patternResult = this.determinePattern(intervals)
    if (!patternResult) return null

    // Calculate confidence score
    const confidence = this.calculateConfidence(intervals, patternResult.pattern, sorted.length)

    // Calculate average amount
    const averageAmount = sorted.reduce((sum, t) => sum + t.amount, 0) / sorted.length

    return {
      transactions: sorted,
      pattern: patternResult.pattern,
      confidence,
      suggestedDescription: sorted[0].description || "Recurring transaction",
      averageAmount,
      category: sorted[0].category_name || undefined,
    }
  }

  /**
   * Determine the recurrence pattern from intervals
   */
  private determinePattern(intervals: number[]): { pattern: RecurrencePattern; expectedInterval: number } | null {
    const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length

    // Check for daily pattern (1 day ± tolerance)
    if (this.matchesInterval(avgInterval, 1, intervals)) {
      return { pattern: "daily", expectedInterval: 1 }
    }

    // Check for weekly pattern (7 days ± tolerance)
    if (this.matchesInterval(avgInterval, 7, intervals)) {
      return { pattern: "weekly", expectedInterval: 7 }
    }

    // Check for biweekly pattern (14 days ± tolerance)
    if (this.matchesInterval(avgInterval, 14, intervals)) {
      return { pattern: "biweekly", expectedInterval: 14 }
    }

    // Check for monthly pattern (28-31 days)
    if (avgInterval >= 28 && avgInterval <= 31) {
      const monthlyMatch = intervals.every((i) => i >= 28 - this.DATE_TOLERANCE_DAYS && i <= 31 + this.DATE_TOLERANCE_DAYS)
      if (monthlyMatch) {
        return { pattern: "monthly", expectedInterval: 30 }
      }
    }

    // Check for yearly pattern (365 days ± tolerance)
    if (this.matchesInterval(avgInterval, 365, intervals, 10)) {
      return { pattern: "yearly", expectedInterval: 365 }
    }

    return null
  }

  /**
   * Check if intervals match expected pattern
   */
  private matchesInterval(
    avgInterval: number,
    expected: number,
    intervals: number[],
    tolerance?: number
  ): boolean {
    const actualTolerance = tolerance || this.DATE_TOLERANCE_DAYS
    const withinRange = Math.abs(avgInterval - expected) <= actualTolerance

    if (!withinRange) return false

    // Check if most intervals are consistent
    const matchingIntervals = intervals.filter((i) => Math.abs(i - expected) <= actualTolerance)
    const consistencyRatio = matchingIntervals.length / intervals.length

    return consistencyRatio >= 0.7 // At least 70% of intervals should match
  }

  /**
   * Calculate confidence score (0-100)
   */
  private calculateConfidence(intervals: number[], pattern: RecurrencePattern, occurrences: number): number {
    let confidence = 50 // Base confidence

    // Boost confidence based on number of occurrences
    confidence += Math.min(occurrences * 5, 30) // Up to +30

    // Boost confidence based on interval consistency
    const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length
    const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length
    const standardDeviation = Math.sqrt(variance)
    const consistencyScore = Math.max(0, 20 - standardDeviation) // Up to +20

    confidence += consistencyScore

    return Math.min(Math.round(confidence), 100)
  }

  /**
   * Calculate days between two dates
   */
  private daysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const diffTime = Math.abs(d2.getTime() - d1.getTime())
    return Math.round(diffTime / (1000 * 60 * 60 * 24))
  }

  /**
   * Generate a human-readable suggestion message
   */
  static formatSuggestion(pattern: RecurringPattern): string {
    const amount = new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(pattern.averageAmount)

    const patternLabel = {
      daily: "daily",
      weekly: "every week",
      biweekly: "every 2 weeks",
      monthly: "every month",
      yearly: "every year",
    }[pattern.pattern]

    const description = pattern.suggestedDescription || "transaction"

    return `We noticed ${amount} ${patternLabel} for "${description}". Make this recurring? (${pattern.confidence}% confidence)`
  }
}

/**
 * Utility function to get recurring suggestions for a user
 */
export async function getRecurringSuggestions(
  userId: string,
  supabase: any
): Promise<RecurringPattern[]> {
  try {
    // Fetch user's transactions from the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_recurring", false) // Only look at non-recurring transactions
      .gte("date", sixMonthsAgo.toISOString().split("T")[0])
      .order("date", { ascending: true })

    if (error) throw error

    const detector = new RecurringDetector()
    return detector.detectPatterns(transactions || [])
  } catch (error) {
    console.error("Error getting recurring suggestions:", error)
    return []
  }
}
