"use client"

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { DailySpendingData } from "@/lib/utils/analytics"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface SpendingTrendChartProps {
  data: DailySpendingData[]
  periodLabel: string
  trend?: {
    percentageChange: number
    trend: "up" | "down" | "stable"
  }
}

export function SpendingTrendChart({ data, periodLabel, trend }: SpendingTrendChartProps) {
  // Format data for the chart
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: item.amount,
    fullDate: item.date
  }))

  // Calculate max value for better scaling
  const maxAmount = Math.max(...data.map(d => d.amount), 100)

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold" style={{ color: "#293F55" }}>
            Spending Trend
          </h3>
          <div className="text-sm text-gray-500 mt-1">{periodLabel}</div>
        </div>

        {trend && (
          <div className="flex items-center gap-2">
            {trend.trend === "up" && (
              <div className="flex items-center gap-1 text-red-500">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-semibold">
                  {Math.abs(trend.percentageChange).toFixed(1)}%
                </span>
              </div>
            )}
            {trend.trend === "down" && (
              <div className="flex items-center gap-1 text-green-500">
                <TrendingDown className="w-5 h-5" />
                <span className="text-sm font-semibold">
                  {Math.abs(trend.percentageChange).toFixed(1)}%
                </span>
              </div>
            )}
            {trend.trend === "stable" && (
              <div className="flex items-center gap-1 text-gray-500">
                <Minus className="w-5 h-5" />
                <span className="text-sm font-semibold">Stable</span>
              </div>
            )}
          </div>
        )}
      </div>

      {trend && (
        <div className="mb-4 text-sm text-gray-600">
          {trend.trend === "up" && (
            <span className="text-red-600">
              Spending increased by {Math.abs(trend.percentageChange).toFixed(1)}% compared to previous period
            </span>
          )}
          {trend.trend === "down" && (
            <span className="text-green-600">
              Spending decreased by {Math.abs(trend.percentageChange).toFixed(1)}% compared to previous period
            </span>
          )}
          {trend.trend === "stable" && (
            <span>Spending is stable compared to previous period</span>
          )}
        </div>
      )}

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              stroke="#999"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#666' }}
            />
            <YAxis
              stroke="#999"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#666' }}
              tickFormatter={(value) => `₱${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number) => [`₱${value.toFixed(2)}`, 'Spending']}
              labelStyle={{ color: '#293F55', fontWeight: 'bold' }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#72ADFD"
              strokeWidth={3}
              dot={{ fill: '#72ADFD', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#293F55' }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No spending data available</p>
          </div>
        </div>
      )}
    </div>
  )
}

interface CategoryComparisonChartProps {
  data: Array<{
    category: string
    currentAmount: number
    previousAmount: number
    change: number
  }>
  periodLabel: string
}

export function CategoryComparisonChart({ data, periodLabel }: CategoryComparisonChartProps) {
  // Take top 5 categories
  const topCategories = data.slice(0, 5)

  const chartData = topCategories.map(item => ({
    category: item.category.length > 10 ? item.category.substring(0, 10) + '...' : item.category,
    current: item.currentAmount,
    previous: item.previousAmount
  }))

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-xl font-semibold" style={{ color: "#293F55" }}>
          Category Comparison
        </h3>
        <div className="text-sm text-gray-500 mt-1">Current vs Previous {periodLabel}</div>
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="category"
              stroke="#999"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#666' }}
            />
            <YAxis
              stroke="#999"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#666' }}
              tickFormatter={(value) => `₱${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number) => `₱${value.toFixed(2)}`}
              labelStyle={{ color: '#293F55', fontWeight: 'bold' }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <Bar dataKey="current" fill="#72ADFD" name="Current Period" radius={[8, 8, 0, 0]} />
            <Bar dataKey="previous" fill="#A8D5FF" name="Previous Period" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <BarChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No category data available</p>
          </div>
        </div>
      )}
    </div>
  )
}
