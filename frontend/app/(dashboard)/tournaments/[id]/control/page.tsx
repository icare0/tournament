/**
 * Mission Control - Tournament Dashboard for Organizers
 *
 * Real-time command center for managing tournaments
 */

'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { useTournamentSocket } from '@/lib/hooks/use-tournament-socket'
import { useTournament } from '@/features/tournaments/api/use-tournaments'
import { useTournamentMatches, useUpdateMatch } from '@/features/tournaments/api/use-matches'
import { LiveMatchesPanel } from '@/features/tournaments/components/live-matches-panel'
import { DisputesPanel, type Alert } from '@/features/tournaments/components/disputes-panel'
import { RefereeChat, type ChatMessage } from '@/features/tournaments/components/referee-chat'
import { MatchQuickEdit } from '@/features/tournaments/components/match-quick-edit'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { Match } from '@/features/tournaments/types'
import {
  Activity,
  Users,
  Trophy,
  TrendingUp,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react'

export default function MissionControlPage() {
  const params = useParams()
  const tournamentId = params.id as string

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)

  // Fetch real data
  const { data: tournament, isLoading: tournamentLoading } = useTournament(tournamentId)
  const { data: matches, isLoading: matchesLoading, refetch: refetchMatches } = useTournamentMatches(tournamentId)
  const { mutate: updateMatch } = useUpdateMatch()

  // WebSocket connection
  const { isConnected } = useTournamentSocket({
    tournamentId,
    enabled: true,
    onMatchUpdate: (data) => {
      console.log('Match updated in real-time:', data)
    },
    onAlert: (data) => {
      console.log('New alert:', data)
    },
  })

  // Calculate stats from real data
  const stats = {
    totalMatches: matches?.length || 0,
    completedMatches: matches?.filter((m) => m.status === 'COMPLETED').length || 0,
    liveMatches: matches?.filter((m) => m.status === 'LIVE').length || 0,
    totalPrizePool: parseFloat(tournament?.prizePool || '0'),
  }

  // TODO: Replace with real alerts from API
  const mockAlerts: Alert[] = []

  // TODO: Replace with real chat messages from API/WebSocket
  const mockChatMessages: ChatMessage[] = []

  const handleMatchUpdate = (matchId: string, data: any) => {
    updateMatch(
      { id: matchId, data },
      {
        onSuccess: () => {
          setSelectedMatch(null)
          refetchMatches()
        },
      }
    )
  }

  const handleResolveAlert = (alertId: string) => {
    console.log('Resolve alert:', alertId)
    // API call here
  }

  const handleSendMessage = (message: string) => {
    console.log('Send message:', message)
    // WebSocket emit or API call
  }

  if (tournamentLoading || matchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!tournament) {
    return <div>Tournament not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mission Control</h1>
          <p className="text-muted-foreground mt-1">{tournament.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isConnected ? 'default' : 'destructive'} className="gap-1.5">
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3" />
                Live
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                Disconnected
              </>
            )}
          </Badge>
          <Button variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Matches</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.liveMatches}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedMatches} / {stats.totalMatches} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tournament.currentParticipants}</div>
            <p className="text-xs text-muted-foreground">
              of {tournament.maxParticipants} max
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prize Pool</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalPrizePool.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((stats.completedMatches / stats.totalMatches) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Tournament completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Live Matches */}
        <div className="lg:col-span-1">
          <LiveMatchesPanel
            matches={matches || []}
            onMatchClick={setSelectedMatch}
            className="h-[600px]"
          />
        </div>

        {/* Middle Column - Disputes & Alerts */}
        <div className="lg:col-span-1">
          <DisputesPanel
            alerts={mockAlerts}
            onAlertClick={(alert) => {
              if (alert.matchId) {
                const match = matches?.find((m) => m.id === alert.matchId)
                if (match) setSelectedMatch(match)
              }
            }}
            onResolveAlert={handleResolveAlert}
            className="h-[600px]"
          />
        </div>

        {/* Right Column - Referee Chat */}
        <div className="lg:col-span-1">
          <RefereeChat
            messages={mockChatMessages}
            currentUserId="org1"
            onSendMessage={handleSendMessage}
            className="h-[600px]"
          />
        </div>
      </div>

      {/* Quick Edit Modal */}
      <MatchQuickEdit
        match={selectedMatch}
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onSubmit={handleMatchUpdate}
      />
    </div>
  )
}
