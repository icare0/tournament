# ⏱️ Check-in & Match Management System

A comprehensive check-in and countdown system for tournament matches with real-time updates, urgent notifications, and premium Bloom design.

## Features

🔔 **Real-time Countdown**
- Live countdown timer to match start
- Updates every second
- Shows hours, minutes, and seconds
- Automatic state transitions

⏰ **Check-in Window Management**
- Configurable check-in window (default: 15 minutes before match)
- Automatic window opening/closing
- Visual indicators for check-in status
- Urgent mode in final 5 minutes

🚨 **Urgent Notifications**
- Animated urgent banner for matches requiring check-in
- Pulsing animations and gradient effects
- Auto-dismissible banner
- Links directly to match page

✅ **Check-in States**
- **Before Window**: Shows when check-in opens
- **Window Open**: Large check-in button with countdown
- **Urgent** (< 5 min): Red theme with pulse animations
- **Checked In**: Green confirmation state

🎨 **Premium Design**
- Follows Bloom design language
- Smooth animations and transitions
- Type-specific styling
- Mobile responsive

## Components

### `<CheckInCountdown />`

Real-time countdown with check-in button.

**Props:**
```tsx
interface CheckInCountdownProps {
  matchId: string
  matchStartTime: Date
  checkInWindowMinutes?: number  // Default: 15
  isCheckedIn: boolean
  onCheckIn: () => void
}
```

**Usage:**
```tsx
import { CheckInCountdown } from '@/components/matches'

<CheckInCountdown
  matchId="match-123"
  matchStartTime={new Date('2025-01-15T18:00:00')}
  checkInWindowMinutes={15}
  isCheckedIn={false}
  onCheckIn={() => handleCheckIn()}
/>
```

**States:**

1. **Before Window Opens**
```tsx
// Shows countdown until check-in opens
// Gray theme, clock icon
```

2. **Window Open (> 5 min remaining)**
```tsx
// Blue/Accent theme
// Large countdown display
// "Confirmer ma Présence" button
```

3. **Urgent (< 5 min remaining)**
```tsx
// Red theme with pulse animation
// "⚠️ CHECK-IN URGENT !" badge
// Warning message about disqualification
// "⚠️ Check-in Maintenant !" button
```

4. **Checked In**
```tsx
// Green theme
// Checkmark icon
// Shows time until match starts
```

### `<CheckInBanner />`

Sticky banner at top of page for urgent check-ins.

**Props:**
```tsx
interface CheckInBannerProps {
  matches: Match[]
}

interface Match {
  id: string
  name: string
  startTime: Date
  requiresCheckIn: boolean
  isCheckedIn: boolean
}
```

**Usage:**
```tsx
import { CheckInBanner } from '@/components/matches'

<CheckInBanner matches={userMatches} />
```

**Behavior:**
- Shows for most urgent match requiring check-in
- Appears when match starts in < 15 minutes
- Red theme when < 5 minutes (very urgent)
- Dismissible with X button
- Links to match detail page

### `<MatchCard />`

Display card for matches list with check-in indicators.

**Props:**
```tsx
interface MatchCardProps {
  match: {
    id: string
    tournament: {
      name: string
      game: string
    }
    opponent: {
      name: string
      avatar?: string
    }
    startTime: Date
    status: 'upcoming' | 'live' | 'completed'
    isCheckedIn: boolean
    requiresCheckIn: boolean
    result?: {
      won: boolean
      score: string
    }
  }
}
```

**Usage:**
```tsx
import { MatchCard } from '@/components/matches'

<MatchCard match={matchData} />
```

**Features:**
- Status badges (À venir, En cours, Terminé)
- Check-in indicator with icon
- Result display for completed matches
- Hover effects and animations
- Click to navigate to match details

## Pages

### `/dashboard/matches` - Matches List

**Features:**
- Check-in banner at top
- Stats cards (upcoming, live, wins, total)
- Filter tabs (All, Upcoming, Live, Completed)
- Grid of match cards
- Empty states

### `/dashboard/matches/[id]` - Match Detail

**Features:**
- Full check-in countdown component
- VS display with team info
- Match details (format, venue, map pool)
- Opponent team roster
- Rules section
- Quick action links (Discord, Stream, Tournament)

## Integration

### 1. Add to Dashboard Layout

```tsx
// In your dashboard layout
'use client'

import { CheckInBanner } from '@/components/matches'
import { useMatches } from '@/hooks/useMatches' // Your matches hook

export default function DashboardLayout({ children }) {
  const { matches } = useMatches()

  return (
    <div>
      <CheckInBanner matches={matches} />
      {children}
    </div>
  )
}
```

### 2. Handle Check-in

```tsx
import { useNotificationStore } from '@/lib/stores/useNotificationStore'

const handleCheckIn = async (matchId: string) => {
  try {
    // Call your API
    await api.post(`/matches/${matchId}/check-in`)

    // Update local state
    setMatch(prev => ({ ...prev, isCheckedIn: true }))

    // Show success notification
    addNotification({
      type: 'success',
      title: 'Check-in Confirmé !',
      message: 'Tu es prêt pour le match. Bonne chance !',
    })
  } catch (error) {
    addNotification({
      type: 'warning',
      title: 'Erreur de Check-in',
      message: 'Impossible de confirmer. Réessaye.',
    })
  }
}
```

### 3. Send Check-in Reminders

```tsx
// Backend: Send notification when check-in window opens
const sendCheckInReminder = (match: Match) => {
  sendNotification(match.userId, {
    type: 'urgent',
    title: 'Check-in Disponible !',
    message: `Ton match "${match.tournament.name}" commence bientôt. Check-in maintenant !`,
    actionUrl: `/dashboard/matches/${match.id}`
  })
}

// Schedule for 15 minutes before match
scheduleJob(match.startTime - 15 * 60 * 1000, () => {
  if (!match.isCheckedIn) {
    sendCheckInReminder(match)
  }
})
```

### 4. Auto-Forfeit Logic (Backend)

```tsx
// Check for no-shows at match start time
const checkForNoShows = async (match: Match) => {
  if (!match.isCheckedIn) {
    // Forfeit the match
    await Match.update(match.id, {
      status: 'forfeited',
      winnerId: match.opponent.id,
      forfeitReason: 'No check-in'
    })

    // Notify user
    sendNotification(match.userId, {
      type: 'warning',
      title: 'Match Forfait',
      message: 'Tu n\'as pas check-in à temps. Le match a été forfait.',
    })
  }
}

scheduleJob(match.startTime, () => checkForNoShows(match))
```

## Timing Configuration

```tsx
// Customize check-in window
const CHECK_IN_CONFIG = {
  windowMinutes: 15,      // Check-in opens 15 min before
  urgentMinutes: 5,       // Urgent mode at 5 min
  reminderMinutes: [15, 10, 5],  // Send reminders
  forfeitGraceSeconds: 60,  // Grace period after match start
}
```

## Animations

All components use premium animations:

```css
/* Pulse for urgent states */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Fade in for smooth transitions */
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

/* Urgent gradient animation */
.urgent-gradient {
  background: linear-gradient(90deg, #dc2626, #ea580c, #dc2626);
  background-size: 200% 100%;
  animation: gradient 3s linear infinite;
}
```

## Responsive Design

- Mobile: Full-width cards, stacked layout
- Tablet: 2-column grid
- Desktop: 2-3 column grid with sidebar

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly time announcements
- High contrast colors for urgent states
- Focus indicators

## Testing

Mock data included in `/app/(dashboard)/matches/page.tsx`:
- Upcoming match in 10 minutes (requires check-in)
- Upcoming match in 2 hours (checked in)
- Live match
- Completed match (won)
- Completed match (lost)

## Production Checklist

- [ ] Connect to real match API
- [ ] Implement WebSocket for real-time updates
- [ ] Add auto-forfeit logic (backend)
- [ ] Schedule check-in reminder notifications
- [ ] Add sound alerts for urgent check-ins
- [ ] Implement push notifications (mobile)
- [ ] Add analytics tracking for check-in rates
- [ ] Test time zones and DST handling
- [ ] Add admin controls for check-in requirements

---

Built with ❤️ for Bloom Tournament Platform
