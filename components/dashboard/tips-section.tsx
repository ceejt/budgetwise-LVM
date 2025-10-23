"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { FinancialTip } from "@/lib/types"
import Link from "next/link"

interface TipsSectionProps {
  userId: string
}

export function TipsSection({ userId }: TipsSectionProps) {
  const [tips, setTips] = useState<FinancialTip[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchTips()
    generatePersonalizedTips()
  }, [userId])

  const fetchTips = async () => {
    const { data } = await supabase
      .from("financial_tips")
      .select("*")
      .eq("user_id", userId)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(2)

    if (data) setTips(data)
  }

  const generatePersonalizedTips = async () => {
    const { data: transactions } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "expense")

    const { data: existingTips } = await supabase.from("financial_tips").select("*").eq("user_id", userId)

    if (!transactions || (existingTips && existingTips.length > 0)) return

    // Calculate spending patterns
    const categorySpending = transactions.reduce(
      (acc, t) => {
        const cat = t.category_name || "Other"
        acc[cat] = (acc[cat] || 0) + Number(t.amount)
        return acc
      },
      {} as Record<string, number>,
    )

    const totalSpending = Object.values(categorySpending).reduce((sum, val) => sum + val, 0)
    const highestCategory = Object.entries(categorySpending).sort(([, a], [, b]) => b - a)[0]

    // Generate tips based on spending
    const personalizedTips = []

    if (highestCategory && highestCategory[1] / totalSpending > 0.4) {
      personalizedTips.push({
        user_id: userId,
        tip_text: `You're spending ${((highestCategory[1] / totalSpending) * 100).toFixed(0)}% of your budget on ${highestCategory[0]}. Consider setting a limit for this category.`,
        tip_type: "spending" as const,
        is_read: false,
      })
    }

    if (totalSpending > 0) {
      personalizedTips.push({
        user_id: userId,
        tip_text: "Try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings.",
        tip_type: "saving" as const,
        is_read: false,
      })
    }

    personalizedTips.push({
      user_id: userId,
      tip_text: "Look for part-time jobs or side gigs to earn extra income.",
      tip_type: "income" as const,
      is_read: false,
    })

    personalizedTips.push({
      user_id: userId,
      tip_text: "Save a small portion of any money you receive, even if it's just ₱10.",
      tip_type: "saving" as const,
      is_read: false,
    })

    if (personalizedTips.length > 0) {
      await supabase.from("financial_tips").insert(personalizedTips)
      fetchTips()
    }
  }

  const markAsRead = async (id: string) => {
    await supabase.from("financial_tips").update({ is_read: true }).eq("id", id)
    fetchTips()
  }

  const defaultTips = [
    "Look for part-time jobs or side gigs to earn extra income.",
    "Save a small portion of any money you receive, even if it's just ₱10.",
  ]

  const displayTips = tips.length > 0 ? tips : defaultTips.map((text, i) => ({ id: `default-${i}`, tip_text: text }))

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💡</span>
        <h2 className="text-2xl font-semibold" style={{ color: "#293F55" }}>
          Tips
        </h2>
      </div>
      <div className="space-y-3">
        {displayTips.slice(0, 2).map((tip, index) => (
          <div key={tip.id || index} className="flex gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: "#72ADFD" }}
            >
              <span className="text-white text-xs font-bold">{index + 1}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm" style={{ color: "#293F55" }}>
                {tip.tip_text}
              </p>
              {tip.id && !tip.id.startsWith("default") && (
                <button onClick={() => markAsRead(tip.id)} className="text-xs mt-1" style={{ color: "#72ADFD" }}>
                  Mark as read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <Link href="/tips">
        <button className="text-sm mt-4" style={{ color: "#72ADFD" }}>
          See more →
        </button>
      </Link>
    </div>
  )
}
