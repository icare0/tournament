'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api-client';

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar?: string;
  wins: number;
  losses: number;
  score: number;
  winRate: number;
}

export default function LeaderboardOverlay() {
  const params = useParams();
  const tournamentId = params.tournamentId as string;
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get(`/broadcast/tournament/${tournamentId}/leaderboard?limit=10`);
        setLeaderboard(response.data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [tournamentId]);

  return (
    <div className="flex h-screen items-center justify-center bg-transparent p-8">
      <div className="w-full max-w-2xl rounded-lg bg-black/90 p-6 backdrop-blur-sm">
        <h2 className="mb-6 text-center text-3xl font-bold text-white">Leaderboard</h2>

        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-4 rounded-lg p-4 transition-all ${
                entry.rank === 1
                  ? 'bg-gradient-to-r from-yellow-600/30 to-yellow-500/10 border-2 border-yellow-500'
                  : entry.rank === 2
                  ? 'bg-gradient-to-r from-gray-400/20 to-gray-300/10 border-2 border-gray-400'
                  : entry.rank === 3
                  ? 'bg-gradient-to-r from-orange-600/20 to-orange-500/10 border-2 border-orange-500'
                  : 'bg-gray-800/50'
              }`}
            >
              {/* Rank */}
              <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                entry.rank === 1
                  ? 'bg-yellow-500 text-black'
                  : entry.rank === 2
                  ? 'bg-gray-400 text-black'
                  : entry.rank === 3
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700 text-white'
              }`}>
                {entry.rank}
              </div>

              {/* Avatar */}
              {entry.avatar ? (
                <img
                  src={entry.avatar}
                  alt={entry.username}
                  className="h-12 w-12 rounded-full border-2 border-white"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
              )}

              {/* Username */}
              <div className="flex-1">
                <div className="text-lg font-bold text-white">{entry.username}</div>
                <div className="text-sm text-gray-400">
                  {entry.wins}W - {entry.losses}L
                </div>
              </div>

              {/* Stats */}
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{entry.score}</div>
                <div className="text-sm text-gray-400">{entry.winRate.toFixed(1)}% WR</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Updated in real-time
        </div>
      </div>
    </div>
  );
}
