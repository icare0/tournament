'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io, Socket } from 'socket.io-client'
import { MatchUpdateEvent, TournamentUpdateEvent } from '@/types/tournament.types'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000'

interface UseTournamentSocketOptions {
  enabled?: boolean
  onMatchUpdate?: (data: MatchUpdateEvent) => void
  onTournamentUpdate?: (data: TournamentUpdateEvent) => void
  onNotification?: (data: any) => void
}

/**
 * Custom hook for WebSocket connection to a tournament
 * Automatically handles connection, reconnection, and React Query cache invalidation
 */
export function useTournamentSocket(
  tournamentId: string,
  options: UseTournamentSocketOptions = {}
) {
  const { enabled = true, onMatchUpdate, onTournamentUpdate, onNotification } = options

  const queryClient = useQueryClient()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Handle match update events
   */
  const handleMatchUpdate = useCallback(
    (data: MatchUpdateEvent) => {
      console.log('Match update received:', data)

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['matches', tournamentId],
      })
      queryClient.invalidateQueries({
        queryKey: ['match', data.matchId],
      })
      queryClient.invalidateQueries({
        queryKey: ['bracket', tournamentId],
      })

      // Call custom handler if provided
      onMatchUpdate?.(data)
    },
    [tournamentId, queryClient, onMatchUpdate]
  )

  /**
   * Handle tournament update events
   */
  const handleTournamentUpdate = useCallback(
    (data: TournamentUpdateEvent) => {
      console.log('Tournament update received:', data)

      // Invalidate tournament queries
      queryClient.invalidateQueries({
        queryKey: ['tournament', tournamentId],
      })
      queryClient.invalidateQueries({
        queryKey: ['tournaments'],
      })

      // Call custom handler if provided
      onTournamentUpdate?.(data)
    },
    [tournamentId, queryClient, onTournamentUpdate]
  )

  /**
   * Handle notification events
   */
  const handleNotification = useCallback(
    (data: any) => {
      console.log('Notification received:', data)
      onNotification?.(data)
    },
    [onNotification]
  )

  /**
   * Connect to WebSocket
   */
  useEffect(() => {
    if (!enabled || !tournamentId) return

    // Get auth token
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

    // Create socket connection
    const socket = io(WS_URL, {
      transports: ['websocket'],
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    socketRef.current = socket

    // Connection event handlers
    socket.on('connect', () => {
      console.log('WebSocket connected')
      setIsConnected(true)
      setError(null)

      // Join tournament room
      socket.emit('joinTournament', tournamentId)
    })

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    })

    socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err)
      setError(err.message)
      setIsConnected(false)
    })

    // Tournament-specific event handlers
    socket.on('matchUpdate', handleMatchUpdate)
    socket.on('tournamentUpdate', handleTournamentUpdate)
    socket.on('notification', handleNotification)

    // Score update event (alias for matchUpdate)
    socket.on('score_update', handleMatchUpdate)

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up WebSocket connection')
      socket.emit('leaveTournament', tournamentId)
      socket.off('matchUpdate', handleMatchUpdate)
      socket.off('tournamentUpdate', handleTournamentUpdate)
      socket.off('notification', handleNotification)
      socket.off('score_update', handleMatchUpdate)
      socket.disconnect()
    }
  }, [
    enabled,
    tournamentId,
    handleMatchUpdate,
    handleTournamentUpdate,
    handleNotification,
  ])

  /**
   * Emit custom event
   */
  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    } else {
      console.warn('Socket not connected. Cannot emit event:', event)
    }
  }, [])

  /**
   * Subscribe to custom event
   */
  const on = useCallback((event: string, handler: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler)
      return () => {
        socketRef.current?.off(event, handler)
      }
    }
  }, [])

  return {
    isConnected,
    error,
    socket: socketRef.current,
    emit,
    on,
  }
}

/**
 * Hook for match-specific WebSocket connection
 */
export function useMatchSocket(matchId: string, options: UseTournamentSocketOptions = {}) {
  const { enabled = true, onMatchUpdate } = options
  const queryClient = useQueryClient()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!enabled || !matchId) return

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

    const socket = io(WS_URL, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      socket.emit('joinMatch', matchId)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('matchUpdate', (data: MatchUpdateEvent) => {
      queryClient.invalidateQueries({ queryKey: ['match', matchId] })
      onMatchUpdate?.(data)
    })

    return () => {
      socket.emit('leaveMatch', matchId)
      socket.disconnect()
    }
  }, [enabled, matchId, queryClient, onMatchUpdate])

  return { isConnected, socket: socketRef.current }
}

export default useTournamentSocket
