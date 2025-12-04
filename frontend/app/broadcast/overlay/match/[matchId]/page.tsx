'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { io, Socket } from 'socket.io-client';

interface MatchData {
  matchId: string;
  tournamentName: string;
  status: string;
  homePlayer: {
    username: string;
    avatar?: string;
    score: number;
  };
  awayPlayer: {
    username: string;
    avatar?: string;
    score: number;
  };
  bestOf: number;
  round: string;
  timer: {
    elapsed: number;
    formattedTime: string;
  } | null;
}

export default function MatchOverlay() {
  const params = useParams();
  const matchId = params.matchId as string;
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Fetch initial match data
    const fetchMatchData = async () => {
      try {
        const response = await api.get(`/broadcast/match/${matchId}`);
        setMatchData(response.data);
      } catch (error) {
        console.error('Error fetching match data:', error);
      }
    };

    fetchMatchData();
    const interval = setInterval(fetchMatchData, 5000); // Refresh every 5 seconds

    // Connect to WebSocket for real-time updates
    const socketConnection = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      transports: ['websocket'],
    });

    socketConnection.emit('joinMatch', matchId);

    socketConnection.on('matchUpdate', (data: MatchData) => {
      setMatchData(data);
    });

    setSocket(socketConnection);

    return () => {
      clearInterval(interval);
      if (socketConnection) {
        socketConnection.disconnect();
      }
    };
  }, [matchId]);

  if (!matchData) {
    return (
      <div className="flex h-screen items-center justify-center bg-transparent">
        <div className="text-2xl font-bold text-white">Loading match data...</div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-transparent">
      {/* Match Scoreboard Overlay */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 transform">
        <div className="flex items-center gap-4 rounded-lg bg-black/80 p-6 backdrop-blur-sm">
          {/* Home Player */}
          <div className="flex items-center gap-3">
            {matchData.homePlayer.avatar && (
              <img
                src={matchData.homePlayer.avatar}
                alt={matchData.homePlayer.username}
                className="h-12 w-12 rounded-full border-2 border-blue-500"
              />
            )}
            <div className="text-left">
              <div className="text-sm text-gray-400">{matchData.round}</div>
              <div className="text-xl font-bold text-white">
                {matchData.homePlayer.username}
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="mx-8 flex items-center gap-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-500">
                {matchData.homePlayer.score}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">-</div>
              {matchData.timer && (
                <div className="text-sm text-gray-500">
                  {matchData.timer.formattedTime}
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-red-500">
                {matchData.awayPlayer.score}
              </div>
            </div>
          </div>

          {/* Away Player */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-400">BO{matchData.bestOf}</div>
              <div className="text-xl font-bold text-white">
                {matchData.awayPlayer.username}
              </div>
            </div>
            {matchData.awayPlayer.avatar && (
              <img
                src={matchData.awayPlayer.avatar}
                alt={matchData.awayPlayer.username}
                className="h-12 w-12 rounded-full border-2 border-red-500"
              />
            )}
          </div>
        </div>
      </div>

      {/* Tournament Name */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 transform">
        <div className="rounded-full bg-black/80 px-6 py-3 backdrop-blur-sm">
          <div className="text-center text-lg font-semibold text-white">
            {matchData.tournamentName}
          </div>
        </div>
      </div>

      {/* Live Indicator */}
      {matchData.status === 'LIVE' && (
        <div className="absolute top-8 right-8">
          <div className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-2">
            <div className="h-3 w-3 animate-pulse rounded-full bg-white"></div>
            <span className="text-sm font-bold text-white">LIVE</span>
          </div>
        </div>
      )}
    </div>
  );
}
