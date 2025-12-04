'use client'

import { useState } from 'react'
import { Swords, Clock, Trophy, Filter } from 'lucide-react'
import { MatchCard, CheckInBanner } from '@/components/matches'

// Mock data - Replace with real API calls
const MOCK_MATCHES = [
  {
    id: '1',
    tournament: {
      name: 'CS2 Spring Championship',
      game: 'Counter-Strike 2',
    },
    opponent: {
      name: 'TeamAlpha',
      avatar: '',
    },
    startTime: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    status: 'upcoming' as const,
    isCheckedIn: false,
    requiresCheckIn: true,
  },
  {
    id: '2',
    tournament: {
      name: 'Valorant Pro League',
      game: 'Valorant',
    },
    opponent: {
      name: 'ProGaming Squad',
      avatar: '',
    },
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    status: 'upcoming' as const,
    isCheckedIn: true,
    requiresCheckIn: true,
  },
  {
    id: '3',
    tournament: {
      name: 'League of Legends Cup',
      game: 'League of Legends',
    },
    opponent: {
      name: 'Dragon Warriors',
      avatar: '',
    },
    startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    status: 'live' as const,
    isCheckedIn: true,
    requiresCheckIn: true,
  },
  {
    id: '4',
    tournament: {
      name: 'Rocket League Tournament',
      game: 'Rocket League',
    },
    opponent: {
      name: 'Velocity Esports',
      avatar: '',
    },
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'completed' as const,
    isCheckedIn: true,
    requiresCheckIn: true,
    result: {
      won: true,
      score: '3-1',
    },
  },
  {
    id: '5',
    tournament: {
      name: 'Fortnite Battle Royale',
      game: 'Fortnite',
    },
    opponent: {
      name: 'Storm Chasers',
      avatar: '',
    },
    startTime: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    status: 'completed' as const,
    isCheckedIn: true,
    requiresCheckIn: true,
    result: {
      won: false,
      score: '1-2',
    },
  },
]

const FILTERS = [
  { id: 'all', label: 'Tous', icon: Swords },
  { id: 'upcoming', label: 'À venir', icon: Clock },
  { id: 'live', label: 'En cours', icon: Trophy },
  { id: 'completed', label: 'Terminés', icon: Filter },
]

export default function MatchesPage() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live' | 'completed'>('all')

  const filteredMatches =
    filter === 'all' ? MOCK_MATCHES : MOCK_MATCHES.filter((m) => m.status === filter)

  return (
    <>
      {/* Check-in Banner */}
      <CheckInBanner matches={MOCK_MATCHES} />

      <div className="min-h-screen pt-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-5xl italic text-bloom-dark mb-3">Mes Matches</h1>
          <p className="font-sans text-lg text-bloom-dark/60">
            Gère tes matches, check-in et suis tes performances.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <p className="font-sans text-sm text-blue-700 uppercase tracking-wider">À venir</p>
            </div>
            <p className="font-serif text-3xl italic text-blue-900">
              {MOCK_MATCHES.filter((m) => m.status === 'upcoming').length}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-5 w-5 text-green-600" />
              <p className="font-sans text-sm text-green-700 uppercase tracking-wider">En cours</p>
            </div>
            <p className="font-serif text-3xl italic text-green-900">
              {MOCK_MATCHES.filter((m) => m.status === 'live').length}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-bloom-accent/10 border border-bloom-accent/30">
            <div className="flex items-center gap-3 mb-2">
              <Swords className="h-5 w-5 text-bloom-accent" />
              <p className="font-sans text-sm text-bloom-accent uppercase tracking-wider">
                Victoires
              </p>
            </div>
            <p className="font-serif text-3xl italic text-bloom-dark">
              {MOCK_MATCHES.filter((m) => m.result?.won).length}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-bloom-dark/5 border border-bloom-dark/10">
            <div className="flex items-center gap-3 mb-2">
              <Filter className="h-5 w-5 text-bloom-dark/60" />
              <p className="font-sans text-sm text-bloom-dark/70 uppercase tracking-wider">Total</p>
            </div>
            <p className="font-serif text-3xl italic text-bloom-dark">{MOCK_MATCHES.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
          {FILTERS.map((f) => {
            const Icon = f.icon
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-sans text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  filter === f.id
                    ? 'bg-bloom-dark text-bloom-bg'
                    : 'bg-bloom-dark/5 text-bloom-dark/70 hover:bg-bloom-dark/10'
                }`}
              >
                <Icon className="h-4 w-4" />
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Matches Grid */}
        {filteredMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-bloom-dark/5 rounded-full flex items-center justify-center mb-4">
              <Swords className="h-8 w-8 text-bloom-dark/30" />
            </div>
            <p className="font-serif text-xl italic text-bloom-dark/60 mb-2">Aucun match</p>
            <p className="font-sans text-sm text-bloom-dark/40">
              {filter === 'all'
                ? 'Inscris-toi à un tournoi pour commencer à jouer !'
                : `Aucun match ${FILTERS.find((f) => f.id === filter)?.label.toLowerCase()}`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
