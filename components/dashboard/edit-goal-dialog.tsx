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
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import type { Goal } from "@/lib/types"
import { Pencil, Pause, Play, Archive, CheckCircle2, Trash2 } from "lucide-react"

interface EditGoalDialogProps {
  goal: Goal
  onSuccess: () => void
  trigger?: React.ReactNode
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

export function EditGoalDialog({ goal, onSuccess, trigger }: EditGoalDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(goal.name)
  const [type, setType] = useState<"weekly" | "monthly" | "custom">(goal.type)
  const [targetAmount, setTargetAmount] = useState(goal.target_amount.toString())
  const [category, setCategory] = useState<string>(goal.category || "")
  const [startDate, setStartDate] = useState(goal.start_date)
  const [endDate, setEndDate] = useState(goal.end_date)
  const [enableAutoContribution, setEnableAutoContribution] = useState(!!goal.auto_contribution_amount)
  const [autoContributionAmount, setAutoContributionAmount] = useState(
    goal.auto_contribution_amount?.toString() || ""
  )
  const [autoContributionFrequency, setAutoContributionFrequency] = useState<"daily" | "weekly" | "monthly">(
    goal.auto_contribution_frequency || "weekly"
  )
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      setName(goal.name)
      setType(goal.type)
      setTargetAmount(goal.target_amount.toString())
      setCategory(goal.category || "")
      setStartDate(goal.start_date)
      setEndDate(goal.end_date)
      setEnableAutoContribution(!!goal.auto_contribution_amount)
      setAutoContributionAmount(goal.auto_contribution_amount?.toString() || "")
      setAutoContributionFrequency(goal.auto_contribution_frequency || "weekly")
    }
  }, [open, goal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("goals")
        .update({
          name,
          type,
          target_amount: Number.parseFloat(targetAmount),
          start_date: startDate,
          end_date: endDate,
          category: category || null,
          auto_contribution_amount: enableAutoContribution ? Number.parseFloat(autoContributionAmount) : null,
          auto_contribution_frequency: enableAutoContribution ? autoContributionFrequency : null,
        })
        .eq("id", goal.id)

      if (error) throw error

      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error("Error updating goal:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTogglePause = async () => {
    setIsLoading(true)
    try {
      const newStatus = goal.status === "paused" ? "active" : "paused"
      const { error } = await supabase.from("goals").update({ status: newStatus, paused: newStatus === "paused" }).eq("id", goal.id)

      if (error) throw error
      onSuccess()
    } catch (error) {
      console.error("Error toggling pause:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkComplete = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("goals")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", goal.id)

      if (error) throw error
      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error("Error marking complete:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleArchive = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("goals").update({ archived: true }).eq("id", goal.id)

      if (error) throw error
      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error("Error archiving goal:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this goal? This action cannot be undone.")) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from("goals").delete().eq("id", goal.id)

      if (error) throw error
      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error("Error deleting goal:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="rounded-full">
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Goal: {goal.name}</DialogTitle>
          <DialogDescription>Edit goal details or manage status</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pb-4 border-b">
            <Button
              size="sm"
              variant="outline"
              onClick={handleTogglePause}
              disabled={isLoading || goal.status === "completed"}
            >
              {goal.status === "paused" ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkComplete}
              disabled={isLoading || goal.status === "completed"}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
            <Button size="sm" variant="outline" onClick={handleArchive} disabled={isLoading}>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDelete} disabled={isLoading}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[400px] overflow-y-auto">
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
                    <Select
                      value={autoContributionFrequency}
                      onValueChange={(v) => setAutoContributionFrequency(v as any)}
                    >
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
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
