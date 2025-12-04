'use client'

import { useState } from 'react'
import { Search, MoreVertical, Ban, CheckCircle, AlertCircle, Mail } from 'lucide-react'
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

// Mock data - Replace with real API call
const mockUsers = [
  {
    id: '1',
    username: 'ProGamer123',
    email: 'pro@example.com',
    role: 'PLAYER',
    status: 'ACTIVE',
    balance: 250.0,
    tournamentsPlayed: 15,
    wins: 12,
    losses: 8,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    username: 'TournamentOrg',
    email: 'organizer@example.com',
    role: 'ORGANIZER',
    status: 'ACTIVE',
    balance: 1000.0,
    tournamentsPlayed: 3,
    wins: 2,
    losses: 1,
    createdAt: '2024-02-10',
  },
  {
    id: '3',
    username: 'RefereeMaster',
    email: 'referee@example.com',
    role: 'REFEREE',
    status: 'ACTIVE',
    balance: 75.0,
    tournamentsPlayed: 0,
    wins: 0,
    losses: 0,
    createdAt: '2024-03-01',
  },
  {
    id: '4',
    username: 'SuspendedUser',
    email: 'suspended@example.com',
    role: 'PLAYER',
    status: 'SUSPENDED',
    balance: 0,
    tournamentsPlayed: 5,
    wins: 0,
    losses: 5,
    createdAt: '2023-12-20',
  },
]

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [users] = useState(mockUsers)

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500/10 text-red-500'
      case 'ORGANIZER':
        return 'bg-purple-500/10 text-purple-500'
      case 'REFEREE':
        return 'bg-blue-500/10 text-blue-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/10 text-green-500'
      case 'SUSPENDED':
        return 'bg-red-500/10 text-red-500'
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">User Management</h2>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active Users</p>
          <p className="text-2xl font-bold text-green-500">
            {users.filter((u) => u.status === 'ACTIVE').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Organizers</p>
          <p className="text-2xl font-bold text-purple-500">
            {users.filter((u) => u.role === 'ORGANIZER').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Suspended</p>
          <p className="text-2xl font-bold text-red-500">
            {users.filter((u) => u.status === 'SUSPENDED').length}
          </p>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Tournaments</TableHead>
              <TableHead>W/L</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                      user.status
                    )}`}
                  >
                    {user.status}
                  </span>
                </TableCell>
                <TableCell>${user.balance.toFixed(2)}</TableCell>
                <TableCell>{user.tournamentsPlayed}</TableCell>
                <TableCell>
                  <span className="text-green-500">{user.wins}</span> /{' '}
                  <span className="text-red-500">{user.losses}</span>
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
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
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Change Role
                      </DropdownMenuItem>
                      {user.status === 'ACTIVE' ? (
                        <DropdownMenuItem className="text-red-500">
                          <Ban className="h-4 w-4 mr-2" />
                          Suspend User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="text-green-500">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Activate User
                        </DropdownMenuItem>
                      )}
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
