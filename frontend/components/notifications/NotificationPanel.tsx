'use client'

import { useEffect, useRef, useState } from 'react'
import { Settings, CheckCheck, Trash2, Filter } from 'lucide-react'
import { useNotificationStore } from '@/lib/stores/useNotificationStore'
import { NotificationItem } from './NotificationItem'
import { NotificationPreferences } from './NotificationPreferences'
import { NOTIFICATION_FILTERS } from '@/lib/types/notification'

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [showPreferences, setShowPreferences] = useState(false)

  const {
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    getFilteredNotifications,
    unreadCount,
  } = useNotificationStore()

  const notifications = getFilteredNotifications()

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        className="absolute right-0 top-full mt-2 w-[420px] max-w-[95vw] bg-bloom-bg border-2 border-bloom-dark/10 rounded-xl shadow-2xl z-50 max-h-[600px] flex flex-col animate-fade-in"
      >
        {/* Header */}
        <div className="p-6 border-b border-bloom-dark/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-2xl italic text-bloom-dark">
              Notifications
            </h3>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-bloom-dark/5 transition-colors group"
              >
                <CheckCheck className="h-4 w-4 text-bloom-dark/40 group-hover:text-bloom-accent transition-colors" />
                <span className="font-sans text-xs text-bloom-dark/60 group-hover:text-bloom-dark transition-colors">
                  Tout marquer lu
                </span>
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {NOTIFICATION_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-full font-sans text-xs uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                  filter === f.id
                    ? 'bg-bloom-dark text-bloom-bg'
                    : 'bg-bloom-dark/5 text-bloom-dark/60 hover:bg-bloom-dark/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 bg-bloom-dark/5 rounded-full flex items-center justify-center mb-4">
                <Filter className="h-8 w-8 text-bloom-dark/30" />
              </div>
              <p className="font-serif text-lg italic text-bloom-dark/60 mb-1">
                Aucune notification
              </p>
              <p className="font-sans text-sm text-bloom-dark/40 text-center">
                {filter === 'all'
                  ? 'Vous êtes à jour !'
                  : 'Aucune notification dans cette catégorie'}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-bloom-dark/5 flex items-center justify-between">
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors group"
            >
              <Trash2 className="h-4 w-4 text-bloom-dark/40 group-hover:text-red-500 transition-colors" />
              <span className="font-sans text-xs text-bloom-dark/60 group-hover:text-red-600 transition-colors">
                Tout effacer
              </span>
            </button>

            <button
              onClick={() => setShowPreferences(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bloom-dark/5 transition-colors group"
            >
              <Settings className="h-4 w-4 text-bloom-dark/40 group-hover:text-bloom-accent transition-colors" />
              <span className="font-sans text-xs text-bloom-dark/60 group-hover:text-bloom-dark transition-colors">
                Préférences
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Preferences Modal */}
      <NotificationPreferences
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
    </>
  )
}
