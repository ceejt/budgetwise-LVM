"use client"

import { Wallet, TrendingUp, Target, Calendar, AlertCircle } from "lucide-react"
import type { AvailableToSpend } from "@/lib/utils/analytics"

interface AvailableToSpendCardProps {
  data: AvailableToSpend
  periodLabel: string
}

export function AvailableToSpendCard({ data, periodLabel }: AvailableToSpendCardProps) {
  const isPositive = data.amount >= 0
  const isHealthy = data.dailyAmount >= 0

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold" style={{ color: "#293F55" }}>
          Available to Spend
        </h3>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: isPositive ? "#72ADFD" : "#FF6B6B" }}
        >
          <Wallet className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-4">{periodLabel}</div>

      {/* Main amount */}
      <div className="text-center mb-6">
        <div className="text-sm text-gray-500 mb-2">You can spend</div>
        <div
          className="text-4xl font-bold mb-2"
          style={{ color: isPositive ? "#293F55" : "#FF6B6B" }}
        >
          ₱{Math.abs(data.amount).toFixed(2)}
        </div>
        {!isPositive && (
          <div className="flex items-center justify-center gap-2 text-sm text-red-500">
            <AlertCircle className="w-4 h-4" />
            <span>Overspending detected</span>
          </div>
        )}
      </div>

      {/* Daily amount */}
      <div
        className="rounded-2xl p-4 mb-4"
        style={{
          backgroundColor: isHealthy ? "#E8F5E9" : "#FFEBEE",
          border: `2px solid ${isHealthy ? "#72ADFD" : "#FF6B6B"}`
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" style={{ color: isHealthy ? "#72ADFD" : "#FF6B6B" }} />
            <div>
              <div className="text-sm font-medium" style={{ color: "#293F55" }}>
                Per Day
              </div>
              <div className="text-xs text-gray-500">{data.daysRemaining} days remaining</div>
            </div>
          </div>
          <div className="text-right">
            <div
              className="text-2xl font-bold"
              style={{ color: isHealthy ? "#293F55" : "#FF6B6B" }}
            >
              ₱{Math.abs(data.dailyAmount).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        <div className="text-sm font-semibold mb-2" style={{ color: "#293F55" }}>
          Breakdown
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#4CAF50" }} />
            <span className="text-sm text-gray-600">Total Income</span>
          </div>
          <span className="text-sm font-semibold" style={{ color: "#293F55" }}>
            ₱{data.breakdown.totalIncome.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#FF6B6B" }} />
            <span className="text-sm text-gray-600">Total Expenses</span>
          </div>
          <span className="text-sm font-semibold text-red-600">
            -₱{data.breakdown.totalExpenses.toFixed(2)}
          </span>
        </div>

        {data.breakdown.goalAllocations > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#72ADFD" }} />
              <span className="text-sm text-gray-600">Goal Savings</span>
            </div>
            <span className="text-sm font-semibold text-blue-600">
              -₱{data.breakdown.goalAllocations.toFixed(2)}
            </span>
          </div>
        )}

        {data.breakdown.upcomingBills > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#FFA726" }} />
              <span className="text-sm text-gray-600">Upcoming Bills</span>
            </div>
            <span className="text-sm font-semibold text-orange-600">
              -₱{data.breakdown.upcomingBills.toFixed(2)}
            </span>
          </div>
        )}

        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: "#293F55" }}>
              Available
            </span>
            <span
              className="text-lg font-bold"
              style={{ color: isPositive ? "#4CAF50" : "#FF6B6B" }}
            >
              ₱{data.amount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Tips */}
      {isHealthy && data.dailyAmount > 0 && (
        <div className="mt-4 p-3 rounded-2xl" style={{ backgroundColor: "#E8F5E9" }}>
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 mt-0.5" style={{ color: "#4CAF50" }} />
            <div className="text-xs text-gray-600">
              Great job! You have a healthy spending budget. Try to stay within your daily limit.
            </div>
          </div>
        </div>
      )}

      {!isHealthy && (
        <div className="mt-4 p-3 rounded-2xl" style={{ backgroundColor: "#FFEBEE" }}>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: "#FF6B6B" }} />
            <div className="text-xs text-gray-600">
              You've exceeded your budget. Consider reviewing your expenses and cutting back on non-essentials.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
