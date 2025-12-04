'use client'

import { Bell } from 'lucide-react'
import { useState } from 'react'
import { useNotificationStore } from '@/lib/stores/useNotificationStore'
import { NotificationPanel } from './NotificationPanel'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { unreadCount, setOpen } = useNotificationStore()

  const handleToggle = () => {
    const newState = !isOpen
    setIsOpen(newState)
    setOpen(newState)
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 hover:bg-bloom-dark/5 rounded-lg transition-all duration-300 group"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-bloom-dark/70 group-hover:text-bloom-accent transition-colors" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-bloom-accent text-white text-xs font-sans font-medium rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Pulse animation for new notifications */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-bloom-accent rounded-full animate-ping opacity-20" />
        )}
      </button>

      <NotificationPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  )
}
