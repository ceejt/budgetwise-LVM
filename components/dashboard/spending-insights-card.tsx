"use client"

import { TrendingUp, TrendingDown, Minus, ShoppingBag, Calendar, Receipt } from "lucide-react"
import type { SpendingInsights } from "@/lib/utils/analytics"

interface SpendingInsightsCardProps {
  insights: SpendingInsights
  periodLabel: string
}

export function SpendingInsightsCard({ insights, periodLabel }: SpendingInsightsCardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-4" style={{ color: "#293F55" }}>
        Spending Insights
      </h3>
      <div className="text-sm text-gray-500 mb-4">{periodLabel}</div>

      <div className="space-y-4">
        {/* Top Spending Category */}
        {insights.topCategory && (
          <div className="flex items-start gap-3 p-3 rounded-2xl" style={{ backgroundColor: "#F5F5F5" }}>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#72ADFD" }}
            >
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium" style={{ color: "#293F55" }}>
                Top Category
              </div>
              <div className="text-xs text-gray-500 truncate">{insights.topCategory.name}</div>
              <div className="text-lg font-bold mt-1" style={{ color: "#293F55" }}>
                ₱{insights.topCategory.amount.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Average Daily Spending */}
        <div className="flex items-start gap-3 p-3 rounded-2xl" style={{ backgroundColor: "#F5F5F5" }}>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#293F55" }}
          >
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium" style={{ color: "#293F55" }}>
              Daily Average
            </div>
            <div className="text-xs text-gray-500">Average spending per day</div>
            <div className="text-lg font-bold mt-1" style={{ color: "#293F55" }}>
              ₱{insights.averageDailySpending.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Largest Single Expense */}
        {insights.largestExpense && (
          <div className="flex items-start gap-3 p-3 rounded-2xl" style={{ backgroundColor: "#F5F5F5" }}>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#FF6B6B" }}
            >
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium" style={{ color: "#293F55" }}>
                Largest Expense
              </div>
              <div className="text-xs text-gray-500 truncate">{insights.largestExpense.description}</div>
              <div className="text-lg font-bold mt-1" style={{ color: "#293F55" }}>
                ₱{insights.largestExpense.amount.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Most Frequent Category */}
        {insights.mostFrequentCategory && (
          <div className="flex items-start gap-3 p-3 rounded-2xl" style={{ backgroundColor: "#F5F5F5" }}>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#A8D5FF" }}
            >
              <ShoppingBag className="w-5 h-5" style={{ color: "#293F55" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium" style={{ color: "#293F55" }}>
                Most Frequent
              </div>
              <div className="text-xs text-gray-500 truncate">{insights.mostFrequentCategory.name}</div>
              <div className="text-lg font-bold mt-1" style={{ color: "#293F55" }}>
                {insights.mostFrequentCategory.count} transactions
              </div>
            </div>
          </div>
        )}

        {/* No data state */}
        {!insights.topCategory && !insights.largestExpense && !insights.mostFrequentCategory && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <ShoppingBag className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-sm text-gray-500">No spending data available for this period</p>
          </div>
        )}
      </div>
    </div>
  )
}
