// Re-export all analytics utilities from their respective modules
// This maintains backward compatibility while allowing tree-shaking

export {
  type Period,
  type PeriodData,
  getPeriodRange,
  getPreviousPeriodRange,
  filterTransactionsByPeriod,
} from "./period-utils"

export {
  type SpendingInsights,
  calculateSpendingInsights,
} from "./spending-insights"

export {
  type TrendComparison,
  calculateTrendComparison,
} from "./trend-comparison"

export {
  type AvailableToSpend,
  calculateAvailableToSpend,
} from "./available-to-spend"

export {
  type DailySpendingData,
  getDailySpendingData,
  getCategoryComparison,
} from "./chart-data"
