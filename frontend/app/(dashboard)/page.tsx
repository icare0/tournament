'use client'

import Link from 'next/link'
import { useTournaments } from '@/features/tournaments/api/use-tournaments'
import { useBalance } from '@/features/wallet/api/use-wallet'
import { useMe } from '@/features/auth/api/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trophy, Users, DollarSign, TrendingUp, Plus, ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  const { data: user } = useMe()
  const { data: tournaments, isLoading: tournamentsLoading } = useTournaments({
    page: 1,
    limit: 10,
  })
  const { data: balance } = useBalance()

  // Calculate stats
  const stats = {
    activeTournaments: tournaments?.data.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'REGISTRATION_OPEN').length || 0,
    totalParticipants: tournaments?.data.reduce((sum, t) => sum + t.currentParticipants, 0) || 0,
    totalPrizePool: tournaments?.data.reduce((sum, t) => sum + parseFloat(t.prizePool), 0) || 0,
    walletBalance: balance ? parseFloat(balance.balance) : 0,
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.username || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your tournaments
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tournaments</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTournaments}</div>
            <p className="text-xs text-muted-foreground">
              {tournaments?.total || 0} total tournaments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipants}</div>
            <p className="text-xs text-muted-foreground">
              Across all tournaments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prize Pool</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalPrizePool.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Combined prize money
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.walletBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Available funds
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-20 flex-col gap-2" asChild>
              <Link href="/dashboard/tournaments/new">
                <Plus className="h-6 w-6" />
                <span>Create Tournament</span>
              </Link>
            </Button>

            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/dashboard/wallet">
                <DollarSign className="h-6 w-6" />
                <span>Manage Wallet</span>
              </Link>
            </Button>

            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/dashboard/tournaments">
                <Trophy className="h-6 w-6" />
                <span>View Tournaments</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Tournaments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Tournaments</CardTitle>
              <CardDescription>Your latest tournaments</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/tournaments">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tournamentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : tournaments && tournaments.data.length > 0 ? (
            <div className="space-y-4">
              {tournaments.data.slice(0, 5).map((tournament) => (
                <Link
                  key={tournament.id}
                  href={`/dashboard/tournaments/${tournament.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{tournament.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {tournament.game} • {tournament.currentParticipants}/{tournament.maxParticipants} participants
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        tournament.status === 'IN_PROGRESS'
                          ? 'default'
                          : tournament.status === 'REGISTRATION_OPEN'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {tournament.status.replace('_', ' ')}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No tournaments yet
              </p>
              <Button asChild>
                <Link href="/dashboard/tournaments/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Tournament
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
