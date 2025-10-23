"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Transaction, Category } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

interface IncomeSectionProps {
  income: Transaction[]
  setIncome: (income: Transaction[]) => void
  categories: Category[]
}

export function IncomeSection({ income, setIncome, categories }: IncomeSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [categoryName, setCategoryName] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  const total = income.reduce((sum, inc) => sum + inc.amount, 0)
  const scholarshipAmount = income.find((i) => i.category_name === "Scholarship")?.amount || 0
  const allowanceAmount = income.find((i) => i.category_name === "Allowance")?.amount || 0
  const otherAmount = total - scholarshipAmount - allowanceAmount

  const scholarshipPercent = total > 0 ? (scholarshipAmount / total) * 100 : 0
  const allowancePercent = total > 0 ? (allowanceAmount / total) * 100 : 0

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const newIncome: Transaction = {
      id: `inc-${Date.now()}`,
      user_id: "demo-user-123",
      type: "income",
      amount: Number.parseFloat(amount),
      category_id: null,
      category_name: categoryName,
      description,
      date,
      created_at: new Date().toISOString(),
    }
    setIncome([...income, newIncome])
    setDialogOpen(false)
    setAmount("")
    setCategoryName("")
    setDescription("")
    setDate(new Date().toISOString().split("T")[0])
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold" style={{ color: "#293F55" }}>
          Income
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-transparent"
            style={{ borderColor: "#E0E0E0", color: "#293F55" }}
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: "#72ADFD" }}>
            Monthly
          </span>
        </div>
      </div>
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-1">Total</div>
        <div className="text-3xl font-bold" style={{ color: "#293F55" }}>
          ₱ {total.toFixed(0)}
        </div>
      </div>
      {total > 0 && (
        <>
          <div className="flex h-8 rounded-full overflow-hidden mb-4">
            {scholarshipAmount > 0 && (
              <div
                className="flex items-center justify-center text-white text-sm font-medium"
                style={{
                  width: `${scholarshipPercent}%`,
                  backgroundColor: "#72ADFD",
                }}
              >
                {scholarshipPercent.toFixed(0)}%
              </div>
            )}
            {allowanceAmount > 0 && (
              <div
                className="flex items-center justify-center text-white text-sm font-medium"
                style={{
                  width: `${allowancePercent}%`,
                  backgroundColor: "#293F55",
                }}
              >
                {allowancePercent.toFixed(0)}%
              </div>
            )}
          </div>
          <div className="space-y-2">
            {scholarshipAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Scholarship</span>
                <span className="font-semibold" style={{ color: "#293F55" }}>
                  ₱ {scholarshipAmount.toFixed(0)}
                </span>
              </div>
            )}
            {allowanceAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Allowance</span>
                <span className="font-semibold" style={{ color: "#293F55" }}>
                  ₱ {allowanceAmount.toFixed(0)}
                </span>
              </div>
            )}
            {otherAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Other</span>
                <span className="font-semibold" style={{ color: "#293F55" }}>
                  ₱ {otherAmount.toFixed(0)}
                </span>
              </div>
            )}
          </div>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Income</DialogTitle>
            <DialogDescription>Enter the details of your income</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inc-amount">Amount (₱)</Label>
              <Input
                id="inc-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inc-category">Category</Label>
              <Select value={categoryName} onValueChange={setCategoryName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scholarship">Scholarship</SelectItem>
                  <SelectItem value="Allowance">Allowance</SelectItem>
                  <SelectItem value="Part-time Job">Part-time Job</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inc-description">Description</Label>
              <Textarea
                id="inc-description"
                placeholder="What is this income for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inc-date">Date</Label>
              <Input id="inc-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full text-white" style={{ backgroundColor: "#72ADFD" }}>
              Add Income
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
