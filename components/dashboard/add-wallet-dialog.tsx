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

interface AddWalletDialogProps {
  userId: string
  onSuccess: () => void
}

export function AddWalletDialog({ userId, onSuccess }: AddWalletDialogProps) {
  const [open, setOpen] = useState(false)
  const [walletType, setWalletType] = useState<"gcash" | "maya" | "other">("gcash")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [balance, setBalance] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Check if this is the first wallet
      const { data: existingWallets } = await supabase.from("e_wallets").select("*").eq("user_id", userId)

      const { error } = await supabase.from("e_wallets").insert({
        user_id: userId,
        wallet_type: walletType,
        account_number: accountNumber,
        account_name: accountName,
        balance: Number.parseFloat(balance) || 0,
        is_primary: !existingWallets || existingWallets.length === 0,
      })

      if (error) throw error

      setOpen(false)
      setAccountNumber("")
      setAccountName("")
      setBalance("")
      onSuccess()
    } catch (error) {
      console.error("Error adding wallet:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="text-white" style={{ backgroundColor: "#72ADFD" }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Wallet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add E-Wallet</DialogTitle>
          <DialogDescription>Connect your GCash or Maya account</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="walletType">Wallet Type</Label>
            <Select value={walletType} onValueChange={(v) => setWalletType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gcash">GCash</SelectItem>
                <SelectItem value="maya">Maya</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number / Mobile Number</Label>
            <Input
              id="accountNumber"
              placeholder="09XX XXX XXXX"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              placeholder="Juan Dela Cruz"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="balance">Current Balance (₱)</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full text-white"
            style={{ backgroundColor: "#72ADFD" }}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Wallet"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
