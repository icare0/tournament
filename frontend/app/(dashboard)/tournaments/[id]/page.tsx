'use client'

import { use } from 'react'
import Link from 'next/link'
import { useTournament, useTournamentParticipants } from '@/features/tournaments/api/use-tournaments'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Trophy,
  Users,
  Calendar,
  DollarSign,
  Edit,
  Play,
  GitBranch,
  Radio,
  CalendarClock,
  Loader2,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const statusColors = {
  DRAFT: 'bg-gray-500',
  REGISTRATION_OPEN: 'bg-green-500',
  REGISTRATION_CLOSED: 'bg-yellow-500',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-purple-500',
  CANCELLED: 'bg-red-500',
}

interface TournamentDetailsPageProps {
  params: Promise<{ id: string }>
}

export default function TournamentDetailsPage({ params }: TournamentDetailsPageProps) {
  const { id } = use(params)
  const { data: tournament, isLoading, error } = useTournament(id)
  const { data: participants } = useTournamentParticipants(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !tournament) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load tournament details. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{tournament.name}</h1>
            <Badge className={statusColors[tournament.status as keyof typeof statusColors]}>
              {tournament.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-muted-foreground">{tournament.game}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/tournaments/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          {tournament.status === 'REGISTRATION_CLOSED' && (
            <Button>
              <Play className="mr-2 h-4 w-4" />
              Start Tournament
            </Button>
          )}
        </div>
      </div>

      {/* Description */}
      {tournament.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{tournament.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tournament.currentParticipants} / {tournament.maxParticipants}
            </div>
            <p className="text-xs text-muted-foreground">
              {((tournament.currentParticipants / tournament.maxParticipants) * 100).toFixed(0)}% filled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prize Pool</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${tournament.prizePool}</div>
            <p className="text-xs text-muted-foreground">
              Entry fee: ${tournament.entryFee}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tournament Type</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sm">
              {tournament.type.replace('_', ' ')}
            </div>
            <p className="text-xs text-muted-foreground">
              {tournament.visibility}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Start Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sm">
              {new Date(tournament.startDate).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(tournament.startDate).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Tournament Management</CardTitle>
          <CardDescription>
            Access different sections to manage your tournament
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Button variant="outline" className="h-20 flex-col gap-2" asChild>
            <Link href={`/dashboard/tournaments/${id}/bracket`}>
              <GitBranch className="h-6 w-6" />
              <span>View Bracket</span>
            </Link>
          </Button>

          <Button variant="outline" className="h-20 flex-col gap-2" asChild>
            <Link href={`/dashboard/tournaments/${id}/control`}>
              <Radio className="h-6 w-6" />
              <span>Mission Control</span>
            </Link>
          </Button>

          <Button variant="outline" className="h-20 flex-col gap-2" asChild>
            <Link href={`/dashboard/tournaments/${id}/schedule`}>
              <CalendarClock className="h-6 w-6" />
              <span>Schedule</span>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Participants List */}
      <Card>
        <CardHeader>
          <CardTitle>Participants ({participants?.length || 0})</CardTitle>
          <CardDescription>
            Registered players for this tournament
          </CardDescription>
        </CardHeader>
        <CardContent>
          {participants && participants.length > 0 ? (
            <div className="space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-500" />
                    <div>
                      <p className="font-medium">
                        {participant.user?.username || 'Unknown'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {participant.status}
                        {participant.seed && ` • Seed #${participant.seed}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {participant.wins}W - {participant.losses}L
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No participants registered yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
