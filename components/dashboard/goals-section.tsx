"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import type { Goal, Category } from "@/lib/types"
import { ManageCategoriesDialog } from "./manage-categories-dialog"

interface GoalsSectionProps {
  userId: string
}

export function GoalsSection({ userId }: GoalsSectionProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [weeklyAmount, setWeeklyAmount] = useState("")
  const [scholarshipAmount, setScholarshipAmount] = useState("")
  const supabase = createClient()

  useEffect(() => {
    fetchGoals()
    fetchCategories()
  }, [userId])

  const fetchGoals = async () => {
    const { data } = await supabase.from("goals").select("*").eq("user_id", userId).eq("status", "active").limit(2)

    if (data) {
      setGoals(data)
      const weekly = data.find((g) => g.type === "weekly")
      const scholarship = data.find((g) => g.name.toLowerCase().includes("scholarship"))
      if (weekly) setWeeklyAmount(weekly.target_amount.toString())
      if (scholarship) setScholarshipAmount(scholarship.target_amount.toString())
    }
  }

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").eq("user_id", userId).limit(4)

    if (data) setCategories(data)
  }

  const handleSaveWeekly = async () => {
    const weeklyGoal = goals.find((g) => g.type === "weekly")
    const amount = Number.parseFloat(weeklyAmount)

    if (weeklyGoal) {
      await supabase.from("goals").update({ target_amount: amount }).eq("id", weeklyGoal.id)
    } else {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 7)

      await supabase.from("goals").insert({
        user_id: userId,
        name: "Weekly Savings",
        type: "weekly",
        target_amount: amount,
        current_amount: 0,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        status: "active",
      })
    }
    fetchGoals()
  }

  const handleSaveScholarship = async () => {
    const scholarshipGoal = goals.find((g) => g.name.toLowerCase().includes("scholarship"))
    const amount = Number.parseFloat(scholarshipAmount)

    if (scholarshipGoal) {
      await supabase.from("goals").update({ target_amount: amount }).eq("id", scholarshipGoal.id)
    } else {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1)

      await supabase.from("goals").insert({
        user_id: userId,
        name: "Scholarship",
        type: "monthly",
        target_amount: amount,
        current_amount: 0,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        status: "active",
      })
    }
    fetchGoals()
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
            <ManageCategoriesDialog userId={userId} onSuccess={fetchCategories} />
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
