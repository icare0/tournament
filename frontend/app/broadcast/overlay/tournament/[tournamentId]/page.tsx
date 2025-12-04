'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { io, Socket } from 'socket.io-client';

interface TournamentData {
  tournamentId: string;
  name: string;
  game: string;
  status: string;
  currentRound: string;
  totalParticipants: number;
  remainingParticipants: number;
  completedMatches: number;
  totalMatches: number;
  liveMatches: any[];
  upcomingMatches: any[];
  recentResults: Array<{
    matchId: string;
    homePlayer: string;
    awayPlayer: string;
    winner: string;
    score: string;
  }>;
}

export default function TournamentOverlay() {
  const params = useParams();
  const tournamentId = params.tournamentId as string;
  const [tournamentData, setTournamentData] = useState<TournamentData | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        const response = await api.get(`/broadcast/tournament/${tournamentId}`);
        setTournamentData(response.data);
      } catch (error) {
        console.error('Error fetching tournament data:', error);
      }
    };

    fetchTournamentData();
    const interval = setInterval(fetchTournamentData, 10000); // Refresh every 10 seconds

    // Connect to WebSocket
    const socketConnection = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      transports: ['websocket'],
    });

    socketConnection.emit('joinTournament', tournamentId);

    socketConnection.on('tournamentUpdate', (data: TournamentData) => {
      setTournamentData(data);
    });

    setSocket(socketConnection);

    return () => {
      clearInterval(interval);
      if (socketConnection) {
        socketConnection.disconnect();
      }
    };
  }, [tournamentId]);

  if (!tournamentData) {
    return (
      <div className="flex h-screen items-center justify-center bg-transparent">
        <div className="text-2xl font-bold text-white">Loading tournament data...</div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-transparent p-8">
      {/* Tournament Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">{tournamentData.name}</h1>
          <div className="mt-2 flex items-center justify-center gap-4 text-sm text-gray-300">
            <span className="font-semibold">{tournamentData.game}</span>
            <span>•</span>
            <span>{tournamentData.currentRound}</span>
            <span>•</span>
            <span>{tournamentData.remainingParticipants}/{tournamentData.totalParticipants} Players</span>
          </div>
        </div>
      </div>

      {/* Recent Results */}
      {tournamentData.recentResults.length > 0 && (
        <div className="absolute bottom-8 left-8 w-96">
          <div className="rounded-lg bg-black/80 p-4 backdrop-blur-sm">
            <h3 className="mb-3 text-lg font-bold text-white">Recent Results</h3>
            <div className="space-y-2">
              {tournamentData.recentResults.slice(0, 5).map((result, index) => (
                <div
                  key={result.matchId}
                  className="flex items-center justify-between rounded bg-gray-800/50 p-2 text-sm"
                >
                  <span className="text-gray-400">{result.homePlayer}</span>
                  <span className="font-bold text-white">{result.score}</span>
                  <span className="text-gray-400">{result.awayPlayer}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Matches */}
      {tournamentData.upcomingMatches.length > 0 && (
        <div className="absolute bottom-8 right-8 w-96">
          <div className="rounded-lg bg-black/80 p-4 backdrop-blur-sm">
            <h3 className="mb-3 text-lg font-bold text-white">Upcoming Matches</h3>
            <div className="space-y-2">
              {tournamentData.upcomingMatches.slice(0, 5).map((match, index) => (
                <div
                  key={match.matchId}
                  className="flex items-center justify-between rounded bg-gray-800/50 p-2 text-sm"
                >
                  <span className="text-gray-300">{match.homePlayer.username}</span>
                  <span className="text-gray-500">vs</span>
                  <span className="text-gray-300">{match.awayPlayer.username}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live Matches Indicator */}
      {tournamentData.liveMatches.length > 0 && (
        <div className="absolute top-24 right-8">
          <div className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3">
            <div className="h-4 w-4 animate-pulse rounded-full bg-white"></div>
            <span className="text-lg font-bold text-white">
              {tournamentData.liveMatches.length} LIVE {tournamentData.liveMatches.length === 1 ? 'MATCH' : 'MATCHES'}
            </span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="absolute top-32 left-1/2 w-96 -translate-x-1/2 transform">
        <div className="rounded-lg bg-black/80 p-4 backdrop-blur-sm">
          <div className="mb-2 flex justify-between text-sm text-gray-300">
            <span>Tournament Progress</span>
            <span>{tournamentData.completedMatches}/{tournamentData.totalMatches} Matches</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{
                width: `${(tournamentData.completedMatches / tournamentData.totalMatches) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
