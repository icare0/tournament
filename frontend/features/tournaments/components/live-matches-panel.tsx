/**
 * LiveMatchesPanel - Real-time dashboard of ongoing matches
 */

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Play, AlertCircle, Trophy } from 'lucide-react'
import { Match, MatchStatus } from '@/types/api'
import { cn } from '@/lib/utils'

export interface LiveMatchesPanelProps {
  matches: Match[]
  onMatchClick?: (match: Match) => void
  className?: string
}

export function LiveMatchesPanel({ matches, onMatchClick, className }: LiveMatchesPanelProps) {
  // Filter live and scheduled matches
  const liveMatches = matches.filter((m) => m.status === 'IN_PROGRESS')
  const upcomingMatches = matches.filter((m) => m.status === 'SCHEDULED').slice(0, 3)

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Live Matches</CardTitle>
        <Badge variant="destructive" className="animate-pulse">
          {liveMatches.length} LIVE
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto space-y-3">
        {/* Live Matches */}
        {liveMatches.length > 0 ? (
          liveMatches.map((match) => (
            <div
              key={match.id}
              onClick={() => onMatchClick?.(match)}
              className="p-4 border-2 border-green-500 rounded-lg bg-green-500/5 cursor-pointer hover:bg-green-500/10 transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-semibold text-green-500">LIVE</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {match.bracket === 'winners' ? 'Winners' : 'Losers'} R{match.round + 1}-
                  {match.matchNumber + 1}
                </span>
              </div>

              {/* Participants */}
              <div className="space-y-2">
                {/* Participant 1 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {match.participant1?.seed && (
                      <span className="text-xs font-mono text-muted-foreground w-6">
                        #{match.participant1.seed}
                      </span>
                    )}
                    <span className="font-medium truncate">
                      {match.participant1?.name || 'TBD'}
                    </span>
                    {match.winnerId === match.participant1?.id && (
                      <Trophy className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <span className="text-xl font-bold tabular-nums ml-4">
                    {match.score?.participant1 ?? '-'}
                  </span>
                </div>

                {/* VS Divider */}
                <div className="h-px bg-border" />

                {/* Participant 2 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {match.participant2?.seed && (
                      <span className="text-xs font-mono text-muted-foreground w-6">
                        #{match.participant2.seed}
                      </span>
                    )}
                    <span className="font-medium truncate">
                      {match.participant2?.name || 'TBD'}
                    </span>
                    {match.winnerId === match.participant2?.id && (
                      <Trophy className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <span className="text-xl font-bold tabular-nums ml-4">
                    {match.score?.participant2 ?? '-'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 pt-3 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMatchClick?.(match)
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Manage Match
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No live matches</p>
          </div>
        )}

        {/* Upcoming Matches */}
        {upcomingMatches.length > 0 && (
          <>
            <div className="pt-2">
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Up Next</h4>
            </div>

            {upcomingMatches.map((match) => (
              <div
                key={match.id}
                onClick={() => onMatchClick?.(match)}
                className="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    {match.bracket === 'winners' ? 'Winners' : 'Losers'} R{match.round + 1}-
                    {match.matchNumber + 1}
                  </span>
                  {match.scheduledAt && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(match.scheduledAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-sm flex items-center gap-2">
                    {match.participant1?.seed && (
                      <span className="text-xs font-mono text-muted-foreground">
                        #{match.participant1.seed}
                      </span>
                    )}
                    <span className="truncate">{match.participant1?.name || 'TBD'}</span>
                  </div>
                  <div className="text-sm flex items-center gap-2">
                    {match.participant2?.seed && (
                      <span className="text-xs font-mono text-muted-foreground">
                        #{match.participant2.seed}
                      </span>
                    )}
                    <span className="truncate">{match.participant2?.name || 'TBD'}</span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  )
}
