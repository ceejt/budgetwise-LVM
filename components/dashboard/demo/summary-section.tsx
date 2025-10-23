"use client"

import type React from "react"

import { useState } from "react"
import type { Transaction, Goal, Wallet } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

interface SummarySectionProps {
  expenses: Transaction[]
  income: Transaction[]
  goals: Goal[]
  wallets: Wallet[]
  setWallets: (wallets: Wallet[]) => void
}

export function SummarySection({ expenses, income, goals, wallets, setWallets }: SummarySectionProps) {
  const [walletDialogOpen, setWalletDialogOpen] = useState(false)
  const [provider, setProvider] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [balance, setBalance] = useState("")

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  const categoryTotals = expenses.reduce(
    (acc, exp) => {
      const category = exp.category_name || "Other"
      acc[category] = (acc[category] || 0) + exp.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const categoryColors = {
    Food: "#293F55",
    Transportation: "#72ADFD",
    Grocery: "#50C878",
    Orders: "#FFB347",
    Other: "#9CA3AF",
  }

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault()
    const newWallet: Wallet = {
      id: `wallet-${Date.now()}`,
      user_id: "demo-user-123",
      provider: provider as "gcash" | "maya",
      account_number: accountNumber,
      account_name: accountName,
      balance: Number.parseFloat(balance),
      is_primary: wallets.length === 0,
      created_at: new Date().toISOString(),
    }
    setWallets([...wallets, newWallet])
    setWalletDialogOpen(false)
    setProvider("")
    setAccountNumber("")
    setAccountName("")
    setBalance("")
  }

  const primaryWallet = wallets.find((w) => w.is_primary) || wallets[0]

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold" style={{ color: "#293F55" }}>
            Summary
          </h2>
          <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: "#72ADFD" }}>
            Daily
          </span>
        </div>
        <div className="text-center mb-6">
          <div className="text-4xl font-bold mb-4" style={{ color: "#293F55" }}>
            ₱{totalExpenses.toFixed(0)}
          </div>
          <div className="relative w-48 h-48 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#E0E0E0" strokeWidth="10" />
              {Object.entries(categoryTotals).map(([category, amount], index, arr) => {
                const percentage = (amount / totalExpenses) * 100
                const offset = arr.slice(0, index).reduce((sum, [, amt]) => sum + (amt / totalExpenses) * 251.2, 0)
                return (
                  <circle
                    key={category}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={categoryColors[category as keyof typeof categoryColors] || categoryColors.Other}
                    strokeWidth="10"
                    strokeDasharray={`${(percentage / 100) * 251.2} 251.2`}
                    strokeDashoffset={-offset}
                    transform="rotate(-90 50 50)"
                  />
                )
              })}
            </svg>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(categoryTotals).map(([category, amount]) => (
            <div key={category} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: categoryColors[category as keyof typeof categoryColors] || categoryColors.Other,
                }}
              />
              <span className="text-xs" style={{ color: "#293F55" }}>
                {category}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scholarship Card */}
      {goals.find((g) => g.name === "Scholarship") && (
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold" style={{ color: "#293F55" }}>
              Scholarship
            </h3>
            <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: "#72ADFD" }}>
              DOST-SEI
            </span>
          </div>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">STATUS</span>
              <span className="px-2 py-1 rounded text-xs text-white" style={{ backgroundColor: "#50C878" }}>
                Accepted
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">PROGRESS</span>
              <span className="px-2 py-1 rounded text-xs text-white" style={{ backgroundColor: "#72ADFD" }}>
                Received
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">🏦</div>
              <span className="font-semibold">LANDBANK</span>
            </div>
            <div className="text-lg mb-4">**** 5678 9101 2131</div>
            <div className="text-sm opacity-80">CYRIL JOHN TINAE</div>
          </div>
        </div>
      )}

      {/* E-Wallet Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold" style={{ color: "#293F55" }}>
            E-Wallet
          </h3>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setWalletDialogOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {primaryWallet ? (
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold uppercase">{primaryWallet.provider}</span>
              <span className="text-2xl font-bold">VISA</span>
            </div>
            <div className="text-lg mb-4">{primaryWallet.account_number}</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs opacity-80">Amount</div>
                <div className="text-xl font-bold">₱ {primaryWallet.balance.toFixed(0)}</div>
              </div>
              <div>
                <div className="text-xs opacity-80">Transaction</div>
                <div className="text-xl font-bold text-green-300">Paid -100</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No wallet added yet</p>
            <Button
              size="sm"
              style={{ backgroundColor: "#72ADFD", color: "white" }}
              onClick={() => setWalletDialogOpen(true)}
            >
              Add Wallet
            </Button>
          </div>
        )}
      </div>

      <Dialog open={walletDialogOpen} onOpenChange={setWalletDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add E-Wallet</DialogTitle>
            <DialogDescription>Connect your GCash or Maya account</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddWallet} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select value={provider} onValueChange={setProvider} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gcash">GCash</SelectItem>
                  <SelectItem value="maya">Maya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-number">Account Number</Label>
              <Input
                id="account-number"
                placeholder="0917 123 4567"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-name">Account Name</Label>
              <Input
                id="account-name"
                placeholder="Juan Dela Cruz"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance">Current Balance (₱)</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full text-white" style={{ backgroundColor: "#72ADFD" }}>
              Add Wallet
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
