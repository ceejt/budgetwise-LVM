"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import type { Category, Transaction } from "@/lib/types"

interface EditTransactionDialogProps {
  transaction: Transaction
  userId: string
  onSuccess: () => void
  onClose: () => void
}

export function EditTransactionDialog({ transaction, userId, onSuccess, onClose }: EditTransactionDialogProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [amount, setAmount] = useState(transaction.amount.toString())
  const [categoryId, setCategoryId] = useState(transaction.category_id || "")
  const [description, setDescription] = useState(transaction.description || "")
  const [date, setDate] = useState(transaction.date)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").eq("user_id", userId)
    if (data) setCategories(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const selectedCategory = categories.find((c) => c.id === categoryId)

      const { error } = await supabase
        .from("transactions")
        .update({
          amount: Number.parseFloat(amount),
          category_id: categoryId || null,
          category_name: selectedCategory?.name || null,
          description,
          date,
        })
        .eq("id", transaction.id)

      if (error) throw error

      onSuccess()
    } catch (error) {
      console.error("Error updating transaction:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {transaction.type === "income" ? "Income" : "Expense"}</DialogTitle>
          <DialogDescription>Update the details of your {transaction.type}</DialogDescription>
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
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 text-white"
              style={{ backgroundColor: "#72ADFD" }}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
