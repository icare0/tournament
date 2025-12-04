export type NotificationType = 'urgent' | 'info' | 'success' | 'warning' | 'social'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  icon?: string
}

export interface NotificationPreferences {
  tournament: boolean
  match: boolean
  social: boolean
  financial: boolean
  system: boolean
}

export const NOTIFICATION_FILTERS = [
  { id: 'all', label: 'Tout' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'tournaments', label: 'Tournois' },
  { id: 'social', label: 'Social' },
  { id: 'financial', label: 'Financial' },
] as const

export type NotificationFilter = typeof NOTIFICATION_FILTERS[number]['id']
