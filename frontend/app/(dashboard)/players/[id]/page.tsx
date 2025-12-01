/**
 * Player Profile Page - With Cyberpunk Stats Visualization
 */

'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { PlayerStatsRadar, type PlayerStat } from '@/features/players/components/player-stats-radar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Target, TrendingUp, Award } from 'lucide-react'

export default function PlayerProfilePage() {
  const params = useParams()
  const playerId = params.id as string

  // Mock player data
  const player = {
    id: playerId,
    username: 'ProGamer_2025',
    email: 'player@example.com',
    avatar: '',
    role: 'PLAYER',
    status: 'ACTIVE',
    rank: 'Diamond II',
    totalWins: 156,
    totalMatches: 234,
    winRate: 66.7,
    currentStreak: 12,
  }

  // Player skills for radar chart
  const playerStats: PlayerStat[] = [
    { skill: 'Aim', value: 85, max: 100 },
    { skill: 'Strategy', value: 92, max: 100 },
    { skill: 'Teamwork', value: 78, max: 100 },
    { skill: 'Communication', value: 88, max: 100 },
    { skill: 'Adaptability', value: 75, max: 100 },
    { skill: 'Game Sense', value: 90, max: 100 },
  ]

  const overallRating = Math.round(
    playerStats.reduce((acc, stat) => acc + stat.value, 0) / playerStats.length
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-24 h-24 border-4 border-primary/20">
            <AvatarImage src={player.avatar} alt={player.username} />
            <AvatarFallback className="text-3xl bg-gradient-to-br from-cyan-500 to-purple-500">
              {player.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">{player.username}</h1>
            <p className="text-muted-foreground mt-1">{player.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default" className="gap-1">
                <Trophy className="w-3 h-3" />
                {player.rank}
              </Badge>
              <Badge variant={player.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {player.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            {overallRating}
          </div>
          <div className="text-sm text-muted-foreground">Overall Rating</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{player.winRate}%</div>
            <p className="text-xs text-muted-foreground">
              {player.totalWins} / {player.totalMatches} matches
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wins</CardTitle>
            <Trophy className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{player.totalWins}</div>
            <p className="text-xs text-muted-foreground">Lifetime victories</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{player.currentStreak}</div>
            <p className="text-xs text-muted-foreground">Consecutive wins</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tournaments</CardTitle>
            <Award className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-500">24</div>
            <p className="text-xs text-muted-foreground">Participated</p>
          </CardContent>
        </Card>
      </div>

      {/* Skills Radar Chart */}
      <PlayerStatsRadar data={playerStats} playerName={player.username} size="lg" />

      {/* Recent Matches */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Match History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Match history component would go here...
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
