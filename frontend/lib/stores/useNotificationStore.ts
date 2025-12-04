import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notification, NotificationFilter, NotificationPreferences } from '@/lib/types/notification'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  filter: NotificationFilter
  preferences: NotificationPreferences
  isOpen: boolean

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
  setFilter: (filter: NotificationFilter) => void
  setOpen: (isOpen: boolean) => void
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void
  getFilteredNotifications: () => Notification[]
}

const defaultPreferences: NotificationPreferences = {
  tournament: true,
  match: true,
  social: true,
  financial: true,
  system: true,
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      filter: 'all',
      preferences: defaultPreferences,
      isOpen: false,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          read: false,
        }

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }))
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }))
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }))
      },

      deleteNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: notification && !notification.read
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
          }
        })
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 })
      },

      setFilter: (filter) => {
        set({ filter })
      },

      setOpen: (isOpen) => {
        set({ isOpen })
      },

      updatePreferences: (preferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...preferences },
        }))
      },

      getFilteredNotifications: () => {
        const { notifications, filter } = get()

        if (filter === 'all') {
          return notifications
        }

        if (filter === 'urgent') {
          return notifications.filter((n) => n.type === 'urgent')
        }

        if (filter === 'tournaments') {
          return notifications.filter((n) =>
            n.type === 'info' || n.type === 'urgent'
          )
        }

        if (filter === 'social') {
          return notifications.filter((n) => n.type === 'social')
        }

        if (filter === 'financial') {
          return notifications.filter((n) =>
            n.type === 'success' && n.message.includes('$')
          )
        }

        return notifications
      },
    }),
    {
      name: 'bloom-notifications-v1',
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 50), // Keep only 50 most recent
        preferences: state.preferences,
      }),
    }
  )
)
