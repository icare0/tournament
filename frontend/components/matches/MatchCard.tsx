'use client'

import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Clock, Trophy, Users, CheckCircle2, Circle } from 'lucide-react'
import Link from 'next/link'

interface MatchCardProps {
  match: {
    id: string
    tournament: {
      name: string
      game: string
    }
    opponent: {
      name: string
      avatar?: string
    }
    startTime: Date
    status: 'upcoming' | 'live' | 'completed'
    isCheckedIn: boolean
    requiresCheckIn: boolean
    result?: {
      won: boolean
      score: string
    }
  }
}

export function MatchCard({ match }: MatchCardProps) {
  const statusConfig = {
    upcoming: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      label: 'À venir',
    },
    live: {
      bg: 'bg-green-50',
      border: 'border-green-300',
      text: 'text-green-700',
      label: 'En cours',
    },
    completed: {
      bg: 'bg-bloom-dark/5',
      border: 'border-bloom-dark/10',
      text: 'text-bloom-dark/70',
      label: 'Terminé',
    },
  }

  const config = statusConfig[match.status]

  return (
    <Link href={`/dashboard/matches/${match.id}`}>
      <div
        className={`group p-6 rounded-xl border-2 ${config.border} ${config.bg} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className={`h-4 w-4 ${config.text}`} />
              <h3 className="font-serif text-lg italic text-bloom-dark group-hover:text-bloom-accent transition-colors">
                {match.tournament.name}
              </h3>
            </div>
            <p className="font-sans text-xs text-bloom-dark/50">{match.tournament.game}</p>
          </div>

          <span
            className={`px-3 py-1 rounded-full ${config.bg} border ${config.border} font-sans text-xs font-medium ${config.text}`}
          >
            {config.label}
          </span>
        </div>

        {/* Opponent */}
        <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-white/50">
          <div className="w-10 h-10 bg-bloom-dark/10 rounded-full flex items-center justify-center">
            {match.opponent.avatar ? (
              <img
                src={match.opponent.avatar}
                alt={match.opponent.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <Users className="h-5 w-5 text-bloom-dark/40" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-sans text-sm font-medium text-bloom-dark">VS</p>
            <p className="font-sans text-base font-medium text-bloom-dark">
              {match.opponent.name}
            </p>
          </div>
        </div>

        {/* Time / Check-in Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-bloom-dark/40" />
            <span className="font-sans text-sm text-bloom-dark/70">
              {match.status === 'completed'
                ? formatDistanceToNow(new Date(match.startTime), {
                    addSuffix: true,
                    locale: fr,
                  })
                : formatDistanceToNow(new Date(match.startTime), {
                    addSuffix: true,
                    locale: fr,
                  })}
            </span>
          </div>

          {/* Check-in indicator */}
          {match.status === 'upcoming' && match.requiresCheckIn && (
            <div className="flex items-center gap-2">
              {match.isCheckedIn ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-sans text-xs font-medium text-green-600">Check-in OK</span>
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4 text-orange-500 animate-pulse" />
                  <span className="font-sans text-xs font-medium text-orange-600">
                    Check-in requis
                  </span>
                </>
              )}
            </div>
          )}

          {/* Result */}
          {match.status === 'completed' && match.result && (
            <div
              className={`px-3 py-1 rounded-full font-sans text-xs font-medium ${
                match.result.won
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {match.result.won ? '🏆 Victoire' : 'Défaite'} • {match.result.score}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
