'use client'

import { useState } from 'react'
import { use } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Trophy, Calendar, MapPin, Users, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { CheckInCountdown } from '@/components/matches'
import { useNotificationStore } from '@/lib/stores/useNotificationStore'

// Mock match data - Replace with real API call
const getMockMatch = (id: string) => ({
  id,
  tournament: {
    id: 't1',
    name: 'CS2 Spring Championship',
    game: 'Counter-Strike 2',
    format: 'Best of 3',
    rules: 'Standard competitive rules. No cheating, exploits, or toxic behavior.',
  },
  opponent: {
    id: 'team1',
    name: 'TeamAlpha',
    avatar: '',
    members: [
      { name: 'Player1', role: 'Rifler' },
      { name: 'Player2', role: 'AWPer' },
      { name: 'Player3', role: 'IGL' },
    ],
  },
  startTime: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
  venue: 'Online',
  status: 'upcoming' as const,
  isCheckedIn: false,
  requiresCheckIn: true,
  mapPool: ['Dust2', 'Mirage', 'Inferno'],
  streamUrl: '',
  discordUrl: 'https://discord.gg/example',
})

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [match, setMatch] = useState(getMockMatch(resolvedParams.id))
  const { addNotification } = useNotificationStore()

  const handleCheckIn = () => {
    setMatch((prev) => ({ ...prev, isCheckedIn: true }))

    // Add success notification
    addNotification({
      type: 'success',
      title: 'Check-in Confirmé !',
      message: 'Tu es prêt pour le match. Bonne chance !',
      actionUrl: `/dashboard/matches/${match.id}`,
    })
  }

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <Link
        href="/dashboard/matches"
        className="inline-flex items-center gap-2 mb-6 font-sans text-sm text-bloom-dark/60 hover:text-bloom-accent transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux matches
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="h-6 w-6 text-bloom-accent" />
          <span className="font-sans text-sm uppercase tracking-wider text-bloom-dark/60">
            {match.tournament.game}
          </span>
        </div>
        <h1 className="font-serif text-5xl italic text-bloom-dark mb-2">
          {match.tournament.name}
        </h1>
        <p className="font-sans text-lg text-bloom-dark/60">Match #{match.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Check-in Section */}
          {match.status === 'upcoming' && match.requiresCheckIn && (
            <CheckInCountdown
              matchId={match.id}
              matchStartTime={match.startTime}
              checkInWindowMinutes={15}
              isCheckedIn={match.isCheckedIn}
              onCheckIn={handleCheckIn}
            />
          )}

          {/* VS Card */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-bloom-dark to-bloom-dark/90 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-10 w-10" />
                </div>
                <p className="font-serif text-2xl italic mb-1">Vous</p>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-xs font-sans">
                  <CheckCircle2 className="h-3 w-3" />
                  {match.isCheckedIn ? 'Check-in OK' : 'En attente'}
                </span>
              </div>

              <div className="px-8">
                <p className="font-serif text-6xl italic text-bloom-accent">VS</p>
              </div>

              <div className="flex-1 text-center">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  {match.opponent.avatar ? (
                    <img
                      src={match.opponent.avatar}
                      alt={match.opponent.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Users className="h-10 w-10" />
                  )}
                </div>
                <p className="font-serif text-2xl italic mb-1">{match.opponent.name}</p>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-xs font-sans">
                  <CheckCircle2 className="h-3 w-3" />
                  Check-in OK
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-sans text-sm">
                {format(match.startTime, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </span>
              <span className="text-bloom-accent">
                ({formatDistanceToNow(match.startTime, { addSuffix: true, locale: fr })})
              </span>
            </div>
          </div>

          {/* Match Details */}
          <div className="p-6 rounded-xl bg-white border border-bloom-dark/10">
            <h3 className="font-serif text-2xl italic text-bloom-dark mb-4">
              Détails du Match
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Trophy className="h-5 w-5 text-bloom-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-sans text-sm text-bloom-dark/50 mb-1">Format</p>
                  <p className="font-sans text-base text-bloom-dark font-medium">
                    {match.tournament.format}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-bloom-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-sans text-sm text-bloom-dark/50 mb-1">Lieu</p>
                  <p className="font-sans text-base text-bloom-dark font-medium">{match.venue}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-bloom-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-sans text-sm text-bloom-dark/50 mb-1">Map Pool</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {match.mapPool.map((map) => (
                      <span
                        key={map}
                        className="px-3 py-1 rounded-full bg-bloom-dark/5 font-sans text-sm"
                      >
                        {map}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="p-6 rounded-xl bg-bloom-accent/5 border border-bloom-accent/20">
            <h3 className="font-serif text-xl italic text-bloom-dark mb-3">Règles</h3>
            <p className="font-sans text-sm text-bloom-dark/70 leading-relaxed">
              {match.tournament.rules}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Opponent Team */}
          <div className="p-6 rounded-xl bg-white border border-bloom-dark/10">
            <h3 className="font-serif text-xl italic text-bloom-dark mb-4">Équipe Adverse</h3>
            <div className="space-y-3">
              {match.opponent.members.map((member, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-bloom-dark/10 rounded-full flex items-center justify-center">
                    <span className="font-sans text-xs font-medium">{member.name[0]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-sans text-sm font-medium">{member.name}</p>
                    <p className="font-sans text-xs text-bloom-dark/50">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 rounded-xl bg-bloom-dark text-white">
            <h3 className="font-serif text-xl italic mb-4">Liens Utiles</h3>
            <div className="space-y-3">
              {match.discordUrl && (
                <a
                  href={match.discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-center font-sans text-sm transition-colors"
                >
                  Rejoindre le Discord
                </a>
              )}
              {match.streamUrl && (
                <a
                  href={match.streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-center font-sans text-sm transition-colors"
                >
                  Regarder le Stream
                </a>
              )}
              <Link
                href={`/tournaments/${match.tournament.id}`}
                className="block w-full px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-center font-sans text-sm transition-colors"
              >
                Voir le Tournoi
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
