"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Plus } from "lucide-react"
import type { Transaction, Category } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface ExpensesSectionProps {
  expenses: Transaction[]
  setExpenses: (expenses: Transaction[]) => void
  categories: Category[]
}

export function ExpensesSection({ expenses, setExpenses, categories }: ExpensesSectionProps) {
  const [showAll, setShowAll] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Transaction | null>(null)

  const [amount, setAmount] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  const displayedExpenses = showAll ? expenses : expenses.slice(0, 5)

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedCategory = categories.find((c) => c.id === categoryId)

    const newExpense: Transaction = {
      id: `exp-${Date.now()}`,
      user_id: "demo-user-123",
      type: "expense",
      amount: Number.parseFloat(amount),
      category_id: categoryId || null,
      category_name: selectedCategory?.name || "Uncategorized",
      description,
      date,
      created_at: new Date().toISOString(),
    }

    setExpenses([newExpense, ...expenses])
    setAddDialogOpen(false)
    setAmount("")
    setCategoryId("")
    setDescription("")
    setDate(new Date().toISOString().split("T")[0])
  }

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingExpense) return

    const selectedCategory = categories.find((c) => c.id === categoryId)

    const updatedExpenses = expenses.map((exp) =>
      exp.id === editingExpense.id
        ? {
            ...exp,
            amount: Number.parseFloat(amount),
            category_id: categoryId || null,
            category_name: selectedCategory?.name || "Uncategorized",
            description,
            date,
          }
        : exp,
    )

    setExpenses(updatedExpenses)
    setEditDialogOpen(false)
    setEditingExpense(null)
    setAmount("")
    setCategoryId("")
    setDescription("")
    setDate(new Date().toISOString().split("T")[0])
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      setExpenses(expenses.filter((exp) => exp.id !== id))
    }
  }

  const openEditDialog = (expense: Transaction) => {
    setEditingExpense(expense)
    setAmount(expense.amount.toString())
    setCategoryId(expense.category_id || "")
    setDescription(expense.description || "")
    setDate(expense.date)
    setEditDialogOpen(true)
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: "#293F55" }}>
            Expenses
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: "#E0E0E0", color: "#293F55" }}>
                Date: Recent
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-transparent"
            style={{ borderColor: "#E0E0E0", color: "#293F55" }}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Items
            <Plus className="h-4 w-4 ml-2" />
          </Button>
          <Button
            size="sm"
            className="rounded-full text-white"
            style={{ backgroundColor: "#72ADFD" }}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show Less" : "All Items"}
          </Button>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-5 gap-4 mb-4">
        <div className="px-4 py-3 rounded-xl text-center font-medium text-white" style={{ backgroundColor: "#72ADFD" }}>
          Item
        </div>
        <div className="px-4 py-3 rounded-xl text-center font-medium text-white" style={{ backgroundColor: "#72ADFD" }}>
          Category
        </div>
        <div className="px-4 py-3 rounded-xl text-center font-medium text-white" style={{ backgroundColor: "#72ADFD" }}>
          Date
        </div>
        <div className="px-4 py-3 rounded-xl text-center font-medium text-white" style={{ backgroundColor: "#72ADFD" }}>
          Amount
        </div>
        <div className="px-4 py-3 rounded-xl text-center font-medium text-white" style={{ backgroundColor: "#72ADFD" }}>
          Actions
        </div>
      </div>

      {/* Table Rows */}
      <div className="space-y-3">
        {displayedExpenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No expenses yet. Add your first expense above!</div>
        ) : (
          displayedExpenses.map((expense) => (
            <div key={expense.id} className="grid grid-cols-5 gap-4 items-center">
              <div className="px-4 py-4 rounded-xl truncate" style={{ backgroundColor: "#F5F5F5", color: "#293F55" }}>
                {expense.description || "Expense"}
              </div>
              <div className="px-4 py-4 rounded-xl truncate" style={{ backgroundColor: "#F5F5F5", color: "#293F55" }}>
                {expense.category_name || "Uncategorized"}
              </div>
              <div className="px-4 py-4 rounded-xl" style={{ backgroundColor: "#F5F5F5", color: "#293F55" }}>
                {new Date(expense.date).toLocaleDateString()}
              </div>
              <div className="px-4 py-4 rounded-xl" style={{ backgroundColor: "#F5F5F5", color: "#293F55" }}>
                ₱{expense.amount.toFixed(2)}
              </div>
              <div className="px-4 py-4 rounded-xl flex gap-2 justify-center" style={{ backgroundColor: "#F5F5F5" }}>
                <button
                  onClick={() => openEditDialog(expense)}
                  className="p-1 hover:bg-gray-200 rounded"
                  style={{ color: "#72ADFD" }}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                  style={{ color: "#EF4444" }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>Enter the details of your expense</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
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
            <Button type="submit" className="w-full text-white" style={{ backgroundColor: "#72ADFD" }}>
              Add Expense
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>Update the details of your expense</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount (₱)</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
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
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="What was this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input id="edit-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full text-white" style={{ backgroundColor: "#72ADFD" }}>
              Update Expense
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
