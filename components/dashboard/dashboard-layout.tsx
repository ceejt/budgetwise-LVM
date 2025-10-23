"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight, Settings, LogOut, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Profile } from "@/lib/types"

interface DashboardLayoutProps {
  children: React.ReactNode
  profile: Profile | null
}

export function DashboardLayout({ children, profile }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#F5F5F5" }}>
      {/* Left Sidebar */}
      <div
        className={`flex flex-col bg-white border-r transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}
        style={{ borderColor: "#E0E0E0" }}
      >
        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-4 -right-3 z-10 bg-white border rounded-full p-1 shadow-sm hover:bg-gray-50"
          style={{ borderColor: "#E0E0E0" }}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" style={{ color: "#293F55" }} />
          ) : (
            <ChevronLeft className="h-4 w-4" style={{ color: "#293F55" }} />
          )}
        </button>

        <div className="flex-1 flex flex-col p-6">
          {/* Logo */}
          <div className="mb-8">
            {!isCollapsed ? (
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "#293F55" }}>
                  BUDGETWISE
                </h1>
                <p className="text-xs" style={{ color: "#293F55" }}>
                  Track Smart. Spend Wise
                </p>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-xl font-bold" style={{ color: "#293F55" }}>
                  BW
                </span>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12" style={{ backgroundColor: "#72ADFD" }}>
                <AvatarFallback className="text-white">{getInitials(profile?.full_name || null)}</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate" style={{ color: "#293F55" }}>
                    {profile?.full_name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Add Widget Button */}
          <Button
            variant="outline"
            className="mb-6 justify-start bg-transparent"
            style={{ borderColor: "#E0E0E0", color: "#293F55" }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {!isCollapsed && "Add Widget"}
          </Button>

          {/* Navigation Items */}
          <div className="flex-1 space-y-2">
            <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "#F5F5F5", color: "#293F55" }}>
              {!isCollapsed ? "Campus Cash" : "CC"}
            </div>
            <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "#F5F5F5", color: "#293F55" }}>
              {!isCollapsed ? "Badge" : "B"}
            </div>
            <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "#F5F5F5", color: "#293F55" }}>
              {!isCollapsed ? "Points" : "P"}
            </div>
            <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "#F5F5F5", color: "#293F55" }}>
              {!isCollapsed ? "Progress" : "Pr"}
            </div>
          </div>

          {/* Settings */}
          <Link href="/settings">
            <Button variant="ghost" className="w-full justify-start mb-2" style={{ color: "#293F55" }}>
              <Settings className="h-4 w-4 mr-2" />
              {!isCollapsed && "Settings"}
            </Button>
          </Link>

          {/* Logout */}
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start" style={{ color: "#293F55" }}>
            <LogOut className="h-4 w-4 mr-2" />
            {!isCollapsed && "Log out"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  )
}
