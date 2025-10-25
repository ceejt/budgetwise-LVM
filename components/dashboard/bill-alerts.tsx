"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Bell, X, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { fetchBillsNeedingReminders, fetchOverdueBills } from "@/lib/utils/bill-operations"
import type { UpcomingBill } from "@/lib/types"
import { format } from "date-fns"

interface BillAlertsProps {
  onViewBills?: () => void
}

export function BillAlerts({ onViewBills }: BillAlertsProps) {
  const [upcomingBills, setUpcomingBills] = useState<UpcomingBill[]>([])
  const [overdueBills, setOverdueBills] = useState<UpcomingBill[]>([])
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBillAlerts()

    // Load dismissed alerts from localStorage
    const dismissed = localStorage.getItem("dismissedBillAlerts")
    if (dismissed) {
      setDismissedAlerts(new Set(JSON.parse(dismissed)))
    }

    // Check for new bills every 5 minutes
    const interval = setInterval(loadBillAlerts, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadBillAlerts = async () => {
    try {
      const [upcoming, overdue] = await Promise.all([
        fetchBillsNeedingReminders(),
        fetchOverdueBills(),
      ])
      setUpcomingBills(upcoming)
      setOverdueBills(overdue)
    } catch (error) {
      console.error("Error loading bill alerts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const dismissAlert = (billId: string) => {
    const newDismissed = new Set(dismissedAlerts)
    newDismissed.add(billId)
    setDismissedAlerts(newDismissed)
    localStorage.setItem("dismissedBillAlerts", JSON.stringify(Array.from(newDismissed)))
  }

  const dismissAllAlerts = () => {
    const allBillIds = [...upcomingBills, ...overdueBills].map((b) => b.id)
    const newDismissed = new Set([...dismissedAlerts, ...allBillIds])
    setDismissedAlerts(newDismissed)
    localStorage.setItem("dismissedBillAlerts", JSON.stringify(Array.from(newDismissed)))
  }

  // Filter out dismissed bills
  const visibleUpcoming = upcomingBills.filter((bill) => !dismissedAlerts.has(bill.id))
  const visibleOverdue = overdueBills.filter((bill) => !dismissedAlerts.has(bill.id))

  if (isLoading) {
    return null
  }

  // Don't show anything if no alerts
  if (visibleUpcoming.length === 0 && visibleOverdue.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Overdue Bills Alert */}
      {visibleOverdue.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            <span>
              {visibleOverdue.length} Overdue Bill{visibleOverdue.length > 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              {onViewBills && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onViewBills}
                  className="h-7 border-red-300 hover:bg-red-50"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Bills
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={dismissAllAlerts}
                className="h-7"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              {visibleOverdue.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between bg-white/10 rounded p-2"
                >
                  <div>
                    <p className="font-medium">{bill.name}</p>
                    <p className="text-sm">
                      ₱{bill.amount.toLocaleString()} - Due{" "}
                      {format(new Date(bill.due_date), "MMM d, yyyy")} (
                      {Math.abs(bill.days_until_due)} days ago)
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissAlert(bill.id)}
                    className="h-7"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Upcoming Bills Alert */}
      {visibleUpcoming.length > 0 && (
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            <span>
              {visibleUpcoming.length} Upcoming Bill{visibleUpcoming.length > 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              {onViewBills && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onViewBills}
                  className="h-7"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Bills
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={dismissAllAlerts}
                className="h-7"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              {visibleUpcoming.slice(0, 3).map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between bg-muted/50 rounded p-2"
                >
                  <div>
                    <p className="font-medium">{bill.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ₱{bill.amount.toLocaleString()} - Due{" "}
                      {format(new Date(bill.due_date), "MMM d, yyyy")}
                      {bill.days_until_due === 0 && (
                        <Badge variant="destructive" className="ml-2">
                          Due Today
                        </Badge>
                      )}
                      {bill.days_until_due > 0 && (
                        <span className="ml-2 text-xs">
                          (in {bill.days_until_due} day{bill.days_until_due > 1 ? "s" : ""})
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissAlert(bill.id)}
                    className="h-7"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {visibleUpcoming.length > 3 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  +{visibleUpcoming.length - 3} more bill{visibleUpcoming.length - 3 > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Alert */}
      {(visibleUpcoming.length > 0 || visibleOverdue.length > 0) && (
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              Total Amount Due:{" "}
              <span className="text-lg">
                ₱
                {[...visibleUpcoming, ...visibleOverdue]
                  .reduce((sum, bill) => sum + bill.amount, 0)
                  .toLocaleString()}
              </span>
            </span>
            {visibleOverdue.length > 0 && (
              <Badge variant="destructive">
                {visibleOverdue.length} Overdue
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
