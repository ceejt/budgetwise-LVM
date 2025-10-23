"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Transaction, Goal, EWallet } from "@/lib/types"
import { AddWalletDialog } from "./add-wallet-dialog"
import { EditWalletDialog } from "./edit-wallet-dialog"

interface SummarySectionProps {
  userId: string
}

export function SummarySection({ userId }: SummarySectionProps) {
  const [expenses, setExpenses] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [wallets, setWallets] = useState<EWallet[]>([])
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily")
  const [editingWallet, setEditingWallet] = useState<EWallet | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    const { data: expenseData } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "expense")

    const { data: goalData } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1)

    const { data: walletData } = await supabase.from("e_wallets").select("*").eq("user_id", userId)

    if (expenseData) setExpenses(expenseData)
    if (goalData) setGoals(goalData)
    if (walletData) setWallets(walletData)
  }

  const totalExpenses = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0)

  const categoryTotals = expenses.reduce(
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

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold" style={{ color: "#293F55" }}>
            Summary
          </h2>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-1 rounded-full text-sm text-white"
            style={{ backgroundColor: "#72ADFD" }}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="text-center mb-6">
          <div className="text-4xl font-bold mb-4" style={{ color: "#293F55" }}>
            ₱{totalExpenses.toFixed(0)}
          </div>
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
        </div>

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
      </div>

      {/* Scholarship Card */}
      {goals.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold" style={{ color: "#293F55" }}>
              {goals[0].name}
            </h3>
            <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: "#72ADFD" }}>
              DOST-SEI
            </span>
          </div>
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">1st / 2nd Semester</div>
            <div className="flex gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: "#E0E0E0", color: "#293F55" }}>
                STATUS: Accepted
              </span>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: "#E0E0E0", color: "#293F55" }}>
                PROGRESS: Received
              </span>
            </div>
          </div>
          <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: "#1E3A5F", color: "white" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-white/20" />
              <span className="font-semibold">LANDBANK</span>
            </div>
            <div className="text-lg mb-4">**** 5678 9101 2131</div>
            <div className="text-xs mb-1">CYRIL KURT TINAE</div>
            <div className="flex gap-2">
              <button className="px-4 py-1 rounded-full text-xs" style={{ backgroundColor: "white", color: "#1E3A5F" }}>
                Link to Expenses
              </button>
              <button className="px-4 py-1 rounded-full text-xs" style={{ backgroundColor: "white", color: "#1E3A5F" }}>
                View Details
              </button>
            </div>
          </div>
          <button className="w-full py-2 rounded-full text-sm" style={{ backgroundColor: "#E0E0E0", color: "#293F55" }}>
            Send email
          </button>
        </div>
      )}

      {/* E-Wallet Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold" style={{ color: "#293F55" }}>
            E-Wallet
          </h3>
          {wallets.length === 0 && <AddWalletDialog userId={userId} onSuccess={fetchData} />}
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
                <button className="px-4 py-1 rounded-full text-xs bg-white" style={{ color: "#007DFF" }}>
                  Cash In
                </button>
                <button className="px-4 py-1 rounded-full text-xs bg-white" style={{ color: "#007DFF" }}>
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
    </div>
  )
}
