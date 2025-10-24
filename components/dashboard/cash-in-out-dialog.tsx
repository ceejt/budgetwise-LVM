"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cashIn, cashOut } from "@/lib/utils/wallet-operations"
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react"

interface CashInOutDialogProps {
  userId: string
  walletId: string
  walletName: string
  type: "cash-in" | "cash-out"
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CashInOutDialog({
  userId,
  walletId,
  walletName,
  type,
  open,
  onOpenChange,
  onSuccess,
}: CashInOutDialogProps) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(false)

  const isCashIn = type === "cash-in"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const params = {
        userId,
        walletId,
        amount: Number.parseFloat(amount),
        description: description || (isCashIn ? "Cash In" : "Cash Out"),
        date,
      }

      if (isCashIn) {
        await cashIn(params)
      } else {
        await cashOut(params)
      }

      // Reset form
      setAmount("")
      setDescription("")
      setDate(new Date().toISOString().split("T")[0])
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error(`Error processing ${type}:`, error)
      alert(`Failed to process ${type}. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCashIn ? (
              <>
                <ArrowDownCircle className="h-5 w-5 text-green-600" />
                Cash In
              </>
            ) : (
              <>
                <ArrowUpCircle className="h-5 w-5 text-red-600" />
                Cash Out
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isCashIn
              ? `Add money to your ${walletName} wallet`
              : `Withdraw money from your ${walletName} wallet`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₱)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder={
                isCashIn
                  ? "e.g., Salary, Gift, Transfer from bank"
                  : "e.g., ATM withdrawal, Transfer to bank"
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 text-white"
              style={{
                backgroundColor: isCashIn ? "#10B981" : "#EF4444",
              }}
              disabled={isLoading}
            >
              {isLoading
                ? "Processing..."
                : isCashIn
                  ? "Add Money"
                  : "Withdraw Money"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
