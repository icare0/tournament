'use client'

import { useNotificationStore } from '@/lib/stores/useNotificationStore'
import { Button } from '@/components/ui/button'

/**
 * Demo component for testing notifications.
 * Remove this component in production.
 */
export function NotificationDemo() {
  const { addNotification } = useNotificationStore()

  const sampleNotifications = [
    {
      type: 'urgent' as const,
      title: 'Match Imminent !',
      message: 'Ton match commence dans 5 minutes ! Rejoins la salle maintenant.',
      actionUrl: '/dashboard/matches',
    },
    {
      type: 'info' as const,
      title: 'Nouveau Tournoi Disponible',
      message: 'Tournoi CS2 avec $10,000 de prize pool commence demain !',
      actionUrl: '/discover',
    },
    {
      type: 'success' as const,
      title: 'Félicitations !',
      message: 'Tu as fini 3ème ! $150 ont été crédités sur ton compte.',
      actionUrl: '/dashboard/wallet',
    },
    {
      type: 'warning' as const,
      title: 'Dispute Créée',
      message: 'Une dispute a été créée sur ton match. Veuillez fournir des preuves.',
      actionUrl: '/dashboard/matches',
    },
    {
      type: 'social' as const,
      title: 'Nouveau Challenge !',
      message: 'ProPlayer123 t\'a challengé pour un match 1v1 !',
      actionUrl: '/dashboard',
    },
  ]

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border-2 border-bloom-dark/10 rounded-lg p-4 shadow-xl max-w-xs">
      <h4 className="font-serif text-lg italic mb-2">Test Notifications</h4>
      <div className="space-y-2">
        {sampleNotifications.map((notif, index) => (
          <Button
            key={index}
            onClick={() => addNotification(notif)}
            variant="outline"
            size="sm"
            className="w-full text-xs"
          >
            Add {notif.type}
          </Button>
        ))}
      </div>
    </div>
  )
}
