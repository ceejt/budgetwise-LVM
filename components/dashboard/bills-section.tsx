"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Calendar, List, Check, X, Edit2, Trash2, ExternalLink, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  fetchUpcomingBills,
  fetchBillAnalytics,
  markBillAsPaid,
  deleteBill,
  formatBillStatus,
} from "@/lib/utils/bill-operations"
import { useToast } from "@/hooks/use-toast"
import type { UpcomingBill, BillAnalytics, Category, EWallet } from "@/lib/types"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from "date-fns"

// Lazy load dialogs - only loaded when user interacts
const AddBillDialog = dynamic(
  () => import("./add-bill-dialog").then((mod) => ({ default: mod.AddBillDialog })),
  { ssr: false }
)

interface BillsSectionProps {
  categories: Category[]
  wallets: EWallet[]
}

export function BillsSection({ categories, wallets }: BillsSectionProps) {
  const { toast } = useToast()
  const [bills, setBills] = useState<UpcomingBill[]>([])
  const [analytics, setAnalytics] = useState<BillAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedView, setSelectedView] = useState<"calendar" | "list">("list")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [billToDelete, setBillToDelete] = useState<string | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [billsData, analyticsData] = await Promise.all([
        fetchUpcomingBills(),
        fetchBillAnalytics(),
      ])
      setBills(billsData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error("Error loading bills:", error)
      toast({
        title: "Error",
        description: "Failed to load bills",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleMarkAsPaid = async (billId: string, billName: string) => {
    try {
      await markBillAsPaid(billId)
      toast({
        title: "Bill Marked as Paid",
        description: `${billName} has been marked as paid`,
      })
      loadData()
    } catch (error) {
      console.error("Error marking bill as paid:", error)
      toast({
        title: "Error",
        description: "Failed to mark bill as paid",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBill = async () => {
    if (!billToDelete) return

    try {
      await deleteBill(billToDelete)
      toast({
        title: "Bill Deleted",
        description: "The bill has been removed",
      })
      setBillToDelete(null)
      loadData()
    } catch (error) {
      console.error("Error deleting bill:", error)
      toast({
        title: "Error",
        description: "Failed to delete bill",
        variant: "destructive",
      })
    }
  }

  const renderCalendarView = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const getBillsForDay = (day: Date) => {
      return bills.filter((bill) => isSameDay(new Date(bill.due_date), day))
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
            >
              Next
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {Array.from({ length: monthStart.getDay() }).map((_, index) => (
            <div key={`empty-${index}`} className="border rounded-lg p-2 bg-muted/20" />
          ))}

          {/* Days of the month */}
          {daysInMonth.map((day) => {
            const dayBills = getBillsForDay(day)
            const isToday = isSameDay(day, new Date())

            return (
              <div
                key={day.toISOString()}
                className={`border rounded-lg p-2 min-h-[100px] ${
                  isToday ? "border-primary bg-primary/5" : ""
                } ${!isSameMonth(day, currentMonth) ? "bg-muted/20" : ""}`}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayBills.map((bill) => {
                    const statusInfo = formatBillStatus(bill)
                    return (
                      <div
                        key={bill.id}
                        className={`text-xs p-1 rounded truncate ${
                          bill.is_overdue
                            ? "bg-red-100 text-red-700"
                            : bill.days_until_due <= 3
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                        title={`${bill.name} - ₱${bill.amount.toLocaleString()}`}
                      >
                        {bill.name}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderListView = () => {
    if (bills.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Bills Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start tracking your bills by adding your first bill reminder
          </p>
          <AddBillDialog categories={categories} wallets={wallets} onBillAdded={loadData} />
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {bills.map((bill) => {
          const statusInfo = formatBillStatus(bill)

          return (
            <Card key={bill.id} className={bill.is_overdue ? "border-red-300" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{bill.name}</h4>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      {bill.is_recurring && (
                        <Badge variant="outline" className="text-xs">
                          Recurring
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="font-medium text-lg text-foreground">
                        ₱{bill.amount.toLocaleString()}
                      </span>
                      <span>Due: {format(new Date(bill.due_date), "MMM d, yyyy")}</span>
                      {bill.category_name && (
                        <span className="flex items-center gap-1">
                          {bill.category_icon && <span>{bill.category_icon}</span>}
                          {bill.category_name}
                        </span>
                      )}
                    </div>

                    {bill.merchant_name && (
                      <p className="text-sm text-muted-foreground mb-1">
                        Payee: {bill.merchant_name}
                      </p>
                    )}

                    {bill.notes && (
                      <p className="text-sm text-muted-foreground italic">{bill.notes}</p>
                    )}

                    {bill.is_recurring && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Repeats {bill.recurrence_pattern}
                        {bill.recurrence_end_date &&
                          ` until ${format(new Date(bill.recurrence_end_date), "MMM d, yyyy")}`}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsPaid(bill.id, bill.name)}
                      disabled={bill.status === "paid"}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Mark Paid
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setBillToDelete(bill.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bills & Reminders</CardTitle>
              <CardDescription>Track upcoming bills and payment due dates</CardDescription>
            </div>
            <AddBillDialog categories={categories} wallets={wallets} onBillAdded={loadData} />
          </div>

          {/* Analytics Summary */}
          {analytics && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Monthly Bills</p>
                <p className="text-2xl font-bold">
                  ₱{analytics.monthly_bills_total.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {analytics.monthly_bills_count} bills
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold text-green-600">{analytics.paid_count}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Unpaid</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.unpaid_count}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{analytics.overdue_count}</p>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as "calendar" | "list")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="list">
                <List className="h-4 w-4 mr-2" />
                List View
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              {isLoading ? (
                <div className="text-center py-8">Loading bills...</div>
              ) : (
                renderListView()
              )}
            </TabsContent>

            <TabsContent value="calendar">
              {isLoading ? (
                <div className="text-center py-8">Loading bills...</div>
              ) : (
                renderCalendarView()
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!billToDelete} onOpenChange={() => setBillToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this bill. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBill} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
