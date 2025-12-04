'use client'

import { useState } from 'react'
import { Search, MoreVertical, Ban, CheckCircle, Eye, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Mock data
const mockTournaments = [
  {
    id: '1',
    name: 'CS:GO Champions League',
    game: 'CS:GO',
    organizer: 'ProOrg',
    status: 'IN_PROGRESS',
    participants: 32,
    maxParticipants: 32,
    prizePool: 5000,
    entryFee: 50,
    visibility: 'PUBLIC',
    startDate: '2024-12-01',
    reports: 0,
  },
  {
    id: '2',
    name: 'Suspicious Tournament',
    game: 'Valorant',
    organizer: 'NewOrg',
    status: 'REGISTRATION_OPEN',
    participants: 5,
    maxParticipants: 16,
    prizePool: 10000,
    entryFee: 100,
    visibility: 'PUBLIC',
    startDate: '2024-12-05',
    reports: 3,
  },
]

export default function AdminTournamentsPage() {
  const [search, setSearch] = useState('')
  const [tournaments] = useState(mockTournaments)

  const filteredTournaments = tournaments.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Tournament Moderation</h2>
          <p className="text-muted-foreground">Monitor and moderate all tournaments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Tournaments</p>
          <p className="text-2xl font-bold">{tournaments.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-green-500">
            {tournaments.filter((t) => t.status === 'IN_PROGRESS').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Reported</p>
          <p className="text-2xl font-bold text-red-500">
            {tournaments.filter((t) => t.reports > 0).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Prize Pool</p>
          <p className="text-2xl font-bold">
            ${tournaments.reduce((sum, t) => sum + t.prizePool, 0)}
          </p>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tournaments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tournament</TableHead>
              <TableHead>Organizer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Prize Pool</TableHead>
              <TableHead>Reports</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTournaments.map((tournament) => (
              <TableRow key={tournament.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{tournament.name}</p>
                    <p className="text-sm text-muted-foreground">{tournament.game}</p>
                  </div>
                </TableCell>
                <TableCell>{tournament.organizer}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                    {tournament.status}
                  </span>
                </TableCell>
                <TableCell>
                  {tournament.participants}/{tournament.maxParticipants}
                </TableCell>
                <TableCell>${tournament.prizePool}</TableCell>
                <TableCell>
                  {tournament.reports > 0 ? (
                    <span className="flex items-center gap-1 text-red-500">
                      <AlertTriangle className="h-4 w-4" />
                      {tournament.reports}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">
                        <Ban className="h-4 w-4 mr-2" />
                        Cancel Tournament
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
