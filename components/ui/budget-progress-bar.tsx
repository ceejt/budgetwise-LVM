/**
 * Budget Progress Bar Component
 *
 * Displays a visual progress bar showing budget utilization with color coding
 * based on spending percentage. Includes labels, tooltips, and status indicators.
 *
 * Features:
 * - Color-coded progress (green, yellow, orange, red)
 * - Animated transitions
 * - Percentage and amount display
 * - Status indicators
 * - Responsive design
 */

import { cn } from "@/lib/utils"
import type { BudgetStatus } from "@/lib/types"
import { getProgressColor, getStatusColor, formatCurrency } from "@/lib/utils/budget-calculator"
import { AlertCircle, TrendingDown, TrendingUp, CheckCircle } from "lucide-react"

interface BudgetProgressBarProps {
  spent: number
  budget: number
  utilization: number
  status: BudgetStatus
  categoryName?: string
  showLabels?: boolean
  showPercentage?: boolean
  showAmounts?: boolean
  showStatusIcon?: boolean
  comparisonText?: string
  className?: string
  height?: "sm" | "md" | "lg"
}

export function BudgetProgressBar({
  spent,
  budget,
  utilization,
  status,
  categoryName,
  showLabels = true,
  showPercentage = true,
  showAmounts = true,
  showStatusIcon = false,
  comparisonText,
  className,
  height = "md",
}: BudgetProgressBarProps) {
  const progressColor = getProgressColor(utilization)
  const statusColor = getStatusColor(status)
  const remaining = budget - spent
  const isOverBudget = utilization >= 100

  const heightClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  }

  const getStatusIcon = () => {
    switch (status) {
      case "ok":
        return <CheckCircle className="h-4 w-4" style={{ color: statusColor }} />
      case "warning":
        return <AlertCircle className="h-4 w-4" style={{ color: statusColor }} />
      case "critical":
        return <TrendingUp className="h-4 w-4" style={{ color: statusColor }} />
      case "exceeded":
        return <AlertCircle className="h-4 w-4 fill-current" style={{ color: statusColor }} />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "ok":
        return "On Track"
      case "warning":
        return "Approaching Limit"
      case "critical":
        return "Critical"
      case "exceeded":
        return "Over Budget"
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header with category name and status */}
      {showLabels && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {categoryName && (
              <span className="font-medium text-gray-700">{categoryName}</span>
            )}
            {showStatusIcon && (
              <div className="flex items-center gap-1">
                {getStatusIcon()}
                <span className="text-xs" style={{ color: statusColor }}>
                  {getStatusText()}
                </span>
              </div>
            )}
          </div>
          {showPercentage && (
            <span
              className="font-semibold tabular-nums"
              style={{ color: progressColor }}
            >
              {utilization.toFixed(1)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative">
        <div
          className={cn(
            "w-full bg-gray-200 rounded-full overflow-hidden",
            heightClasses[height]
          )}
        >
          <div
            className={cn(
              "rounded-full transition-all duration-500 ease-out",
              heightClasses[height]
            )}
            style={{
              width: `${Math.min(utilization, 100)}%`,
              backgroundColor: progressColor,
            }}
            role="progressbar"
            aria-valuenow={utilization}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Budget utilization: ${utilization.toFixed(1)}%`}
          />
        </div>

        {/* Overflow indicator for over-budget */}
        {isOverBudget && (
          <div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white animate-pulse"
            style={{ backgroundColor: "#ef4444" }}
            title="Over budget"
          />
        )}
      </div>

      {/* Amount Details */}
      {showAmounts && (
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-3">
            <span>
              Spent: <span className="font-semibold text-gray-900">{formatCurrency(spent)}</span>
            </span>
            {!isOverBudget && (
              <span>
                Left: <span className="font-semibold" style={{ color: progressColor }}>
                  {formatCurrency(remaining)}
                </span>
              </span>
            )}
            {isOverBudget && (
              <span>
                Over: <span className="font-semibold text-red-600">
                  {formatCurrency(Math.abs(remaining))}
                </span>
              </span>
            )}
          </div>
          <span className="text-gray-500">
            Budget: {formatCurrency(budget)}
          </span>
        </div>
      )}

      {/* Comparison Text */}
      {comparisonText && (
        <div className="flex items-center gap-1 text-xs text-gray-600">
          {comparisonText.startsWith("↑") ? (
            <TrendingUp className="h-3 w-3 text-red-500" />
          ) : comparisonText.startsWith("↓") ? (
            <TrendingDown className="h-3 w-3 text-green-500" />
          ) : null}
          <span>{comparisonText}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Compact version for use in smaller spaces (cards, sidebars)
 */
export function BudgetProgressBarCompact({
  spent,
  budget,
  utilization,
  status,
  categoryName,
  className,
}: Pick<BudgetProgressBarProps, "spent" | "budget" | "utilization" | "status" | "categoryName" | "className">) {
  const progressColor = getProgressColor(utilization)

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-xs">
        {categoryName && <span className="font-medium text-gray-700 truncate">{categoryName}</span>}
        <span className="font-semibold tabular-nums ml-2" style={{ color: progressColor }}>
          {utilization.toFixed(0)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(utilization, 100)}%`,
            backgroundColor: progressColor,
          }}
        />
      </div>
    </div>
  )
}

/**
 * Circular progress indicator for dashboard cards
 */
interface CircularBudgetProgressProps {
  utilization: number
  status: BudgetStatus
  size?: number
  strokeWidth?: number
  showPercentage?: boolean
}

export function CircularBudgetProgress({
  utilization,
  status,
  size = 80,
  strokeWidth = 8,
  showPercentage = true,
}: CircularBudgetProgressProps) {
  const progressColor = getProgressColor(utilization)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(utilization, 100) / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: progressColor }}
          >
            {utilization.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  )
}
