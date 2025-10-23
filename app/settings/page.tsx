import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsForm } from "@/components/settings/settings-form"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/signin")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: preferences } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single()

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F5F5" }}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold" style={{ color: "#293F55" }}>
            Settings
          </h1>
          <p className="text-gray-500">Manage your account and preferences</p>
        </div>

        <SettingsForm userId={user.id} profile={profile} preferences={preferences} />
      </div>
    </div>
  )
}
