"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import type { EWallet } from "@/lib/types"
import { Trash2 } from "lucide-react"

interface EditWalletDialogProps {
  wallet: EWallet
  userId: string
  allWallets: EWallet[]
  onSuccess: () => void
  onClose: () => void
}

export function EditWalletDialog({ wallet, userId, allWallets, onSuccess, onClose }: EditWalletDialogProps) {
  const [accountNumber, setAccountNumber] = useState(wallet.account_number)
  const [accountName, setAccountName] = useState(wallet.account_name || "")
  const [balance, setBalance] = useState(wallet.balance.toString())
  const [isPrimary, setIsPrimary] = useState(wallet.is_primary)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // If setting as primary, unset other primary wallets
      if (isPrimary && !wallet.is_primary) {
        await supabase.from("e_wallets").update({ is_primary: false }).eq("user_id", userId).eq("is_primary", true)
      }

      const { error } = await supabase
        .from("e_wallets")
        .update({
          account_number: accountNumber,
          account_name: accountName,
          balance: Number.parseFloat(balance),
          is_primary: isPrimary,
        })
        .eq("id", wallet.id)

      if (error) throw error

      onSuccess()
    } catch (error) {
      console.error("Error updating wallet:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this wallet?")) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from("e_wallets").delete().eq("id", wallet.id)

      if (error) throw error

      // If this was the primary wallet and there are others, set the first one as primary
      if (wallet.is_primary && allWallets.length > 1) {
        const nextWallet = allWallets.find((w) => w.id !== wallet.id)
        if (nextWallet) {
          await supabase.from("e_wallets").update({ is_primary: true }).eq("id", nextWallet.id)
        }
      }

      onSuccess()
    } catch (error) {
      console.error("Error deleting wallet:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage E-Wallet</DialogTitle>
          <DialogDescription>Update your {wallet.wallet_type.toUpperCase()} account details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number / Mobile Number</Label>
            <Input
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input id="accountName" value={accountName} onChange={(e) => setAccountName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="balance">Current Balance (₱)</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
            />
          </div>
          {allWallets.length > 1 && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isPrimary">Set as Primary Wallet</Label>
                <p className="text-sm text-gray-500">This wallet will be shown by default</p>
              </div>
              <input
                type="checkbox"
                id="isPrimary"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="h-4 w-4"
              />
            </div>
          )}
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
          <Button type="button" variant="destructive" className="w-full" onClick={handleDelete} disabled={isLoading}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Wallet
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
