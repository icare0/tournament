# 🔔 Notification System

A complete, premium notification system for the Bloom Tournament Platform with real-time updates, filtering, and user preferences.

## Features

✨ **Premium Design**
- Follows Bloom design language (luxury minimalist aesthetic)
- Smooth animations and micro-interactions
- Type-specific styling (urgent, info, success, warning, social)
- Glass morphism and subtle shadows

🔔 **Notification Types**
- **Urgent** (🔴): Match starting soon, critical actions
- **Info** (🔵): Tournament announcements, general updates
- **Success** (🟢): Wins, prizes credited, achievements
- **Warning** (🟡): Disputes, required actions, alerts
- **Social** (🟣): Challenges, follows, messages

🎯 **Core Features**
- Unread badge with count (99+ cap)
- Mark as read/unread
- Mark all as read
- Filter by type (All, Urgent, Tournaments, Social, Financial)
- Delete individual notifications
- Clear all notifications
- Action URLs for clickable notifications
- Notification preferences (granular control)

💾 **Persistent Storage**
- Stores up to 50 most recent notifications
- Preferences saved to localStorage
- Survives page refreshes

🔄 **Real-time Ready**
- Hook for WebSocket/SSE integration
- Custom event system for testing
- Programmatic notification triggers

## Components

### `<NotificationBell />`
The main notification bell icon with badge.

```tsx
import { NotificationBell } from '@/components/notifications'

function Header() {
  return (
    <header>
      <NotificationBell />
    </header>
  )
}
```

### `<NotificationPanel />`
The dropdown panel showing all notifications.

Auto-rendered by `<NotificationBell />` when clicked.

### `<NotificationItem />`
Individual notification card with type-specific styling.

### `<NotificationPreferences />`
Modal for managing notification preferences.

### `<NotificationDemo />` (Development only)
Testing component to add sample notifications.

```tsx
import { NotificationDemo } from '@/components/notifications'

// Add to your development layout
function DevLayout() {
  return (
    <>
      <YourApp />
      <NotificationDemo />
    </>
  )
}
```

## Usage

### Basic Integration

1. Add the notification bell to your header/sidebar:

```tsx
// In your layout component
import { NotificationBell } from '@/components/notifications'

export default function Layout({ children }) {
  return (
    <div>
      <header>
        <NotificationBell />
      </header>
      {children}
    </div>
  )
}
```

2. Set up real-time listener (optional):

```tsx
// In your root layout or app component
'use client'

import { useNotificationListener } from '@/hooks/useNotificationListener'

export default function App() {
  useNotificationListener() // Connects to WebSocket/SSE

  return <YourApp />
}
```

### Triggering Notifications Programmatically

```tsx
import { useNotificationStore } from '@/lib/stores/useNotificationStore'

function YourComponent() {
  const { addNotification } = useNotificationStore()

  const handleMatchStart = () => {
    addNotification({
      type: 'urgent',
      title: 'Match Imminent !',
      message: 'Ton match commence dans 5 minutes !',
      actionUrl: '/dashboard/matches'
    })
  }

  return <button onClick={handleMatchStart}>Start Match</button>
}
```

Or use the helper function from anywhere:

```tsx
import { triggerNotification } from '@/hooks/useNotificationListener'

triggerNotification({
  type: 'success',
  title: 'Victory!',
  message: 'You won $150!',
  actionUrl: '/dashboard/wallet'
})
```

### Real-time Integration (Production)

Update `/hooks/useNotificationListener.ts` to connect to your WebSocket service:

```tsx
useEffect(() => {
  const ws = new WebSocket('wss://your-backend.com/notifications')

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    addNotification({
      type: data.type,
      title: data.title,
      message: data.message,
      actionUrl: data.actionUrl,
    })
  }

  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
  }

  return () => ws.close()
}, [addNotification])
```

## Store API

### `useNotificationStore`

```tsx
import { useNotificationStore } from '@/lib/stores/useNotificationStore'

// State
const {
  notifications,      // All notifications
  unreadCount,        // Number of unread notifications
  filter,             // Current filter
  preferences,        // User preferences
  isOpen,             // Panel open state
} = useNotificationStore()

// Actions
const {
  addNotification,           // Add a new notification
  markAsRead,                // Mark notification as read
  markAllAsRead,             // Mark all as read
  deleteNotification,        // Delete a notification
  clearAll,                  // Clear all notifications
  setFilter,                 // Set filter type
  setOpen,                   // Set panel open state
  updatePreferences,         // Update preferences
  getFilteredNotifications,  // Get notifications by current filter
} = useNotificationStore()
```

## Examples

### Match Starting Soon
```tsx
addNotification({
  type: 'urgent',
  title: 'Match Imminent !',
  message: 'Ton match commence dans 5 minutes ! Rejoins la salle.',
  actionUrl: '/dashboard/matches/123'
})
```

### Tournament Announcement
```tsx
addNotification({
  type: 'info',
  title: 'Nouveau Tournoi CS2',
  message: 'Prize pool de $10,000 ! Inscriptions ouvertes.',
  actionUrl: '/tournaments/cs2-championship'
})
```

### Prize Won
```tsx
addNotification({
  type: 'success',
  title: 'Félicitations !',
  message: 'Tu as fini 3ème et gagné $150 !',
  actionUrl: '/dashboard/wallet'
})
```

### Dispute Alert
```tsx
addNotification({
  type: 'warning',
  title: 'Dispute Créée',
  message: 'Une dispute a été créée. Fournis tes preuves sous 24h.',
  actionUrl: '/dashboard/matches/123/dispute'
})
```

### Challenge Received
```tsx
addNotification({
  type: 'social',
  title: 'Nouveau Challenge',
  message: 'ProGamer420 t\'a challengé en 1v1 !',
  actionUrl: '/challenges/456'
})
```

## Styling

All components use the Bloom design system:
- Colors: `bloom-accent`, `bloom-dark`, `bloom-sage`, `bloom-bg`
- Typography: Serif italic for titles, Sans for body
- Animations: Fade-in, pulse, scale transforms
- Premium aesthetic: No childish gaming vibes

## File Structure

```
components/notifications/
├── NotificationBell.tsx          # Bell icon with badge
├── NotificationPanel.tsx         # Dropdown panel
├── NotificationItem.tsx          # Individual notification
├── NotificationPreferences.tsx   # Preferences modal
├── NotificationDemo.tsx          # Testing component
├── index.ts                      # Barrel exports
└── README.md                     # This file

lib/
├── stores/
│   └── useNotificationStore.ts   # Zustand store
└── types/
    └── notification.ts            # TypeScript types

hooks/
└── useNotificationListener.ts    # Real-time listener hook
```

## Cleanup for Production

Before deploying to production:

1. Remove `<NotificationDemo />` component usage
2. Implement real WebSocket connection in `useNotificationListener.ts`
3. Connect notifications to backend events (match start, tournament updates, etc.)
4. Add proper error handling for WebSocket disconnections
5. Consider adding notification sound effects
6. Add push notification support for mobile

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Requires localStorage support

## Performance

- Stores max 50 notifications (configurable)
- Optimized re-renders with Zustand
- Efficient filtering with memoization
- Lazy-loaded preferences modal
- Smooth 60fps animations

---

Built with ❤️ for Bloom Tournament Platform
