/**
 * Mission Control - Tournament Dashboard for Organizers
 *
 * Real-time command center for managing tournaments
 */

'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { useTournamentSocket } from '@/lib/hooks/use-tournament-socket'
import { LiveMatchesPanel } from '@/features/tournaments/components/live-matches-panel'
import { DisputesPanel, type Alert } from '@/features/tournaments/components/disputes-panel'
import { RefereeChat, type ChatMessage } from '@/features/tournaments/components/referee-chat'
import { MatchQuickEdit } from '@/features/tournaments/components/match-quick-edit'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Match } from '@/types/api'
import {
  Activity,
  Users,
  Trophy,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react'

export default function MissionControlPage() {
  const params = useParams()
  const tournamentId = params.id as string

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)

  // WebSocket connection
  const { isConnected } = useTournamentSocket({
    tournamentId,
    enabled: true,
    onMatchUpdate: (data) => {
      console.log('Match updated in real-time:', data)
    },
    onAlert: (data) => {
      console.log('New alert:', data)
      // Could trigger a toast notification here
    },
  })

  // Mock data (replace with real API calls)
  const tournament = {
    id: tournamentId,
    name: 'Valorant Champions Tour 2025',
    status: 'IN_PROGRESS',
    currentParticipants: 64,
    maxParticipants: 64,
  }

  const stats = {
    totalMatches: 127,
    completedMatches: 45,
    liveMatches: 3,
    totalPrizePool: 50000,
  }

  const mockMatches: Match[] = [
    {
      id: 'm1',
      tournamentId,
      round: 1,
      matchNumber: 0,
      bracket: 'winners',
      status: 'IN_PROGRESS',
      participant1: { id: 'p1', name: 'Cloud9', seed: 1 },
      participant2: { id: 'p2', name: 'Team Liquid', seed: 8 },
      score: { participant1: 1, participant2: 0 },
    },
    {
      id: 'm2',
      tournamentId,
      round: 1,
      matchNumber: 1,
      bracket: 'winners',
      status: 'IN_PROGRESS',
      participant1: { id: 'p3', name: 'Fnatic', seed: 4 },
      participant2: { id: 'p4', name: 'G2 Esports', seed: 5 },
      score: { participant1: 2, participant2: 1 },
    },
    {
      id: 'm3',
      tournamentId,
      round: 1,
      matchNumber: 2,
      bracket: 'winners',
      status: 'SCHEDULED',
      participant1: { id: 'p5', name: 'Team Vitality', seed: 2 },
      participant2: { id: 'p6', name: 'NRG', seed: 7 },
      scheduledAt: new Date(Date.now() + 30 * 60000).toISOString(),
    },
  ]

  const mockAlerts: Alert[] = [
    {
      id: 'a1',
      type: 'dispute',
      title: 'Match Result Disputed',
      message: 'Cloud9 vs Team Liquid - Score discrepancy reported by referee',
      matchId: 'm1',
      createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    {
      id: 'a2',
      type: 'warning',
      title: 'Player Disconnect',
      message: 'Fnatic player disconnected mid-match (3 times)',
      matchId: 'm2',
      createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
    },
  ]

  const mockChatMessages: ChatMessage[] = [
    {
      id: 'c1',
      userId: 'ref1',
      username: 'John Referee',
      userRole: 'REFEREE',
      message: 'Match 1 has technical issues, investigating now',
      createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    },
    {
      id: 'c2',
      userId: 'org1',
      username: 'Tournament Organizer',
      userRole: 'ORGANIZER',
      message: 'Thanks, keep me posted',
      createdAt: new Date(Date.now() - 9 * 60000).toISOString(),
    },
  ]

  const handleMatchUpdate = (matchId: string, data: any) => {
    console.log('Update match:', matchId, data)
    // API call here
    // await apiClient.patch(`/matches/${matchId}`, data)
  }

  const handleResolveAlert = (alertId: string) => {
    console.log('Resolve alert:', alertId)
    // API call here
  }

  const handleSendMessage = (message: string) => {
    console.log('Send message:', message)
    // WebSocket emit or API call
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
            matches={mockMatches}
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
                const match = mockMatches.find((m) => m.id === alert.matchId)
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
