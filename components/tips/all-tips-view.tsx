"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import type { FinancialTip } from "@/lib/types"
import Link from "next/link"
import { ArrowLeft, Check } from "lucide-react"

interface AllTipsViewProps {
  userId: string
}

export function AllTipsView({ userId }: AllTipsViewProps) {
  const [tips, setTips] = useState<FinancialTip[]>([])
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const supabase = createClient()

  useEffect(() => {
    fetchTips()
  }, [userId, filter])

  const fetchTips = async () => {
    let query = supabase
      .from("financial_tips")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (filter === "unread") {
      query = query.eq("is_read", false)
    } else if (filter === "read") {
      query = query.eq("is_read", true)
    }

    const { data } = await query

    if (data) setTips(data)
  }

  const markAsRead = async (id: string) => {
    await supabase.from("financial_tips").update({ is_read: true }).eq("id", id)
    fetchTips()
  }

  const markAllAsRead = async () => {
    await supabase.from("financial_tips").update({ is_read: true }).eq("user_id", userId).eq("is_read", false)
    fetchTips()
  }

  const getTipIcon = (type: string) => {
    switch (type) {
      case "saving":
        return "💰"
      case "spending":
        return "💳"
      case "income":
        return "💵"
      default:
        return "💡"
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-4" style={{ color: "#293F55" }}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "#293F55" }}>
              Financial Tips
            </h1>
            <p className="text-gray-500">Personalized advice based on your spending habits</p>
          </div>
          <Button onClick={markAllAsRead} className="text-white" style={{ backgroundColor: "#72ADFD" }}>
            <Check className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          className={filter === "all" ? "text-white" : "bg-transparent"}
          style={filter === "all" ? { backgroundColor: "#72ADFD" } : { borderColor: "#E0E0E0", color: "#293F55" }}
        >
          All Tips
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          onClick={() => setFilter("unread")}
          className={filter === "unread" ? "text-white" : "bg-transparent"}
          style={filter === "unread" ? { backgroundColor: "#72ADFD" } : { borderColor: "#E0E0E0", color: "#293F55" }}
        >
          Unread
        </Button>
        <Button
          variant={filter === "read" ? "default" : "outline"}
          onClick={() => setFilter("read")}
          className={filter === "read" ? "text-white" : "bg-transparent"}
          style={filter === "read" ? { backgroundColor: "#72ADFD" } : { borderColor: "#E0E0E0", color: "#293F55" }}
        >
          Read
        </Button>
      </div>

      <div className="space-y-4">
        {tips.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">
              No tips available yet. Keep tracking your expenses to get personalized advice!
            </p>
          </Card>
        ) : (
          tips.map((tip) => (
            <Card
              key={tip.id}
              className="p-6"
              style={{
                backgroundColor: tip.is_read ? "#F9FAFB" : "white",
                borderLeft: tip.is_read ? "none" : "4px solid #72ADFD",
              }}
            >
              <div className="flex gap-4">
                <div className="text-3xl">{getTipIcon(tip.tip_type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span
                        className="inline-block px-2 py-1 rounded text-xs font-medium mb-2"
                        style={{ backgroundColor: "#E0E0E0", color: "#293F55" }}
                      >
                        {tip.tip_type.charAt(0).toUpperCase() + tip.tip_type.slice(1)}
                      </span>
                    </div>
                    {!tip.is_read && (
                      <Button size="sm" variant="ghost" onClick={() => markAsRead(tip.id)} style={{ color: "#72ADFD" }}>
                        Mark as read
                      </Button>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: "#293F55" }}>
                    {tip.tip_text}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(tip.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
