"use client"

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
import { createClient } from "@/lib/supabase/client"
import type { Category } from "@/lib/types"
import { Plus, Trash2 } from "lucide-react"

interface ManageCategoriesDialogProps {
  userId: string
  onSuccess: () => void
}

export function ManageCategoriesDialog({ userId, onSuccess }: ManageCategoriesDialogProps) {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState({ name: "", icon: "", budget: "", color: "#72ADFD" })
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchCategories()
    }
  }, [open])

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").eq("user_id", userId)
    if (data) setCategories(data)
  }

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.budget) return

    const { error } = await supabase.from("categories").insert({
      user_id: userId,
      name: newCategory.name,
      icon: newCategory.icon || "📦",
      budget_amount: Number.parseFloat(newCategory.budget),
      color: newCategory.color,
    })

    if (!error) {
      setNewCategory({ name: "", icon: "", budget: "", color: "#72ADFD" })
      fetchCategories()
      onSuccess()
    }
  }

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id)
    if (!error) {
      fetchCategories()
      onSuccess()
    }
  }

  const handleUpdateBudget = async (id: string, budget: number) => {
    const { error } = await supabase.from("categories").update({ budget_amount: budget }).eq("id", id)
    if (!error) {
      fetchCategories()
      onSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="rounded-full w-6 h-6 p-0 bg-transparent">
          +
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>Add, edit, or remove expense categories and set budgets</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing Categories */}
          <div className="space-y-2">
            <Label>Your Categories</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <span className="text-xl">{category.icon}</span>
                  <span className="flex-1 font-medium">{category.name}</span>
                  <Input
                    type="number"
                    className="w-32"
                    value={category.budget_amount || 0}
                    onChange={(e) => handleUpdateBudget(category.id, Number.parseFloat(e.target.value) || 0)}
                  />
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 hover:bg-gray-200 rounded"
                    style={{ color: "#EF4444" }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Category */}
          <div className="space-y-2 border-t pt-4">
            <Label>Add New Category</Label>
            <div className="grid grid-cols-4 gap-2">
              <Input
                placeholder="Icon (emoji)"
                value={newCategory.icon}
                onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
              />
              <Input
                placeholder="Name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Budget"
                value={newCategory.budget}
                onChange={(e) => setNewCategory({ ...newCategory, budget: e.target.value })}
              />
              <Button onClick={handleAddCategory} className="text-white" style={{ backgroundColor: "#72ADFD" }}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
