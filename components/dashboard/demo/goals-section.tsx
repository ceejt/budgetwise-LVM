"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Goal, Category } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

interface GoalsSectionProps {
  goals: Goal[]
  setGoals: (goals: Goal[]) => void
  categories: Category[]
  setCategories: (categories: Category[]) => void
}

export function GoalsSection({ goals, setGoals, categories, setCategories }: GoalsSectionProps) {
  const [weeklyAmount, setWeeklyAmount] = useState(
    goals.find((g) => g.type === "weekly")?.target_amount.toString() || "500",
  )
  const [scholarshipAmount, setScholarshipAmount] = useState(
    goals.find((g) => g.name === "Scholarship")?.target_amount.toString() || "4000",
  )
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryIcon, setNewCategoryIcon] = useState("")
  const [newCategoryBudget, setNewCategoryBudget] = useState("")

  const handleSaveWeekly = () => {
    const amount = Number.parseFloat(weeklyAmount)
    const weeklyGoal = goals.find((g) => g.type === "weekly")

    if (weeklyGoal) {
      setGoals(goals.map((g) => (g.id === weeklyGoal.id ? { ...g, target_amount: amount } : g)))
    } else {
      const newGoal: Goal = {
        id: `goal-${Date.now()}`,
        user_id: "demo-user-123",
        name: "Weekly Savings",
        type: "weekly",
        target_amount: amount,
        current_amount: 0,
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "active",
        created_at: new Date().toISOString(),
      }
      setGoals([...goals, newGoal])
    }
  }

  const handleSaveScholarship = () => {
    const amount = Number.parseFloat(scholarshipAmount)
    const scholarshipGoal = goals.find((g) => g.name === "Scholarship")

    if (scholarshipGoal) {
      setGoals(goals.map((g) => (g.id === scholarshipGoal.id ? { ...g, target_amount: amount } : g)))
    } else {
      const newGoal: Goal = {
        id: `goal-${Date.now()}`,
        user_id: "demo-user-123",
        name: "Scholarship",
        type: "monthly",
        target_amount: amount,
        current_amount: 0,
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "active",
        created_at: new Date().toISOString(),
      }
      setGoals([...goals, newGoal])
    }
  }

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      user_id: "demo-user-123",
      name: newCategoryName,
      icon: newCategoryIcon,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      budget_amount: Number.parseFloat(newCategoryBudget),
      created_at: new Date().toISOString(),
    }
    setCategories([...categories, newCategory])
    setCategoryDialogOpen(false)
    setNewCategoryName("")
    setNewCategoryIcon("")
    setNewCategoryBudget("")
  }

  const totalBudget = categories.reduce((sum, cat) => sum + Number(cat.budget_amount), 0)

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "#72ADFD" }}>
          <span className="text-white text-sm">✓</span>
        </div>
        <h2 className="text-2xl font-semibold" style={{ color: "#293F55" }}>
          Goals
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weekly Savings */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <h3 className="font-semibold mb-3" style={{ color: "#293F55" }}>
            Weekly Savings
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: "#72ADFD" }}>
              Weekly
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => {
              const today = new Date().getDay()
              return (
                <div key={day} className="text-center">
                  <div className="text-xs text-gray-500 mb-1">{day.slice(0, 3)}</div>
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-xs"
                    style={{
                      backgroundColor: i <= today ? "#72ADFD" : "#E0E0E0",
                      color: i <= today ? "white" : "#293F55",
                    }}
                  >
                    {i + 1}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Input
              placeholder="Enter amount"
              className="flex-1"
              value={weeklyAmount}
              onChange={(e) => setWeeklyAmount(e.target.value)}
              type="number"
            />
            <span className="font-semibold" style={{ color: "#293F55" }}>
              ₱ {weeklyAmount || "0"}
            </span>
          </div>
          <Button
            onClick={handleSaveWeekly}
            variant="outline"
            className="w-full bg-transparent"
            style={{ borderColor: "#E0E0E0", color: "#293F55" }}
          >
            Save
          </Button>
        </div>

        {/* Scholarship */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <h3 className="font-semibold mb-3" style={{ color: "#293F55" }}>
            Scholarship
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: "#72ADFD" }}>
              DOST-SEI
            </span>
            <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: "#72ADFD" }}>
              Monthly
            </span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <select className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: "#72ADFD", color: "white" }}>
              <option>Year: {new Date().getFullYear()}</option>
            </select>
            <select className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: "#72ADFD", color: "white" }}>
              <option>Month: {new Date().toLocaleString("default", { month: "long" })}</option>
            </select>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Input
              placeholder="Enter amount"
              className="flex-1"
              value={scholarshipAmount}
              onChange={(e) => setScholarshipAmount(e.target.value)}
              type="number"
            />
            <span className="font-semibold" style={{ color: "#293F55" }}>
              ₱ {scholarshipAmount || "0"}
            </span>
          </div>
          <Button
            onClick={handleSaveScholarship}
            variant="outline"
            className="w-full bg-transparent"
            style={{ borderColor: "#E0E0E0", color: "#293F55" }}
          >
            Save
          </Button>
        </div>

        {/* Categories */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold" style={{ color: "#293F55" }}>
              Categories
            </h3>
            <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: "#72ADFD" }}>
              Weekly
            </span>
          </div>
          <div className="mb-3">
            <div className="text-sm text-gray-500 mb-1">Total Budget</div>
            <div className="text-2xl font-bold" style={{ color: "#72ADFD" }}>
              ₱ {totalBudget.toFixed(0)}
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Manage categories</span>
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Category</DialogTitle>
                  <DialogDescription>Create a new expense category with a budget</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cat-name">Category Name</Label>
                    <Input
                      id="cat-name"
                      placeholder="e.g., Entertainment"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cat-icon">Icon (emoji)</Label>
                    <Input
                      id="cat-icon"
                      placeholder="🎮"
                      value={newCategoryIcon}
                      onChange={(e) => setNewCategoryIcon(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cat-budget">Budget Amount (₱)</Label>
                    <Input
                      id="cat-budget"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newCategoryBudget}
                      onChange={(e) => setNewCategoryBudget(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full text-white" style={{ backgroundColor: "#72ADFD" }}>
                    Add Category
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            {categories.slice(0, 4).map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ backgroundColor: category.color || "#72ADFD" }}
              >
                <span className="text-white text-sm">{category.icon}</span>
                <span className="text-white font-semibold">₱{category.budget_amount.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
