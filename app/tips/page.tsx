import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AllTipsView } from "@/components/tips/all-tips-view"

export default async function TipsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F5F5" }}>
      <AllTipsView userId={user.id} />
    </div>
  )
}
