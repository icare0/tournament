'use client'

import { useState, useEffect } from 'react'
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CheckInCountdownProps {
  matchId: string
  matchStartTime: Date
  checkInWindowMinutes?: number
  isCheckedIn: boolean
  onCheckIn: () => void
}

export function CheckInCountdown({
  matchId,
  matchStartTime,
  checkInWindowMinutes = 15,
  isCheckedIn,
  onCheckIn,
}: CheckInCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime()
      const matchStart = new Date(matchStartTime).getTime()
      const checkInStart = matchStart - checkInWindowMinutes * 60 * 1000
      const remaining = matchStart - now

      setTimeRemaining(remaining)

      // Check-in window opens X minutes before match
      const isWindowOpen = now >= checkInStart && now < matchStart
      setCheckInOpen(isWindowOpen)

      // Mark as urgent in last 5 minutes
      setIsUrgent(isWindowOpen && remaining <= 5 * 60 * 1000)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [matchStartTime, checkInWindowMinutes])

  const formatTime = (ms: number) => {
    if (ms <= 0) return 'Match Started'

    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  // If already checked in
  if (isCheckedIn) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border-2 border-green-200">
        <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
          <CheckCircle2 className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-sans text-sm font-medium text-green-700">
            Check-in Confirmé
          </p>
          <p className="font-sans text-xs text-green-600">
            Match dans {formatTime(timeRemaining)}
          </p>
        </div>
      </div>
    )
  }

  // If check-in window is open
  if (checkInOpen) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
          isUrgent
            ? 'bg-red-50 border-red-300 animate-pulse'
            : 'bg-bloom-accent/10 border-bloom-accent/30'
        }`}
      >
        {/* Urgent gradient bar */}
        {isUrgent && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />
        )}

        <div className="p-5">
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                isUrgent ? 'bg-red-500 animate-pulse' : 'bg-bloom-accent'
              }`}
            >
              {isUrgent ? (
                <AlertTriangle className="h-6 w-6 text-white" />
              ) : (
                <Clock className="h-6 w-6 text-white" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={`font-serif text-xl italic ${
                    isUrgent ? 'text-red-700' : 'text-bloom-dark'
                  }`}
                >
                  {isUrgent ? 'Check-in Urgent !' : 'Check-in Requis'}
                </h3>
                {isUrgent && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-sans font-medium animate-pulse">
                    URGENT
                  </span>
                )}
              </div>
              <p
                className={`font-sans text-sm ${
                  isUrgent ? 'text-red-600 font-medium' : 'text-bloom-dark/70'
                }`}
              >
                {isUrgent
                  ? 'Ton match commence très bientôt ! Check-in maintenant ou tu seras disqualifié.'
                  : 'Confirme ta présence pour participer au match.'}
              </p>
            </div>
          </div>

          {/* Countdown */}
          <div className="mb-4 p-3 rounded-lg bg-white/50 border border-bloom-dark/5">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs uppercase tracking-wider text-bloom-dark/60">
                Match dans
              </span>
              <span
                className={`font-sans text-2xl font-bold ${
                  isUrgent ? 'text-red-600' : 'text-bloom-dark'
                }`}
              >
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>

          {/* Check-in Button */}
          <Button
            onClick={onCheckIn}
            className={`w-full py-6 text-base font-sans uppercase tracking-wider transition-all duration-300 ${
              isUrgent
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                : 'bg-bloom-dark hover:bg-bloom-accent text-bloom-bg'
            }`}
          >
            {isUrgent ? '⚠️ Check-in Maintenant !' : 'Confirmer ma Présence'}
          </Button>

          <p className="mt-3 text-center font-sans text-xs text-bloom-dark/40">
            Tu dois check-in avant le début du match
          </p>
        </div>
      </div>
    )
  }

  // Before check-in window
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-bloom-dark/5 border border-bloom-dark/10">
      <Clock className="h-5 w-5 text-bloom-dark/40" />
      <div className="flex-1">
        <p className="font-sans text-sm text-bloom-dark/70">
          Check-in disponible dans {formatTime(timeRemaining - checkInWindowMinutes * 60 * 1000)}
        </p>
        <p className="font-sans text-xs text-bloom-dark/40">
          Le check-in ouvre {checkInWindowMinutes} min avant le match
        </p>
      </div>
    </div>
  )
}
