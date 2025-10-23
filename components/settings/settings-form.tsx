"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import type { Profile, UserPreferences } from "@/lib/types"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface SettingsFormProps {
  userId: string
  profile: Profile | null
  preferences: UserPreferences | null
}

export function SettingsForm({ userId, profile, preferences }: SettingsFormProps) {
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [universityEmail, setUniversityEmail] = useState(profile?.university_email || "")
  const [theme, setTheme] = useState(preferences?.theme || "light")
  const [currency, setCurrency] = useState(preferences?.currency || "PHP")
  const [tipFrequency, setTipFrequency] = useState(preferences?.tip_frequency || "daily")
  const [notificationsEnabled, setNotificationsEnabled] = useState(preferences?.notifications_enabled ?? true)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const supabase = createClient()
  const router = useRouter()

  const handleSaveProfile = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          university_email: universityEmail,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) throw error

      setMessage("Profile updated successfully!")
    } catch (error) {
      setMessage("Error updating profile")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const { error } = await supabase
        .from("user_preferences")
        .update({
          theme,
          currency,
          tip_frequency: tipFrequency,
          notifications_enabled: notificationsEnabled,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (error) throw error

      setMessage("Preferences updated successfully!")
    } catch (error) {
      setMessage("Error updating preferences")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard">
        <Button variant="ghost" className="mb-4" style={{ color: "#293F55" }}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      {message && (
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: message.includes("Error") ? "#FEE2E2" : "#D1FAE5",
            color: message.includes("Error") ? "#991B1B" : "#065F46",
          }}
        >
          {message}
        </div>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: "#293F55" }}>Profile Information</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile?.email || ""} disabled />
            <p className="text-sm text-gray-500">Email cannot be changed</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="userType">User Type</Label>
            <Input id="userType" value={profile?.user_type || ""} disabled />
            <p className="text-sm text-gray-500">User type cannot be changed</p>
          </div>
          {profile?.user_type === "student" && (
            <div className="space-y-2">
              <Label htmlFor="universityEmail">University Email (Optional)</Label>
              <Input
                id="universityEmail"
                type="email"
                value={universityEmail}
                onChange={(e) => setUniversityEmail(e.target.value)}
              />
            </div>
          )}
          <Button
            onClick={handleSaveProfile}
            disabled={isLoading}
            className="text-white"
            style={{ backgroundColor: "#72ADFD" }}
          >
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: "#293F55" }}>Preferences</CardTitle>
          <CardDescription>Customize your BudgetWise experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PHP">PHP (₱)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipFrequency">Financial Tips Frequency</Label>
            <Select value={tipFrequency} onValueChange={setTipFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Notifications</Label>
              <p className="text-sm text-gray-500">Receive notifications about your budget</p>
            </div>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
              style={
                {
                  "--switch-checked-bg": "#72ADFD",
                } as React.CSSProperties
              }
            />
          </div>
          <Button
            onClick={handleSavePreferences}
            disabled={isLoading}
            className="text-white"
            style={{ backgroundColor: "#72ADFD" }}
          >
            {isLoading ? "Saving..." : "Save Preferences"}
          </Button>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: "#293F55" }}>Account Actions</CardTitle>
          <CardDescription>Manage your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={async () => {
              await supabase.auth.signOut()
              router.push("/")
            }}
            style={{ borderColor: "#E0E0E0", color: "#293F55" }}
          >
            Sign Out
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                // Implement account deletion
                alert("Account deletion feature coming soon")
              }
            }}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
