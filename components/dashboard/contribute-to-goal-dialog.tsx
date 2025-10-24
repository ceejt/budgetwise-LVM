"use client"

import type React from "react"

import { useState } from "react"
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
import { createClient } from "@/lib/supabase/client"
import type { Goal } from "@/lib/types"
import { Plus } from "lucide-react"

interface ContributeToGoalDialogProps {
  goal: Goal
  onSuccess: () => void
  trigger?: React.ReactNode
}

export function ContributeToGoalDialog({ goal, onSuccess, trigger }: ContributeToGoalDialogProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const contributionAmount = Number.parseFloat(amount)
      const newCurrentAmount = goal.current_amount + contributionAmount

      // Check if goal will be completed
      const willComplete = newCurrentAmount >= goal.target_amount
      const status = willComplete ? "completed" : goal.status
      const completedAt = willComplete ? new Date().toISOString() : null

      const { error } = await supabase
        .from("goals")
        .update({
          current_amount: newCurrentAmount,
          status,
          completed_at: completedAt,
        })
        .eq("id", goal.id)

      if (error) throw error

      setOpen(false)
      setAmount("")
      onSuccess()
    } catch (error) {
      console.error("Error contributing to goal:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const progress = (goal.current_amount / goal.target_amount) * 100
  const remaining = goal.target_amount - goal.current_amount

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Contribute
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contribute to {goal.name}</DialogTitle>
          <DialogDescription>Add funds to your savings goal</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Progress</span>
              <span className="font-medium" style={{ color: "#293F55" }}>
                {progress.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Saved</span>
              <span className="font-semibold" style={{ color: "#72ADFD" }}>
                ₱{goal.current_amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Target</span>
              <span className="font-semibold" style={{ color: "#293F55" }}>
                ₱{goal.target_amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Remaining</span>
              <span className="font-semibold text-orange-600">₱{remaining.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Contribution Amount (₱)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0.01"
              />
              <p className="text-xs text-gray-500">
                {amount && Number.parseFloat(amount) > 0
                  ? `New total: ₱${(goal.current_amount + Number.parseFloat(amount)).toFixed(2)}`
                  : "Enter an amount to contribute"}
              </p>
            </div>
            <Button
              type="submit"
              className="w-full text-white"
              style={{ backgroundColor: "#72ADFD" }}
              disabled={isLoading}
            >
              {isLoading ? "Contributing..." : "Contribute"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
