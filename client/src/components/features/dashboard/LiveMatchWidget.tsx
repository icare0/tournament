'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { matchService } from '@/services/match.service'
import { Match } from '@/types/tournament.types'
import { cn, formatDateTime } from '@/lib/utils'
import { Clock, Users } from 'lucide-react'

export function LiveMatchWidget() {
  const { data: liveMatches, isLoading } = useQuery({
    queryKey: ['matches', 'live'],
    queryFn: () => matchService.getLive(),
    refetchInterval: 10000, // Refetch every 10 seconds
  })

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold mb-4">Live Matches</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20" />
          ))}
        </div>
      </div>
    )
  }

  const matches = liveMatches?.data || []

  return (
    <div className="glass rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Live Matches</h3>
        <div className="flex items-center gap-2 text-red-500">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-medium">{matches.length} Live</span>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="mx-auto mb-2" size={32} />
          <p>No live matches</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <LiveMatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  )
}

function LiveMatchCard({ match }: { match: Match }) {
  const homeName = match.homeParticipant?.teamName || match.homeParticipant?.user?.username || 'TBD'
  const awayName = match.awayParticipant?.teamName || match.awayParticipant?.user?.username || 'TBD'

  return (
    <div className="match-live rounded-lg p-4 border transition-all hover:scale-105 cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-red-400 font-medium flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          LIVE
        </span>
        <span className="text-xs text-muted-foreground">BO{match.bestOf}</span>
      </div>

      {/* Teams and scores */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">{homeName}</span>
          <span className="text-xl font-bold">{match.homeScore}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">{awayName}</span>
          <span className="text-xl font-bold">{match.awayScore}</span>
        </div>
      </div>
    </div>
  )
}
