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
import { createClient } from "@/lib/supabase/client"
import { Plus } from "lucide-react"

interface AddGoalDialogProps {
  userId: string
  onSuccess: () => void
}

export function AddGoalDialog({ userId, onSuccess }: AddGoalDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<"weekly" | "monthly" | "custom">("weekly")
  const [targetAmount, setTargetAmount] = useState("")
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState("")
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
      })

      if (error) throw error

      setOpen(false)
      setName("")
      setTargetAmount("")
      setStartDate(new Date().toISOString().split("T")[0])
      setEndDate("")
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
