'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const refresh = searchParams.get('refresh')
  const error = searchParams.get('error')

  useEffect(() => {
    if (error) {
      // Redirect to login with error message
      router.push(`/login?error=${error}`)
      return
    }

    if (token && refresh) {
      // Store tokens in localStorage
      localStorage.setItem('accessToken', token)
      localStorage.setItem('refreshToken', refresh)

      // Redirect to dashboard
      router.push('/dashboard')
    } else {
      // No token, redirect to login with error
      router.push('/login?error=oauth_failed')
    }
  }, [token, refresh, error, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bloom-bg">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-bloom-accent mx-auto mb-4" />
        <p className="font-sans text-bloom-dark/60">Connexion en cours...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bloom-bg">
        <Loader2 className="h-12 w-12 animate-spin text-bloom-accent" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
