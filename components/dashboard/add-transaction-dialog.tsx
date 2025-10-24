"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import type { Category, RecurrencePattern, EWallet } from "@/lib/types"
import { Plus, Repeat, Wallet } from "lucide-react"

interface AddTransactionDialogProps {
  userId: string
  type: "income" | "expense"
  onSuccess: () => void
}

export function AddTransactionDialog({ userId, type, onSuccess }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [wallets, setWallets] = useState<EWallet[]>([])
  const [amount, setAmount] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [walletId, setWalletId] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(false)

  // Recurring transaction states
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>("monthly")
  const [hasEndDate, setHasEndDate] = useState(false)
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("")

  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchCategories()
      fetchWallets()
    }
  }, [open])

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").eq("user_id", userId)
    if (data) setCategories(data)
  }

  const fetchWallets = async () => {
    const { data } = await supabase
      .from("e_wallets")
      .select("*")
      .eq("user_id", userId)
      .order("is_primary", { ascending: false })

    if (data) {
      setWallets(data)
      // Set primary wallet as default
      const primaryWallet = data.find(w => w.is_primary)
      if (primaryWallet && !walletId) {
        setWalletId(primaryWallet.id)
      }
    }
  }

  const calculateNextOccurrence = (startDate: string, pattern: RecurrencePattern): string => {
    const date = new Date(startDate)
    switch (pattern) {
      case "daily":
        date.setDate(date.getDate() + 1)
        break
      case "weekly":
        date.setDate(date.getDate() + 7)
        break
      case "biweekly":
        date.setDate(date.getDate() + 14)
        break
      case "monthly":
        date.setMonth(date.getMonth() + 1)
        break
      case "yearly":
        date.setFullYear(date.getFullYear() + 1)
        break
    }
    return date.toISOString().split("T")[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const selectedCategory = categories.find((c) => c.id === categoryId)

      const transactionData: any = {
        user_id: userId,
        type,
        amount: Number.parseFloat(amount),
        category_id: categoryId || null,
        category_name: selectedCategory?.name || null,
        wallet_id: walletId || null,
        description,
        date,
      }

      // Add recurring transaction fields if enabled
      if (isRecurring) {
        transactionData.is_recurring = true
        transactionData.is_template = true
        transactionData.recurrence_pattern = recurrencePattern
        transactionData.recurrence_enabled = true
        transactionData.next_occurrence_date = calculateNextOccurrence(date, recurrencePattern)

        if (hasEndDate && recurrenceEndDate) {
          transactionData.recurrence_end_date = recurrenceEndDate
        }
      }

      const { error } = await supabase.from("transactions").insert(transactionData)

      if (error) throw error

      setOpen(false)
      setAmount("")
      setCategoryId("")
      setWalletId("")
      setDescription("")
      setDate(new Date().toISOString().split("T")[0])
      setIsRecurring(false)
      setRecurrencePattern("monthly")
      setHasEndDate(false)
      setRecurrenceEndDate("")
      onSuccess()
    } catch (error) {
      console.error("Error adding transaction:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full bg-transparent"
          style={{ borderColor: "#E0E0E0", color: "#293F55" }}
        >
          Add Items
          <Plus className="h-4 w-4 ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {type === "income" ? "Income" : "Expense"}</DialogTitle>
          <DialogDescription>Enter the details of your {type}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₱)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="wallet" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              E-Wallet (Optional)
            </Label>
            <Select value={walletId || "none"} onValueChange={(value) => setWalletId(value === "none" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a wallet (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No wallet</SelectItem>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.wallet_type.toUpperCase()} - {wallet.account_number}
                    {wallet.is_primary && " (Primary)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {wallets.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No wallets found. Add a wallet in Summary section to link transactions.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          {/* Recurring Transaction Section */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox id="recurring" checked={isRecurring} onCheckedChange={(checked) => setIsRecurring(!!checked)} />
              <Label htmlFor="recurring" className="flex items-center gap-2 cursor-pointer">
                <Repeat className="h-4 w-4" />
                This is a recurring {type}
              </Label>
            </div>

            {isRecurring && (
              <div className="space-y-3 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="recurrence-pattern">Frequency</Label>
                  <Select value={recurrencePattern} onValueChange={(value) => setRecurrencePattern(value as RecurrencePattern)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Every 2 Weeks</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="has-end-date" checked={hasEndDate} onCheckedChange={(checked) => setHasEndDate(!!checked)} />
                  <Label htmlFor="has-end-date" className="cursor-pointer">Set end date</Label>
                </div>

                {hasEndDate && (
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={recurrenceEndDate}
                      onChange={(e) => setRecurrenceEndDate(e.target.value)}
                      min={date}
                    />
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  {!hasEndDate
                    ? "This will repeat until you cancel it"
                    : recurrenceEndDate
                      ? `This will repeat until ${new Date(recurrenceEndDate).toLocaleDateString()}`
                      : "Select an end date"}
                </p>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full text-white"
            style={{ backgroundColor: "#72ADFD" }}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : `Add ${type === "income" ? "Income" : "Expense"}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
