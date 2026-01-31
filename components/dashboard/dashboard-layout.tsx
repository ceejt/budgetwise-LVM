"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  Plus,
  Wallet,
  Award,
  Star,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Profile } from "@/lib/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  profile: Profile | null;
}

export function DashboardLayout({ children, profile }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Navigation items with icons
  const navigationItems = [
    { icon: Wallet, label: "Campus Cash", href: "#" },
    { icon: Award, label: "Badge", href: "#" },
    { icon: Star, label: "Points", href: "#" },
    { icon: TrendingUp, label: "Progress", href: "#" },
  ];

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#F5F5F5" }}>
      {/* Left Sidebar */}
      <div
        className={`relative flex flex-col bg-white border-r transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
        style={{ borderColor: "#E0E0E0" }}
      >
        {/* Collapse Button - Fixed positioning */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-4 -right-3 z-50 bg-white border rounded-full p-1 shadow-sm hover:bg-gray-50 transition-colors"
          style={{ borderColor: "#E0E0E0" }}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" style={{ color: "#293F55" }} />
          ) : (
            <ChevronLeft className="h-4 w-4" style={{ color: "#293F55" }} />
          )}
        </button>

        <div className="flex-1 flex flex-col p-4 overflow-hidden">
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
                <span
                  className="text-xl font-bold"
                  style={{ color: "#293F55" }}
                >
                  BW
                </span>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <Avatar
                className="h-12 w-12 flex-shrink-0"
                style={{ backgroundColor: "#72ADFD" }}
              >
                <AvatarFallback className="text-white">
                  {getInitials(profile?.full_name || null)}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold truncate"
                    style={{ color: "#293F55" }}
                  >
                    {profile?.full_name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {profile?.email}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Add Widget Button */}
          <Button
            variant="outline"
            className={`mb-6 bg-transparent ${isCollapsed ? "px-0 justify-center" : "justify-start"}`}
            style={{ borderColor: "#E0E0E0", color: "#293F55" }}
            title={isCollapsed ? "Add Widget" : undefined}
          >
            <Plus className={`h-4 w-4 ${isCollapsed ? "" : "mr-2"}`} />
            {!isCollapsed && "Add Widget"}
          </Button>

          {/* Navigation Items with Icons */}
          <div className="flex-1 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`w-full px-4 py-3 rounded-lg text-sm transition-colors hover:bg-gray-100 flex items-center ${
                    isCollapsed ? "justify-center" : "justify-start"
                  }`}
                  style={{ backgroundColor: "#F5F5F5", color: "#293F55" }}
                  title={isCollapsed ? item.label : undefined}
                  onClick={() => {
                    // Handle navigation here
                    console.log(`Navigate to ${item.label}`);
                  }}
                >
                  <Icon className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Settings */}
          <Link href="/settings">
            <Button
              variant="ghost"
              className={`w-full mb-2 ${isCollapsed ? "px-0 justify-center" : "justify-start"}`}
              style={{ color: "#293F55" }}
              title={isCollapsed ? "Settings" : undefined}
            >
              <Settings className={`h-4 w-4 ${isCollapsed ? "" : "mr-2"}`} />
              {!isCollapsed && "Settings"}
            </Button>
          </Link>

          {/* Logout */}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`w-full ${isCollapsed ? "px-0 justify-center" : "justify-start"}`}
            style={{ color: "#293F55" }}
            title={isCollapsed ? "Log out" : undefined}
          >
            <LogOut className={`h-4 w-4 ${isCollapsed ? "" : "mr-2"}`} />
            {!isCollapsed && "Log out"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  );
}
