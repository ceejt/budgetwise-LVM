"use client"

import { useState } from "react"
import { Plus, Calendar, DollarSign, Repeat, Bell, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createBill } from "@/lib/utils/bill-operations"
import { useToast } from "@/hooks/use-toast"
import type { Category, EWallet, RecurrencePattern } from "@/lib/types"

interface AddBillDialogProps {
  categories: Category[]
  wallets: EWallet[]
  onBillAdded?: () => void
}

export function AddBillDialog({ categories, wallets, onBillAdded }: AddBillDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [merchantName, setMerchantName] = useState("")
  const [notes, setNotes] = useState("")

  // Recurrence settings
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>("monthly")
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("")

  // Reminder settings
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [reminderDaysBefore, setReminderDaysBefore] = useState("3")

  // Auto-pay settings
  const [autoPayEnabled, setAutoPayEnabled] = useState(false)
  const [walletId, setWalletId] = useState<string>("")

  const resetForm = () => {
    setName("")
    setAmount("")
    setDueDate("")
    setCategoryId("")
    setMerchantName("")
    setNotes("")
    setIsRecurring(false)
    setRecurrencePattern("monthly")
    setRecurrenceEndDate("")
    setReminderEnabled(true)
    setReminderDaysBefore("3")
    setAutoPayEnabled(false)
    setWalletId("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !amount || !dueDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    const reminderDays = parseInt(reminderDaysBefore)
    if (isNaN(reminderDays) || reminderDays < 0 || reminderDays > 30) {
      toast({
        title: "Invalid Reminder Days",
        description: "Reminder days must be between 0 and 30",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await createBill({
        name,
        amount: amountNum,
        due_date: dueDate,
        category_id: categoryId || null,
        status: "unpaid",
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? recurrencePattern : null,
        recurrence_end_date: isRecurring && recurrenceEndDate ? recurrenceEndDate : null,
        reminder_enabled: reminderEnabled,
        reminder_days_before: reminderDays,
        auto_pay_enabled: autoPayEnabled,
        wallet_id: autoPayEnabled && walletId ? walletId : null,
        merchant_name: merchantName || null,
        notes: notes || null,
      })

      toast({
        title: "Bill Created",
        description: `${name} has been added to your bills`,
      })

      resetForm()
      setOpen(false)
      onBillAdded?.()
    } catch (error) {
      console.error("Error creating bill:", error)
      toast({
        title: "Error",
        description: "Failed to create bill. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Bill
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Bill</DialogTitle>
          <DialogDescription>
            Create a bill reminder to track upcoming payments
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Basic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="bill-name">
                Bill Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bill-name"
                placeholder="e.g., Electric Bill, Rent, Netflix"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bill-amount">
                  Amount <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="bill-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-9"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bill-due-date">
                  Due Date <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="bill-due-date"
                    type="date"
                    className="pl-9"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bill-category">Category (Optional)</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="bill-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="flex items-center">
                          {category.icon && <span className="mr-2">{category.icon}</span>}
                          {category.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="merchant-name">Merchant/Payee (Optional)</Label>
                <Input
                  id="merchant-name"
                  placeholder="e.g., Meralco, PLDT"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bill-notes">Notes (Optional)</Label>
              <Textarea
                id="bill-notes"
                placeholder="Add any notes about this bill..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Recurrence Settings */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Repeat className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="is-recurring" className="cursor-pointer">
                  Recurring Bill
                </Label>
              </div>
              <Switch
                id="is-recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
            </div>

            {isRecurring && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="recurrence-pattern">Frequency</Label>
                  <Select
                    value={recurrencePattern}
                    onValueChange={(value) => setRecurrencePattern(value as RecurrencePattern)}
                  >
                    <SelectTrigger id="recurrence-pattern">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Biweekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurrence-end-date">End Date (Optional)</Label>
                  <Input
                    id="recurrence-end-date"
                    type="date"
                    value={recurrenceEndDate}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reminder Settings */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="reminder-enabled" className="cursor-pointer">
                  Enable Reminders
                </Label>
              </div>
              <Switch
                id="reminder-enabled"
                checked={reminderEnabled}
                onCheckedChange={setReminderEnabled}
              />
            </div>

            {reminderEnabled && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="reminder-days">Remind me (days before due date)</Label>
                <Input
                  id="reminder-days"
                  type="number"
                  min="0"
                  max="30"
                  value={reminderDaysBefore}
                  onChange={(e) => setReminderDaysBefore(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  You'll be reminded {reminderDaysBefore} day{reminderDaysBefore !== "1" ? "s" : ""}{" "}
                  before the due date
                </p>
              </div>
            )}
          </div>

          {/* Auto-Pay Settings */}
          {wallets.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="auto-pay-enabled" className="cursor-pointer">
                    Enable Auto-Pay (Coming Soon)
                  </Label>
                </div>
                <Switch
                  id="auto-pay-enabled"
                  checked={autoPayEnabled}
                  onCheckedChange={setAutoPayEnabled}
                  disabled
                />
              </div>

              {autoPayEnabled && (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="wallet-id">Payment Wallet</Label>
                  <Select value={walletId} onValueChange={setWalletId}>
                    <SelectTrigger id="wallet-id">
                      <SelectValue placeholder="Select wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.wallet_type.toUpperCase()} - {wallet.account_name || wallet.account_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Bill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
