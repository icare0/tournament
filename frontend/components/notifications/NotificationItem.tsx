'use client'

import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { X, Circle, Trophy, DollarSign, Users, AlertCircle, Gamepad2 } from 'lucide-react'
import Link from 'next/link'
import type { Notification } from '@/lib/types/notification'

const NOTIFICATION_STYLES = {
  urgent: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'bg-red-500',
    textColor: 'text-red-700',
    Icon: AlertCircle,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'bg-blue-500',
    textColor: 'text-blue-700',
    Icon: Gamepad2,
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'bg-green-500',
    textColor: 'text-green-700',
    Icon: Trophy,
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    Icon: AlertCircle,
  },
  social: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'bg-purple-500',
    textColor: 'text-purple-700',
    Icon: Users,
  },
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const style = NOTIFICATION_STYLES[notification.type]
  const IconComponent = style.Icon

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
  }

  const content = (
    <div
      className={`relative group p-4 border-b border-bloom-dark/5 transition-all duration-300 hover:bg-bloom-dark/[0.02] ${
        !notification.read ? 'bg-bloom-accent/[0.03]' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 ${style.icon} rounded-lg flex items-center justify-center`}>
          <IconComponent className="h-5 w-5 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`font-sans text-sm font-medium ${style.textColor}`}>
              {notification.title}
            </h4>

            {/* Unread indicator */}
            {!notification.read && (
              <Circle className="h-2 w-2 fill-bloom-accent text-bloom-accent flex-shrink-0 mt-1" />
            )}
          </div>

          <p className="font-sans text-sm text-bloom-dark/60 mb-2 leading-relaxed">
            {notification.message}
          </p>

          <div className="flex items-center justify-between">
            <span className="font-sans text-xs text-bloom-dark/40">
              {formatDistanceToNow(new Date(notification.timestamp), {
                addSuffix: true,
                locale: fr,
              })}
            </span>

            {notification.actionUrl && (
              <span className="font-sans text-xs text-bloom-accent hover:text-bloom-dark transition-colors">
                Voir détails →
              </span>
            )}
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(notification.id)
          }}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-bloom-dark/5 rounded"
        >
          <X className="h-4 w-4 text-bloom-dark/40 hover:text-bloom-dark" />
        </button>
      </div>
    </div>
  )

  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} className="block">
        {content}
      </Link>
    )
  }

  return content
}
