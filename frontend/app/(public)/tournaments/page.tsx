'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTournaments } from '@/features/tournaments/api/use-tournaments'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Search, Trophy, Users, Calendar, DollarSign } from 'lucide-react'
import type { TournamentStatus, TournamentType } from '@/features/tournaments/types'

const statusColors = {
  DRAFT: 'bg-gray-500',
  REGISTRATION_OPEN: 'bg-green-500',
  REGISTRATION_CLOSED: 'bg-yellow-500',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-purple-500',
  CANCELLED: 'bg-red-500',
}

export default function PublicTournamentsPage() {
  const [search, setSearch] = useState('')
  const [gameFilter, setGameFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<TournamentStatus | 'ALL'>('ALL')

  const { data, isLoading } = useTournaments({
    search: search || undefined,
    game: gameFilter !== 'ALL' ? gameFilter : undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    visibility: 'PUBLIC',
    page: 1,
    limit: 50,
  })

  return (
    <div className="container mx-auto py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Browse Tournaments</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover and join competitive gaming tournaments from around the world
        </p>
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

            <Select value={gameFilter} onValueChange={setGameFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by game" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Games</SelectItem>
                <SelectItem value="Valorant">Valorant</SelectItem>
                <SelectItem value="League of Legends">League of Legends</SelectItem>
                <SelectItem value="CS2">Counter-Strike 2</SelectItem>
                <SelectItem value="Dota 2">Dota 2</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as TournamentStatus | 'ALL')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="REGISTRATION_OPEN">Registration Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && data?.data.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tournaments found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or check back later
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tournaments Grid */}
      {!isLoading && data && data.data.length > 0 && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((tournament) => (
              <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
                {tournament.banner && (
                  <div className="h-40 w-full bg-gradient-to-br from-primary to-purple-500 rounded-t-lg" />
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <h3 className="font-semibold line-clamp-1">{tournament.name}</h3>
                      <p className="text-sm text-muted-foreground">{tournament.game}</p>
                    </div>
                    <Badge className={statusColors[tournament.status]}>
                      {tournament.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {tournament.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {tournament.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {tournament.currentParticipants} / {tournament.maxParticipants} participants
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span>{tournament.type.replace('_', ' ')}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                  </div>

                  {parseFloat(tournament.prizePool) > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-green-500">
                        ${tournament.prizePool} Prize Pool
                      </span>
                    </div>
                  )}

                  {parseFloat(tournament.entryFee) > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Entry Fee: ${tournament.entryFee}</span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/tournaments/${tournament.id}`}>View Details</Link>
                  </Button>
                  {tournament.status === 'REGISTRATION_OPEN' && (
                    <Button className="flex-1" asChild>
                      <Link href="/login">Join Tournament</Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination Info */}
          <div className="text-center text-sm text-muted-foreground">
            Showing {data.data.length} of {data.total} tournaments
          </div>
        </>
      )}
    </div>
  )
}
