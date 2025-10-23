"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Settings, LogOut, Plus } from "lucide-react"
import type { Profile } from "@/lib/types"

interface DashboardLayoutProps {
  children: React.ReactNode
  profile: Profile
}

export function DashboardLayout({ children, profile }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F5F5F5" }}>
      {/* Left Sidebar */}
      <div className="w-64 bg-white p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: "#293F55" }}>
            BUDGETWISE
          </h1>
          <p className="text-xs text-gray-500">Track Smart. Spend Wise</p>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
            style={{ backgroundColor: "#E0E0E0" }}
          >
            <span className="text-4xl">👤</span>
          </div>
          <h2 className="font-semibold" style={{ color: "#293F55" }}>
            {profile.full_name}
          </h2>
        </div>

        <Button
          variant="outline"
          className="w-full mb-6 justify-start bg-transparent"
          style={{ borderColor: "#E0E0E0", color: "#293F55" }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Widget
        </Button>

        <nav className="flex-1 space-y-2">
          <Button variant="ghost" className="w-full justify-start" style={{ color: "#293F55" }}>
            Campus Cash
          </Button>
          <Button variant="ghost" className="w-full justify-start" style={{ color: "#293F55" }}>
            Badge
          </Button>
          <Button variant="ghost" className="w-full justify-start" style={{ color: "#293F55" }}>
            Points
          </Button>
          <Button variant="ghost" className="w-full justify-start" style={{ color: "#293F55" }}>
            Progress
          </Button>
        </nav>

        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" style={{ color: "#293F55" }}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start" style={{ color: "#293F55" }}>
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {children}
    </div>
  )
}
