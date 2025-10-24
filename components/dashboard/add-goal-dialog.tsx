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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { Plus } from "lucide-react"

interface AddGoalDialogProps {
  userId: string
  onSuccess: () => void
}

const GOAL_CATEGORIES = [
  "Vacation",
  "Emergency Fund",
  "Gadget",
  "Education",
  "Health",
  "Home",
  "Vehicle",
  "Investment",
  "Other",
]

export function AddGoalDialog({ userId, onSuccess }: AddGoalDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<"weekly" | "monthly" | "custom">("weekly")
  const [targetAmount, setTargetAmount] = useState("")
  const [category, setCategory] = useState<string>("")
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState("")
  const [enableAutoContribution, setEnableAutoContribution] = useState(false)
  const [autoContributionAmount, setAutoContributionAmount] = useState("")
  const [autoContributionFrequency, setAutoContributionFrequency] = useState<"daily" | "weekly" | "monthly">("weekly")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("goals").insert({
        user_id: userId,
        name,
        type,
        target_amount: Number.parseFloat(targetAmount),
        current_amount: 0,
        start_date: startDate,
        end_date: endDate,
        status: "active",
        category: category || null,
        auto_contribution_amount: enableAutoContribution ? Number.parseFloat(autoContributionAmount) : null,
        auto_contribution_frequency: enableAutoContribution ? autoContributionFrequency : null,
        paused: false,
        archived: false,
      })

      if (error) throw error

      setOpen(false)
      setName("")
      setTargetAmount("")
      setCategory("")
      setStartDate(new Date().toISOString().split("T")[0])
      setEndDate("")
      setEnableAutoContribution(false)
      setAutoContributionAmount("")
      setAutoContributionFrequency("weekly")
      onSuccess()
    } catch (error) {
      console.error("Error adding goal:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full text-white" style={{ backgroundColor: "#72ADFD" }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Goal</DialogTitle>
          <DialogDescription>Set a financial goal to track your progress</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[600px] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input
              id="name"
              placeholder="e.g., Save for laptop"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {GOAL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Goal Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Amount (₱)</Label>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoContribution"
                checked={enableAutoContribution}
                onCheckedChange={(checked) => setEnableAutoContribution(checked as boolean)}
              />
              <Label htmlFor="autoContribution" className="text-sm font-normal cursor-pointer">
                Enable automatic contribution
              </Label>
            </div>
            {enableAutoContribution && (
              <div className="space-y-3 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="autoAmount">Contribution Amount (₱)</Label>
                  <Input
                    id="autoAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={autoContributionAmount}
                    onChange={(e) => setAutoContributionAmount(e.target.value)}
                    required={enableAutoContribution}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="autoFrequency">Frequency</Label>
                  <Select value={autoContributionFrequency} onValueChange={(v) => setAutoContributionFrequency(v as any)}>
                    <SelectTrigger id="autoFrequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          <Button
            type="submit"
            className="w-full text-white"
            style={{ backgroundColor: "#72ADFD" }}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Goal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
