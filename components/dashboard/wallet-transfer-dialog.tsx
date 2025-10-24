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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { transferBetweenWallets } from "@/lib/utils/wallet-operations"
import type { EWallet } from "@/lib/types"
import { ArrowRightLeft } from "lucide-react"

interface WalletTransferDialogProps {
  userId: string
  onSuccess: () => void
}

export function WalletTransferDialog({ userId, onSuccess }: WalletTransferDialogProps) {
  const [open, setOpen] = useState(false)
  const [wallets, setWallets] = useState<EWallet[]>([])
  const [fromWalletId, setFromWalletId] = useState("")
  const [toWalletId, setToWalletId] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchWallets()
    }
  }, [open])

  const fetchWallets = async () => {
    const { data } = await supabase
      .from("e_wallets")
      .select("*")
      .eq("user_id", userId)
      .order("is_primary", { ascending: false })

    if (data) {
      setWallets(data)
    }
  }

  const fromWallet = wallets.find((w) => w.id === fromWalletId)
  const toWallet = wallets.find((w) => w.id === toWalletId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate that from and to wallets are different
      if (fromWalletId === toWalletId) {
        alert("Please select different wallets for transfer")
        setIsLoading(false)
        return
      }

      // Validate sufficient balance
      if (fromWallet && Number.parseFloat(amount) > fromWallet.balance) {
        alert(
          `Insufficient balance in ${fromWallet.wallet_type.toUpperCase()}. Available: ₱${fromWallet.balance.toFixed(2)}`
        )
        setIsLoading(false)
        return
      }

      await transferBetweenWallets({
        userId,
        fromWalletId,
        toWalletId,
        amount: Number.parseFloat(amount),
        description: description || "Wallet Transfer",
        date,
      })

      // Reset form
      setAmount("")
      setFromWalletId("")
      setToWalletId("")
      setDescription("")
      setDate(new Date().toISOString().split("T")[0])
      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error("Error transferring between wallets:", error)
      alert("Failed to transfer. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const availableWallets = wallets.length >= 2
  const availableToWallets = wallets.filter((w) => w.id !== fromWalletId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full"
          style={{ borderColor: "#72ADFD", color: "#293F55" }}
        >
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          Transfer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" style={{ color: "#72ADFD" }} />
            Transfer Between Wallets
          </DialogTitle>
          <DialogDescription>
            Move money from one wallet to another
          </DialogDescription>
        </DialogHeader>

        {!availableWallets ? (
          <div className="py-8 text-center">
            <p className="text-gray-500 mb-4">
              You need at least 2 wallets to make a transfer
            </p>
            <p className="text-sm text-gray-400">
              Add more wallets in the Summary section to enable transfers
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="from-wallet">From Wallet</Label>
              <Select value={fromWalletId} onValueChange={setFromWalletId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select source wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.wallet_type.toUpperCase()} - {wallet.account_number}
                      <span className="text-xs text-gray-500 ml-2">
                        (Balance: ₱{wallet.balance.toFixed(2)})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fromWallet && (
                <p className="text-xs text-gray-500">
                  Available balance: ₱{fromWallet.balance.toFixed(2)}
                </p>
              )}
            </div>

            <div className="flex justify-center py-2">
              <ArrowRightLeft
                className="h-6 w-6 transform rotate-90"
                style={{ color: "#72ADFD" }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="to-wallet">To Wallet</Label>
              <Select
                value={toWalletId}
                onValueChange={setToWalletId}
                disabled={!fromWalletId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination wallet" />
                </SelectTrigger>
                <SelectContent>
                  {availableToWallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.wallet_type.toUpperCase()} - {wallet.account_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {toWallet && (
                <p className="text-xs text-gray-500">
                  Current balance: ₱{toWallet.balance.toFixed(2)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₱)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={fromWallet?.balance}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="e.g., Emergency fund transfer, Bill payment preparation"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {fromWallet && toWallet && amount && (
              <div
                className="p-3 rounded-lg text-sm"
                style={{ backgroundColor: "#F0F7FF", color: "#293F55" }}
              >
                <p className="font-medium mb-1">Transfer Summary:</p>
                <p>
                  ₱{Number.parseFloat(amount).toFixed(2)} from{" "}
                  {fromWallet.wallet_type.toUpperCase()} to{" "}
                  {toWallet.wallet_type.toUpperCase()}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  New {fromWallet.wallet_type.toUpperCase()} balance: ₱
                  {(fromWallet.balance - Number.parseFloat(amount)).toFixed(2)}
                  <br />
                  New {toWallet.wallet_type.toUpperCase()} balance: ₱
                  {(toWallet.balance + Number.parseFloat(amount)).toFixed(2)}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
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
                {isLoading ? "Transferring..." : "Transfer Funds"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
