'use client'

import { useEffect } from 'react'
import { useNotificationStore } from '@/lib/stores/useNotificationStore'

/**
 * Hook to listen for real-time notifications via WebSocket or SSE.
 * This is a placeholder implementation. In production, connect to your WebSocket service.
 *
 * Example usage:
 * ```tsx
 * function App() {
 *   useNotificationListener()
 *   return <YourApp />
 * }
 * ```
 */
export function useNotificationListener() {
  const { addNotification } = useNotificationStore()

  useEffect(() => {
    // TODO: Replace with actual WebSocket connection
    // Example WebSocket implementation:
    // const ws = new WebSocket('ws://your-backend-url/notifications')

    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data)
    //   addNotification({
    //     type: data.type,
    //     title: data.title,
    //     message: data.message,
    //     actionUrl: data.actionUrl,
    //   })
    // }

    // ws.onerror = (error) => {
    //   console.error('WebSocket error:', error)
    // }

    // return () => {
    //   ws.close()
    // }

    // Placeholder: Listen for custom events (for testing)
    const handleCustomNotification = (event: CustomEvent) => {
      addNotification(event.detail)
    }

    window.addEventListener('app:notification' as any, handleCustomNotification)

    return () => {
      window.removeEventListener('app:notification' as any, handleCustomNotification)
    }
  }, [addNotification])
}

/**
 * Utility function to trigger a notification programmatically.
 * Useful for testing or triggering notifications from anywhere in the app.
 *
 * Example:
 * ```tsx
 * triggerNotification({
 *   type: 'success',
 *   title: 'Match Won!',
 *   message: 'You won the match and earned $100!',
 *   actionUrl: '/dashboard/wallet'
 * })
 * ```
 */
export function triggerNotification(notification: {
  type: 'urgent' | 'info' | 'success' | 'warning' | 'social'
  title: string
  message: string
  actionUrl?: string
}) {
  window.dispatchEvent(
    new CustomEvent('app:notification', { detail: notification })
  )
}
