/**
 * WebSocket Client - Socket.io Configuration
 *
 * Manages real-time connections to the tournament backend.
 * Auto-reconnects on failure, handles authentication tokens.
 */

import { io, Socket } from 'socket.io-client'
import { tokenManager } from './api/client'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000'

// Global socket instance (singleton)
let socketInstance: Socket | null = null

/**
 * Get or create Socket.io instance
 */
export function getSocket(): Socket {
  if (socketInstance && socketInstance.connected) {
    return socketInstance
  }

  // Create new socket connection
  socketInstance = io(WS_URL, {
    autoConnect: false, // We'll connect manually
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'], // Prefer WebSocket, fallback to polling
    auth: (cb) => {
      const token = tokenManager.getToken()
      cb({ token })
    },
  })

  // Global event handlers
  socketInstance.on('connect', () => {
    console.log('[WebSocket] Connected:', socketInstance?.id)
  })

  socketInstance.on('disconnect', (reason) => {
    console.log('[WebSocket] Disconnected:', reason)
  })

  socketInstance.on('connect_error', (error) => {
    console.error('[WebSocket] Connection error:', error.message)
  })

  socketInstance.on('reconnect_attempt', (attempt) => {
    console.log(`[WebSocket] Reconnection attempt ${attempt}`)
    // Update auth token on reconnect
    const token = tokenManager.getToken()
    if (socketInstance) {
      socketInstance.auth = { token }
    }
  })

  socketInstance.on('reconnect', (attemptNumber) => {
    console.log(`[WebSocket] Reconnected after ${attemptNumber} attempts`)
  })

  return socketInstance
}

/**
 * Connect to WebSocket server
 */
export function connectSocket(): void {
  const socket = getSocket()
  if (!socket.connected) {
    socket.connect()
  }
}

/**
 * Disconnect from WebSocket server
 */
export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect()
  }
}

/**
 * Join a tournament room
 */
export function joinTournamentRoom(tournamentId: string): void {
  const socket = getSocket()
  socket.emit('tournament:join', { tournamentId })
  console.log(`[WebSocket] Joined tournament room: ${tournamentId}`)
}

/**
 * Leave a tournament room
 */
export function leaveTournamentRoom(tournamentId: string): void {
  const socket = getSocket()
  socket.emit('tournament:leave', { tournamentId })
  console.log(`[WebSocket] Left tournament room: ${tournamentId}`)
}

/**
 * Emit a message to the server
 */
export function emitEvent(event: string, data: any): void {
  const socket = getSocket()
  socket.emit(event, data)
}

// Export socket instance for direct access if needed
export { socketInstance as socket }
