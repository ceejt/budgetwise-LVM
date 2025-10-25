"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { createClient } from "@/lib/supabase/client"
import type { Transaction, Goal, EWallet } from "@/lib/types"
import { SpendingInsightsCard } from "./spending-insights-card"
import { AvailableToSpendCard } from "./available-to-spend-card"
import { BudgetInsightsCard } from "./budget-insights-card"
import { SpendingTrendChart, CategoryComparisonChart } from "./spending-trend-chart"
import {
  type Period,
  getPeriodRange,
  getPreviousPeriodRange,
  filterTransactionsByPeriod,
  calculateSpendingInsights,
  calculateTrendComparison,
  calculateAvailableToSpend,
  getDailySpendingData,
  getCategoryComparison
} from "@/lib/utils/analytics"

// Lazy load dialogs - only loaded when user interacts
const AddWalletDialog = dynamic(
  () => import("./add-wallet-dialog").then((mod) => ({ default: mod.AddWalletDialog })),
  { ssr: false }
)
const EditWalletDialog = dynamic(
  () => import("./edit-wallet-dialog").then((mod) => ({ default: mod.EditWalletDialog })),
  { ssr: false }
)
const CashInOutDialog = dynamic(
  () => import("./cash-in-out-dialog").then((mod) => ({ default: mod.CashInOutDialog })),
  { ssr: false }
)
const WalletTransferDialog = dynamic(
  () => import("./wallet-transfer-dialog").then((mod) => ({ default: mod.WalletTransferDialog })),
  { ssr: false }
)

interface SummarySectionProps {
  userId: string
}

export function SummarySection({ userId }: SummarySectionProps) {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [wallets, setWallets] = useState<EWallet[]>([])
  const [period, setPeriod] = useState<Period>("monthly")
  const [editingWallet, setEditingWallet] = useState<EWallet | null>(null)
  const [cashInOutDialog, setCashInOutDialog] = useState<{
    open: boolean
    type: "cash-in" | "cash-out"
  }>({
    open: false,
    type: "cash-in",
  })
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    // Fetch all transactions (both income and expenses)
    const { data: transactionData } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })

    const { data: goalData } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")

    const { data: walletData } = await supabase
      .from("e_wallets")
      .select("*")
      .eq("user_id", userId)

    if (transactionData) setAllTransactions(transactionData)
    if (goalData) setGoals(goalData)
    if (walletData) setWallets(walletData)
  }

  // Get period ranges
  const currentPeriodRange = getPeriodRange(period)
  const previousPeriodRange = getPreviousPeriodRange(period)

  // Filter transactions by period
  const currentPeriodTransactions = filterTransactionsByPeriod(
    allTransactions,
    currentPeriodRange.startDate,
    currentPeriodRange.endDate
  )

  const previousPeriodTransactions = filterTransactionsByPeriod(
    allTransactions,
    previousPeriodRange.startDate,
    previousPeriodRange.endDate
  )

  // Split into income and expenses
  const currentExpenses = currentPeriodTransactions.filter(t => t.type === "expense")
  const currentIncome = currentPeriodTransactions.filter(t => t.type === "income")
  const previousExpenses = previousPeriodTransactions.filter(t => t.type === "expense")

  // Calculate analytics
  const spendingInsights = calculateSpendingInsights(currentExpenses, currentIncome)
  const trendComparison = calculateTrendComparison(currentExpenses, previousExpenses)
  const availableToSpend = calculateAvailableToSpend(currentIncome, currentExpenses, goals, period)
  const dailySpendingData = getDailySpendingData(
    currentExpenses,
    currentPeriodRange.startDate,
    currentPeriodRange.endDate
  )
  const categoryComparison = getCategoryComparison(currentExpenses, previousExpenses)

  // Calculate category totals for pie chart
  const categoryTotals = currentExpenses.reduce(
    (acc, curr) => {
      const cat = curr.category_name || "Other"
      acc[cat] = (acc[cat] || 0) + Number(curr.amount)
      return acc
    },
    {} as Record<string, number>,
  )

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)

  const colors = ["#72ADFD", "#293F55", "#A8D5FF", "#1E2A3A"]

  const primaryWallet = wallets.find((w) => w.is_primary) || wallets[0]

  // Check if user has scholarship-type income
  const hasScholarship = currentIncome.some(
    t => t.category_name?.toLowerCase().includes("scholarship") ||
         t.description?.toLowerCase().includes("scholarship")
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Card with Period Filter */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold" style={{ color: "#293F55" }}>
            Summary
          </h2>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="px-3 py-1 rounded-full text-sm text-white"
            style={{ backgroundColor: "#72ADFD" }}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="text-sm text-gray-500 mb-4">{currentPeriodRange.label}</div>

        <div className="text-center mb-6">
          <div className="text-4xl font-bold mb-2" style={{ color: "#293F55" }}>
            ₱{spendingInsights.totalExpenses.toFixed(0)}
          </div>
          <div className="text-sm text-gray-500 mb-4">Total Expenses</div>

          {/* Trend indicator */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {trendComparison.trend === "up" && (
              <span className="text-sm text-red-600">
                ↑ {Math.abs(trendComparison.percentageChange).toFixed(1)}% vs previous {period}
              </span>
            )}
            {trendComparison.trend === "down" && (
              <span className="text-sm text-green-600">
                ↓ {Math.abs(trendComparison.percentageChange).toFixed(1)}% vs previous {period}
              </span>
            )}
            {trendComparison.trend === "stable" && (
              <span className="text-sm text-gray-500">
                Stable compared to previous {period}
              </span>
            )}
          </div>

          {topCategories.length > 0 && (
            <div className="relative w-48 h-48 mx-auto">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {topCategories.map((_, index) => {
                  const total = topCategories.reduce((sum, [, val]) => sum + val, 0)
                  let offset = 0
                  return topCategories.slice(0, index + 1).map(([cat, val], i) => {
                    const percent = (val / total) * 100
                    const strokeDasharray = `${percent} ${100 - percent}`
                    const currentOffset = offset
                    if (i < index) offset += percent

                    return i === index ? (
                      <circle
                        key={cat}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={colors[i]}
                        strokeWidth="20"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={-currentOffset}
                      />
                    ) : null
                  })
                })}
                <circle cx="50" cy="50" r="30" fill="white" />
              </svg>
            </div>
          )}
        </div>

        {topCategories.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {topCategories.map(([category, amount], index) => (
              <div key={category} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index] }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 truncate">{category}</div>
                  <div className="text-sm font-semibold" style={{ color: "#293F55" }}>
                    ₱{amount.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 text-sm">
            No expenses recorded for this period
          </div>
        )}
      </div>

      {/* Available to Spend Card */}
      <AvailableToSpendCard
        data={availableToSpend}
        periodLabel={currentPeriodRange.label}
      />

      {/* Budget Insights Card */}
      <BudgetInsightsCard userId={userId} />

      {/* Spending Insights Card */}
      <SpendingInsightsCard
        insights={spendingInsights}
        periodLabel={currentPeriodRange.label}
      />

      {/* Spending Trend Chart */}
      <SpendingTrendChart
        data={dailySpendingData}
        periodLabel={currentPeriodRange.label}
        trend={trendComparison}
      />

      {/* Category Comparison Chart */}
      {categoryComparison.length > 0 && (
        <CategoryComparisonChart
          data={categoryComparison}
          periodLabel={period}
        />
      )}

      {/* Scholarship Card - Only show if user has scholarship income */}
      {hasScholarship && goals.length > 0 && goals[0].name.toLowerCase().includes("scholarship") && (
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold" style={{ color: "#293F55" }}>
              {goals[0].name}
            </h3>
            <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: "#72ADFD" }}>
              Active
            </span>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-2">Goal Progress</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${Math.min((goals[0].current_amount / goals[0].target_amount) * 100, 100)}%`,
                  backgroundColor: "#72ADFD"
                }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">₱{goals[0].current_amount.toFixed(2)}</span>
              <span className="text-gray-600">₱{goals[0].target_amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Find scholarship income */}
          {(() => {
            const scholarshipIncome = currentIncome.find(
              t => t.category_name?.toLowerCase().includes("scholarship") ||
                   t.description?.toLowerCase().includes("scholarship")
            )

            return scholarshipIncome ? (
              <div className="rounded-2xl p-4" style={{ backgroundColor: "#F5F5F5" }}>
                <div className="text-sm font-medium mb-1" style={{ color: "#293F55" }}>
                  Recent Scholarship Income
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {new Date(scholarshipIncome.date).toLocaleDateString()}
                </div>
                <div className="text-2xl font-bold" style={{ color: "#72ADFD" }}>
                  ₱{Number(scholarshipIncome.amount).toFixed(2)}
                </div>
                {scholarshipIncome.description && (
                  <div className="text-xs text-gray-600 mt-2">
                    {scholarshipIncome.description}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-4">
                No scholarship income recorded this period
              </div>
            )
          })()}
        </div>
      )}

      {/* E-Wallet Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold" style={{ color: "#293F55" }}>
            E-Wallet
          </h3>
          <div className="flex gap-2">
            {wallets.length >= 2 && <WalletTransferDialog userId={userId} onSuccess={fetchData} />}
            {wallets.length === 0 && <AddWalletDialog userId={userId} onSuccess={fetchData} />}
          </div>
        </div>
        {primaryWallet ? (
          <>
            <div
              className="rounded-2xl p-4 mb-4"
              style={{
                backgroundColor: primaryWallet.wallet_type === "gcash" ? "#007DFF" : "#00B14F",
                color: "white",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">{primaryWallet.wallet_type.toUpperCase()}</span>
                <span className="text-2xl font-bold">{primaryWallet.wallet_type === "gcash" ? "GCash" : "Maya"}</span>
              </div>
              <div className="text-lg mb-4">{primaryWallet.account_number}</div>
              <div className="text-xs mb-3">{primaryWallet.account_name || "User"}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCashInOutDialog({ open: true, type: "cash-in" })}
                  className="px-4 py-1 rounded-full text-xs bg-white transition-opacity hover:opacity-80"
                  style={{ color: "#007DFF" }}
                >
                  Cash In
                </button>
                <button
                  onClick={() => setCashInOutDialog({ open: true, type: "cash-out" })}
                  className="px-4 py-1 rounded-full text-xs bg-white transition-opacity hover:opacity-80"
                  style={{ color: "#007DFF" }}
                >
                  Cash Out
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Balance</div>
                <div className="text-xl font-bold" style={{ color: "#293F55" }}>
                  ₱ {primaryWallet.balance.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Wallets</div>
                <div className="text-xl font-bold" style={{ color: "#293F55" }}>
                  {wallets.length}
                </div>
              </div>
              <button onClick={() => setEditingWallet(primaryWallet)} className="text-sm" style={{ color: "#72ADFD" }}>
                Manage
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No e-wallet connected</p>
            <AddWalletDialog userId={userId} onSuccess={fetchData} />
          </div>
        )}
      </div>

      {editingWallet && (
        <EditWalletDialog
          wallet={editingWallet}
          userId={userId}
          allWallets={wallets}
          onSuccess={() => {
            setEditingWallet(null)
            fetchData()
          }}
          onClose={() => setEditingWallet(null)}
        />
      )}

      {primaryWallet && (
        <CashInOutDialog
          userId={userId}
          walletId={primaryWallet.id}
          walletName={primaryWallet.wallet_type.toUpperCase()}
          type={cashInOutDialog.type}
          open={cashInOutDialog.open}
          onOpenChange={(open) => setCashInOutDialog({ ...cashInOutDialog, open })}
          onSuccess={fetchData}
        />
      )}
    </div>
  )
}
