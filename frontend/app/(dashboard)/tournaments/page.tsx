'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTournaments } from '@/features/tournaments/api/use-tournaments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Trophy, Users, Calendar, DollarSign } from 'lucide-react'
import type { TournamentStatus, TournamentType } from '@/features/tournaments/types'

const statusColors: Record<TournamentStatus, string> = {
  DRAFT: 'bg-gray-500',
  REGISTRATION_OPEN: 'bg-green-500',
  REGISTRATION_CLOSED: 'bg-yellow-500',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-purple-500',
  CANCELLED: 'bg-red-500',
}

export default function TournamentsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TournamentStatus | 'ALL'>('ALL')
  const [typeFilter, setTypeFilter] = useState<TournamentType | 'ALL'>('ALL')

  const { data, isLoading, error } = useTournaments({
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    type: typeFilter !== 'ALL' ? typeFilter : undefined,
    page: 1,
    limit: 20,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tournaments</h1>
          <p className="text-muted-foreground">
            Manage and organize your tournaments
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/tournaments/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Tournament
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tournaments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as TournamentStatus | 'ALL')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="REGISTRATION_OPEN">Registration Open</SelectItem>
                <SelectItem value="REGISTRATION_CLOSED">Registration Closed</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as TournamentType | 'ALL')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="SINGLE_ELIMINATION">Single Elimination</SelectItem>
                <SelectItem value="DOUBLE_ELIMINATION">Double Elimination</SelectItem>
                <SelectItem value="ROUND_ROBIN">Round Robin</SelectItem>
                <SelectItem value="SWISS">Swiss</SelectItem>
                <SelectItem value="BATTLE_ROYALE">Battle Royale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading tournaments...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive text-center">
              Failed to load tournaments. Please try again.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && data?.data.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tournaments found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first tournament
            </p>
            <Button asChild>
              <Link href="/dashboard/tournaments/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Tournament
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tournaments Grid */}
      {!isLoading && !error && data && data.data.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.data.map((tournament) => (
            <Card
              key={tournament.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold line-clamp-1">
                      {tournament.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {tournament.game}
                    </p>
                  </div>
                  <Badge className={statusColors[tournament.status]}>
                    {tournament.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {tournament.currentParticipants} / {tournament.maxParticipants}{' '}
                    participants
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span>{tournament.type.replace('_', ' ')}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(tournament.startDate).toLocaleDateString()}
                  </span>
                </div>

                {parseFloat(tournament.prizePool) > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">
                      ${tournament.prizePool} Prize Pool
                    </span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/dashboard/tournaments/${tournament.id}`}>
                    View
                  </Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href={`/dashboard/tournaments/${tournament.id}/edit`}>
                    Edit
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Info */}
      {data && data.total > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {data.data.length} of {data.total} tournaments
        </div>
      )}
    </div>
  )
}
