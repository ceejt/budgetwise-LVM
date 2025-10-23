"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/demo/dashboard-layout";
import { ExpensesSection } from "@/components/dashboard/demo/expenses-section";
import { GoalsSection } from "@/components/dashboard/demo/goals-section";
import { CalendarSection } from "@/components/dashboard/demo/calendar-section";
import { TipsSection } from "@/components/dashboard/demo/tips-section";
import { IncomeSection } from "@/components/dashboard/demo/income-section";
import { SummarySection } from "@/components/dashboard/demo/summary-section";
import type {
  Transaction,
  Goal,
  Category,
  CalendarTask,
  Wallet,
} from "@/lib/types";

export default function DemoPage() {
  const mockProfile = {
    id: "demo-user-123",
    email: "demo@student.edu",
    full_name: "CJ Tinae",
    user_type: "student",
    currency: "PHP",
    theme: "light",
    tip_frequency: "daily",
    notifications_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const [expenses, setExpenses] = useState<Transaction[]>([
    {
      id: "1",
      user_id: "demo-user-123",
      type: "expense",
      amount: 75,
      category_id: "cat-1",
      category_name: "Food",
      description: "Lunch at Kawayanan",
      date: "2025-10-24",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      user_id: "demo-user-123",
      type: "expense",
      amount: 20,
      category_id: "cat-2",
      category_name: "Transportation",
      description: "Jeepney fare",
      date: "2025-10-24",
      created_at: new Date().toISOString(),
    },
  ]);

  const [income, setIncome] = useState<Transaction[]>([
    {
      id: "inc-1",
      user_id: "demo-user-123",
      type: "income",
      amount: 8000,
      category_id: null,
      category_name: "Scholarship",
      description: "DOST-SEI Scholarship",
      date: "2025-10-24",
      created_at: new Date().toISOString(),
    },
    {
      id: "inc-2",
      user_id: "demo-user-123",
      type: "income",
      amount: 5000,
      category_id: null,
      category_name: "Allowance",
      description: "Monthly allowance",
      date: "2025-10-01",
      created_at: new Date().toISOString(),
    },
  ]);

  const [categories, setCategories] = useState<Category[]>([
    {
      id: "cat-1",
      user_id: "demo-user-123",
      name: "Food",
      icon: "🍔",
      color: "#293F55",
      budget_amount: 400,
      created_at: new Date().toISOString(),
    },
    {
      id: "cat-2",
      user_id: "demo-user-123",
      name: "Transportation",
      icon: "🚌",
      color: "#72ADFD",
      budget_amount: 200,
      created_at: new Date().toISOString(),
    },
    {
      id: "cat-3",
      user_id: "demo-user-123",
      name: "Grocery",
      icon: "🛒",
      color: "#50C878",
      budget_amount: 1500,
      created_at: new Date().toISOString(),
    },
    {
      id: "cat-4",
      user_id: "demo-user-123",
      name: "Orders",
      icon: "📦",
      color: "#FFB347",
      budget_amount: 200,
      created_at: new Date().toISOString(),
    },
  ]);

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "goal-1",
      user_id: "demo-user-123",
      name: "Weekly Savings",
      type: "weekly",
      target_amount: 500,
      current_amount: 250,
      start_date: "2025-01-06",
      end_date: "2025-01-12",
      status: "active",
      created_at: new Date().toISOString(),
    },
    {
      id: "goal-2",
      user_id: "demo-user-123",
      name: "Scholarship",
      type: "monthly",
      target_amount: 4000,
      current_amount: 2500,
      start_date: "2025-01-01",
      end_date: "2025-01-31",
      status: "active",
      created_at: new Date().toISOString(),
    },
  ]);

  const [tasks, setTasks] = useState<CalendarTask[]>([
    {
      id: "task-1",
      user_id: "demo-user-123",
      title: "Pay tuition fee",
      date: "2025-01-15",
      completed: false,
      created_at: new Date().toISOString(),
    },
  ]);

  const [wallets, setWallets] = useState<Wallet[]>([
    {
      id: "wallet-1",
      user_id: "demo-user-123",
      provider: "gcash",
      account_number: "0917 193 7051",
      account_name: "CJ Tinae",
      balance: 2000,
      is_primary: true,
      created_at: new Date().toISOString(),
    },
  ]);

  return (
    <DashboardLayout profile={mockProfile}>
      <div className="flex-1 flex gap-6 p-6 overflow-auto">
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          <ExpensesSection
            expenses={expenses}
            setExpenses={setExpenses}
            categories={categories}
          />
          <GoalsSection
            goals={goals}
            setGoals={setGoals}
            categories={categories}
            setCategories={setCategories}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CalendarSection tasks={tasks} setTasks={setTasks} />
            <div className="flex flex-col gap-6">
              <TipsSection expenses={expenses} />
              <IncomeSection
                income={income}
                setIncome={setIncome}
                categories={categories}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 flex-shrink-0">
          <SummarySection
            expenses={expenses}
            income={income}
            goals={goals}
            wallets={wallets}
            setWallets={setWallets}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
