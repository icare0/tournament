'use client'

import { X, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Match {
  id: string
  name: string
  startTime: Date
  requiresCheckIn: boolean
  isCheckedIn: boolean
}

interface CheckInBannerProps {
  matches: Match[]
}

export function CheckInBanner({ matches }: CheckInBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)

  // Find the most urgent match requiring check-in
  const urgentMatch = matches
    .filter((m) => m.requiresCheckIn && !m.isCheckedIn)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0]

  useEffect(() => {
    if (!urgentMatch) return

    const updateTime = () => {
      const now = new Date().getTime()
      const matchStart = new Date(urgentMatch.startTime).getTime()
      setTimeRemaining(matchStart - now)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [urgentMatch])

  const formatTime = (ms: number) => {
    if (ms <= 0) return '0m'
    const minutes = Math.floor(ms / 1000 / 60)
    const seconds = Math.floor((ms / 1000) % 60)
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
  }

  if (!urgentMatch || isDismissed || timeRemaining <= 0) {
    return null
  }

  // Show banner if match starts in less than 15 minutes
  const shouldShow = timeRemaining <= 15 * 60 * 1000

  if (!shouldShow) return null

  const isVeryUrgent = timeRemaining <= 5 * 60 * 1000

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-40 ${
        isVeryUrgent ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-bloom-accent'
      } text-white shadow-lg animate-fade-in`}
    >
      {isVeryUrgent && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-pulse opacity-30" />
      )}

      <div className="relative container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <AlertTriangle className={`h-5 w-5 ${isVeryUrgent ? 'animate-pulse' : ''}`} />
            <div className="flex-1">
              <p className="font-sans text-sm font-medium">
                {isVeryUrgent ? '🚨 CHECK-IN URGENT !' : 'Check-in Requis'}
              </p>
              <p className="font-sans text-xs opacity-90">
                {urgentMatch.name} • Commence dans {formatTime(timeRemaining)}
              </p>
            </div>
          </div>

          <Link
            href={`/dashboard/matches/${urgentMatch.id}`}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-sans text-sm font-medium transition-colors"
          >
            Check-in Maintenant
          </Link>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
