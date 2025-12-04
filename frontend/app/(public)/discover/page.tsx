'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Trophy,
  Users,
  Calendar,
  DollarSign,
  Filter,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface Tournament {
  id: string;
  name: string;
  game: string;
  type: string;
  status: string;
  visibility: string;
  maxParticipants: number;
  prizePool: number | null;
  entryFee: number;
  startDate: string;
  endDate: string | null;
  organizer: {
    id: string;
    username: string;
    avatar: string | null;
  };
  _count?: {
    participants: number;
  };
}

export default function DiscoverPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const games = ['all', 'League of Legends', 'Counter-Strike 2', 'Valorant', 'Dota 2', 'Fortnite', 'Rocket League'];
  const statuses = ['all', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'UPCOMING'];

  useEffect(() => {
    fetchTournaments();
    fetchTrending();
  }, [selectedGame, selectedStatus]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        visibility: 'PUBLIC',
        ...(selectedGame !== 'all' && { game: selectedGame }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
      });

      const response = await api.get(`/api/v1/tournaments?${params}`);
      setTournaments(response.data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const response = await api.get('/analytics/tournaments/trending?limit=5');
      setTrending(response.data);
    } catch (error) {
      console.error('Error fetching trending tournaments:', error);
    }
  };

  const filteredTournaments = tournaments.filter((tournament) =>
    tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tournament.game.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const badges = {
      REGISTRATION_OPEN: { color: 'bg-green-500', text: 'Open' },
      IN_PROGRESS: { color: 'bg-blue-500', text: 'Live' },
      REGISTRATION_CLOSED: { color: 'bg-yellow-500', text: 'Starting Soon' },
      COMPLETED: { color: 'bg-gray-500', text: 'Completed' },
      DRAFT: { color: 'bg-gray-400', text: 'Draft' },
    };
    const badge = badges[status] || { color: 'bg-gray-500', text: status };
    return (
      <span className={`${badge.color} rounded-full px-3 py-1 text-xs font-semibold text-white`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">Discover Tournaments</h1>
              <p className="mt-2 text-gray-400">
                Find and join exciting tournaments from around the world
              </p>
            </div>
            <Link href="/login">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Sign In to Compete
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Trending Section */}
        {trending.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Trending Now</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trending.slice(0, 3).map((tournament) => (
                <Link
                  key={tournament.tournamentId}
                  href={`/tournaments/${tournament.tournamentId}`}
                  className="group"
                >
                  <div className="h-full rounded-lg border-2 border-purple-500/50 bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-6 transition-all hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/50">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-purple-300">
                          {tournament.name}
                        </h3>
                        <p className="text-sm text-gray-400">{tournament.game}</p>
                      </div>
                      {getStatusBadge(tournament.status)}
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                          {tournament.totalParticipants}/{tournament.maxParticipants} Players
                        </span>
                      </div>
                      {tournament.prizePool && (
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold text-yellow-400">
                            ${tournament.prizePool} Prize Pool
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{tournament.recentActivity} active matches</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 rounded-lg bg-white/5 p-6 backdrop-blur-sm">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tournaments or games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>

            {/* Game Filter */}
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="rounded-md border border-white/20 bg-white/10 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
            >
              {games.map((game) => (
                <option key={game} value={game} className="bg-gray-900">
                  {game === 'all' ? 'All Games' : game}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-md border border-white/20 bg-white/10 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
            >
              {statuses.map((status) => (
                <option key={status} value={status} className="bg-gray-900">
                  {status === 'all'
                    ? 'All Statuses'
                    : status.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tournament Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-xl text-gray-400">Loading tournaments...</div>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <Trophy className="mb-4 h-16 w-16 text-gray-600" />
            <p className="text-xl text-gray-400">No tournaments found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournaments/${tournament.id}`}
                className="group"
              >
                <div className="h-full rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-purple-500/50 hover:bg-white/10 hover:shadow-lg">
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-300">
                        {tournament.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-400">{tournament.game}</p>
                    </div>
                    {getStatusBadge(tournament.status)}
                  </div>

                  {/* Info Grid */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Users className="h-4 w-4" />
                      <span>
                        {tournament._count?.participants || 0}/{tournament.maxParticipants} Players
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(tournament.startDate).toLocaleDateString()}
                      </span>
                    </div>

                    {tournament.prizePool && tournament.prizePool > 0 && (
                      <div className="flex items-center gap-2 text-yellow-400">
                        <Trophy className="h-4 w-4" />
                        <span className="font-semibold">${tournament.prizePool}</span>
                      </div>
                    )}

                    {tournament.entryFee > 0 ? (
                      <div className="flex items-center gap-2 text-gray-300">
                        <DollarSign className="h-4 w-4" />
                        <span>${tournament.entryFee} Entry Fee</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-400">
                        <span className="font-semibold">FREE</span>
                      </div>
                    )}
                  </div>

                  {/* Organizer */}
                  <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4">
                    {tournament.organizer.avatar ? (
                      <img
                        src={tournament.organizer.avatar}
                        alt={tournament.organizer.username}
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
                    )}
                    <span className="text-sm text-gray-400">
                      by {tournament.organizer.username}
                    </span>
                  </div>

                  {/* CTA */}
                  <Button className="mt-4 w-full bg-purple-600 hover:bg-purple-700">
                    View Details
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
