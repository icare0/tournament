/**
 * useTournamentSocket - Real-time tournament updates hook
 *
 * Automatically connects to a tournament room and handles real-time events.
 * Invalidates TanStack Query caches when data changes.
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  getSocket,
  connectSocket,
  disconnectSocket,
  joinTournamentRoom,
  leaveTournamentRoom,
} from '@/lib/websocket'

export interface TournamentSocketEvents {
  // Match events
  'match:update': (data: { matchId: string; tournamentId: string }) => void
  'match:start': (data: { matchId: string; tournamentId: string }) => void
  'match:complete': (data: { matchId: string; tournamentId: string; winnerId: string }) => void
  'match:dispute': (data: { matchId: string; tournamentId: string; reason: string }) => void

  // Tournament events
  'tournament:status': (data: { tournamentId: string; status: string }) => void
  'tournament:update': (data: { tournamentId: string }) => void

  // Participant events
  'participant:join': (data: { tournamentId: string; participantId: string }) => void
  'participant:leave': (data: { tournamentId: string; participantId: string }) => void

  // Chat events
  'chat:message': (data: { tournamentId: string; message: any }) => void

  // Alert events
  'alert:new': (data: { tournamentId: string; alert: any }) => void
}

export interface UseTournamentSocketOptions {
  tournamentId: string
  enabled?: boolean
  onMatchUpdate?: (data: any) => void
  onTournamentUpdate?: (data: any) => void
  onAlert?: (data: any) => void
}

/**
 * Hook to manage tournament WebSocket connection
 */
export function useTournamentSocket({
  tournamentId,
  enabled = true,
  onMatchUpdate,
  onTournamentUpdate,
  onAlert,
}: UseTournamentSocketOptions) {
  const queryClient = useQueryClient()
  const socketRef = useRef(getSocket())
  const isConnectedRef = useRef(false)

  // Wrap callbacks in useCallback to prevent unnecessary re-renders
  const handleMatchUpdate = useCallback(
    (data: { matchId: string; tournamentId: string }) => {
      console.log('[Socket] Match updated:', data)

      // Invalidate match queries
      queryClient.invalidateQueries({
        queryKey: ['matches', tournamentId],
      })

      queryClient.invalidateQueries({
        queryKey: ['match', data.matchId],
      })

      // Call custom callback
      onMatchUpdate?.(data)
    },
    [tournamentId, queryClient, onMatchUpdate]
  )

  const handleMatchStart = useCallback(
    (data: { matchId: string; tournamentId: string }) => {
      console.log('[Socket] Match started:', data)

      queryClient.invalidateQueries({
        queryKey: ['matches', tournamentId],
      })

      queryClient.invalidateQueries({
        queryKey: ['match', data.matchId],
      })
    },
    [tournamentId, queryClient]
  )

  const handleMatchComplete = useCallback(
    (data: { matchId: string; tournamentId: string; winnerId: string }) => {
      console.log('[Socket] Match completed:', data)

      queryClient.invalidateQueries({
        queryKey: ['matches', tournamentId],
      })

      queryClient.invalidateQueries({
        queryKey: ['match', data.matchId],
      })

      // Also invalidate tournament stats
      queryClient.invalidateQueries({
        queryKey: ['tournament', tournamentId, 'stats'],
      })
    },
    [tournamentId, queryClient]
  )

  const handleMatchDispute = useCallback(
    (data: { matchId: string; tournamentId: string; reason: string }) => {
      console.log('[Socket] Match disputed:', data)

      queryClient.invalidateQueries({
        queryKey: ['matches', tournamentId],
      })

      queryClient.invalidateQueries({
        queryKey: ['disputes', tournamentId],
      })

      onAlert?.(data)
    },
    [tournamentId, queryClient, onAlert]
  )

  const handleTournamentStatus = useCallback(
    (data: { tournamentId: string; status: string }) => {
      console.log('[Socket] Tournament status changed:', data)

      queryClient.invalidateQueries({
        queryKey: ['tournament', tournamentId],
      })

      onTournamentUpdate?.(data)
    },
    [tournamentId, queryClient, onTournamentUpdate]
  )

  const handleTournamentUpdate = useCallback(
    (data: { tournamentId: string }) => {
      console.log('[Socket] Tournament updated:', data)

      queryClient.invalidateQueries({
        queryKey: ['tournament', tournamentId],
      })

      queryClient.invalidateQueries({
        queryKey: ['matches', tournamentId],
      })

      onTournamentUpdate?.(data)
    },
    [tournamentId, queryClient, onTournamentUpdate]
  )

  const handleParticipantJoin = useCallback(
    (data: { tournamentId: string; participantId: string }) => {
      console.log('[Socket] Participant joined:', data)

      queryClient.invalidateQueries({
        queryKey: ['tournament', tournamentId, 'participants'],
      })

      queryClient.invalidateQueries({
        queryKey: ['tournament', tournamentId, 'stats'],
      })
    },
    [tournamentId, queryClient]
  )

  const handleChatMessage = useCallback(
    (data: { tournamentId: string; message: any }) => {
      console.log('[Socket] Chat message:', data)

      queryClient.invalidateQueries({
        queryKey: ['chat', tournamentId],
      })
    },
    [tournamentId, queryClient]
  )

  const handleAlert = useCallback(
    (data: { tournamentId: string; alert: any }) => {
      console.log('[Socket] New alert:', data)

      queryClient.invalidateQueries({
        queryKey: ['alerts', tournamentId],
      })

      onAlert?.(data)
    },
    [tournamentId, queryClient, onAlert]
  )

  // Setup and cleanup
  useEffect(() => {
    if (!enabled || !tournamentId) return

    const socket = socketRef.current

    // Connect to WebSocket
    if (!socket.connected) {
      connectSocket()
    }

    // Wait for connection before joining room
    const handleConnect = () => {
      if (!isConnectedRef.current) {
        joinTournamentRoom(tournamentId)
        isConnectedRef.current = true
      }
    }

    // If already connected, join immediately
    if (socket.connected) {
      handleConnect()
    } else {
      socket.on('connect', handleConnect)
    }

    // Register event listeners
    socket.on('match:update', handleMatchUpdate)
    socket.on('match:start', handleMatchStart)
    socket.on('match:complete', handleMatchComplete)
    socket.on('match:dispute', handleMatchDispute)
    socket.on('tournament:status', handleTournamentStatus)
    socket.on('tournament:update', handleTournamentUpdate)
    socket.on('participant:join', handleParticipantJoin)
    socket.on('participant:leave', handleParticipantJoin) // Same handler
    socket.on('chat:message', handleChatMessage)
    socket.on('alert:new', handleAlert)

    // Cleanup
    return () => {
      if (isConnectedRef.current) {
        leaveTournamentRoom(tournamentId)
        isConnectedRef.current = false
      }

      // Remove all listeners
      socket.off('connect', handleConnect)
      socket.off('match:update', handleMatchUpdate)
      socket.off('match:start', handleMatchStart)
      socket.off('match:complete', handleMatchComplete)
      socket.off('match:dispute', handleMatchDispute)
      socket.off('tournament:status', handleTournamentStatus)
      socket.off('tournament:update', handleTournamentUpdate)
      socket.off('participant:join', handleParticipantJoin)
      socket.off('participant:leave', handleParticipantJoin)
      socket.off('chat:message', handleChatMessage)
      socket.off('alert:new', handleAlert)
    }
  }, [
    enabled,
    tournamentId,
    handleMatchUpdate,
    handleMatchStart,
    handleMatchComplete,
    handleMatchDispute,
    handleTournamentStatus,
    handleTournamentUpdate,
    handleParticipantJoin,
    handleChatMessage,
    handleAlert,
  ])

  return {
    socket: socketRef.current,
    isConnected: socketRef.current.connected,
  }
}
