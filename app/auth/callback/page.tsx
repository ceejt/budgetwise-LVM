'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        // Redirect to dashboard after successful login
        router.push('/dashboard')
      } else {
        // If no session, return to sign-in
        router.push('/auth/signin')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p className="text-gray-600">Finishing sign-in…</p>
    </div>
  )
}
