import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ExpensesSection } from "@/components/dashboard/expenses-section"
import { GoalsSection } from "@/components/dashboard/goals-section"
import { CalendarSection } from "@/components/dashboard/calendar-section"
import { TipsSection } from "@/components/dashboard/tips-section"
import { IncomeSection } from "@/components/dashboard/income-section"
import { SummarySection } from "@/components/dashboard/summary-section"
import { BudgetAlerts } from "@/components/dashboard/budget-alerts"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/signin")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <DashboardLayout profile={profile}>
      <div className="flex-1 flex gap-6 p-6 overflow-auto">
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Budget Alerts - Shows at top when there are warnings */}
          <BudgetAlerts userId={user.id} />

          <ExpensesSection userId={user.id} />
          <GoalsSection userId={user.id} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CalendarSection userId={user.id} />
            <div className="flex flex-col gap-6">
              <TipsSection userId={user.id} />
              <IncomeSection userId={user.id} />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 flex-shrink-0">
          <SummarySection userId={user.id} />
        </div>
      </div>
    </DashboardLayout>
  )
}
