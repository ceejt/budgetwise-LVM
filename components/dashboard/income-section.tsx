"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Transaction } from "@/lib/types"
import { AddTransactionDialog } from "./add-transaction-dialog"

interface IncomeSectionProps {
  userId: string
}

export function IncomeSection({ userId }: IncomeSectionProps) {
  const [income, setIncome] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchIncome()
  }, [userId])

  const fetchIncome = async () => {
    const { data } = await supabase.from("transactions").select("*").eq("user_id", userId).eq("type", "income")

    if (data) {
      setIncome(data)
      const sum = data.reduce((acc, curr) => acc + Number(curr.amount), 0)
      setTotal(sum)
    }
  }

  const scholarshipAmount = income.find((i) => i.category_name === "Scholarship")?.amount || 0
  const allowanceAmount = income.find((i) => i.category_name === "Allowance")?.amount || 0
  const otherAmount = total - scholarshipAmount - allowanceAmount

  const scholarshipPercent = total > 0 ? (scholarshipAmount / total) * 100 : 0
  const allowancePercent = total > 0 ? (allowanceAmount / total) * 100 : 0

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold" style={{ color: "#293F55" }}>
          Income
        </h2>
        <div className="flex gap-2">
          <AddTransactionDialog userId={userId} type="income" onSuccess={fetchIncome} />
          <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: "#72ADFD" }}>
            Monthly
          </span>
        </div>
      </div>
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-1">Total</div>
        <div className="text-3xl font-bold" style={{ color: "#293F55" }}>
          ₱ {total.toFixed(0)}
        </div>
      </div>
      {total > 0 && (
        <>
          <div className="flex h-8 rounded-full overflow-hidden mb-4">
            {scholarshipAmount > 0 && (
              <div
                className="flex items-center justify-center text-white text-sm font-medium"
                style={{
                  width: `${scholarshipPercent}%`,
                  backgroundColor: "#72ADFD",
                }}
              >
                {scholarshipPercent.toFixed(0)}%
              </div>
            )}
            {allowanceAmount > 0 && (
              <div
                className="flex items-center justify-center text-white text-sm font-medium"
                style={{
                  width: `${allowancePercent}%`,
                  backgroundColor: "#293F55",
                }}
              >
                {allowancePercent.toFixed(0)}%
              </div>
            )}
          </div>
          <div className="space-y-2">
            {scholarshipAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Scholarship</span>
                <span className="font-semibold" style={{ color: "#293F55" }}>
                  ₱ {scholarshipAmount.toFixed(0)}
                </span>
              </div>
            )}
            {allowanceAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Allowance</span>
                <span className="font-semibold" style={{ color: "#293F55" }}>
                  ₱ {allowanceAmount.toFixed(0)}
                </span>
              </div>
            )}
            {otherAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Other</span>
                <span className="font-semibold" style={{ color: "#293F55" }}>
                  ₱ {otherAmount.toFixed(0)}
                </span>
              </div>
            )}
          </div>
        </>
      )}
      {total === 0 && (
        <div className="text-center py-4 text-gray-500">No income added yet. Click "Add Items" to get started!</div>
      )}
    </div>
  )
}
