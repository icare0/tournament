# Real-Time Architecture - WebSocket Integration

## 🎯 Overview

Complete real-time system using Socket.io for tournament updates with automatic TanStack Query invalidation.

---

## 📐 Architecture

```
Backend (NestJS + Socket.io)
  ↓ emit events
WebSocket Connection (socket.io-client)
  ↓ receive events
useTournamentSocket Hook
  ↓ invalidate queries
TanStack Query Cache
  ↓ re-fetch data
React Components (auto-update)
```

---

## 🔌 WebSocket Configuration

### File: `lib/websocket.ts`

**Features:**
- ✅ Singleton socket instance
- ✅ Auto-reconnection (5 attempts, exponential backoff)
- ✅ JWT authentication on connect
- ✅ Token refresh on reconnect
- ✅ Room-based architecture (join/leave tournament rooms)

**API:**

```typescript
import { connectSocket, joinTournamentRoom, leaveTournamentRoom } from '@/lib/websocket'

// Connect to WebSocket server
connectSocket()

// Join tournament room
joinTournamentRoom('tournament-123')

// Leave room
leaveTournamentRoom('tournament-123')
```

### Connection Options

```typescript
{
  autoConnect: false,        // Manual connection control
  reconnection: true,
  reconnectionDelay: 1000,   // Start at 1s
  reconnectionDelayMax: 5000, // Max 5s
  reconnectionAttempts: 5,
  transports: ['websocket', 'polling'],
  auth: (cb) => {
    const token = tokenManager.getToken()
    cb({ token })
  }
}
```

---

## 🎣 useTournamentSocket Hook

### File: `lib/hooks/use-tournament-socket.ts`

**Purpose:** Automatic WebSocket connection + TanStack Query invalidation

**Usage:**

```typescript
import { useTournamentSocket } from '@/lib/hooks/use-tournament-socket'

const { socket, isConnected } = useTournamentSocket({
  tournamentId: 't1',
  enabled: true,
  onMatchUpdate: (data) => {
    console.log('Match updated:', data)
  },
  onAlert: (data) => {
    console.log('New alert:', data)
  },
})
```

### Events Handled

| Event | Triggered When | Query Invalidated |
|-------|----------------|-------------------|
| `match:update` | Match data changes | `['matches', tournamentId]` |
| `match:start` | Match starts | `['matches', tournamentId]` |
| `match:complete` | Match ends | `['matches', tournamentId]`, `['tournament', tournamentId, 'stats']` |
| `match:dispute` | Dispute filed | `['disputes', tournamentId]` |
| `tournament:status` | Tournament status changes | `['tournament', tournamentId]` |
| `tournament:update` | Tournament updated | `['tournament', tournamentId]`, `['matches', tournamentId]` |
| `participant:join` | Player joins | `['tournament', tournamentId, 'participants']` |
| `chat:message` | New chat message | `['chat', tournamentId]` |
| `alert:new` | New alert | `['alerts', tournamentId]` |

### Automatic Cleanup

```typescript
useEffect(() => {
  // Join room on mount
  joinTournamentRoom(tournamentId)

  // Register event listeners
  socket.on('match:update', handleMatchUpdate)

  // Cleanup on unmount
  return () => {
    leaveTournamentRoom(tournamentId)
    socket.off('match:update', handleMatchUpdate)
  }
}, [tournamentId])
```

---

## 🎨 Dashboard Components

### 1. LiveMatchesPanel

**File:** `features/tournaments/components/live-matches-panel.tsx`

**Features:**
- ✅ Real-time live matches display
- ✅ Animated pulse for LIVE status (green)
- ✅ Live scores with winner highlight
- ✅ "Up Next" section (3 upcoming matches)
- ✅ Click to manage match

**Props:**

```typescript
interface LiveMatchesPanelProps {
  matches: Match[]
  onMatchClick?: (match: Match) => void
  className?: string
}
```

**UI Design:**
- Live matches: Green border, pulse animation, 2px border
- Participant names with seed numbers
- Score display (tabular-nums font)
- Trophy icon for winner
- "Manage Match" button

### 2. DisputesPanel

**File:** `features/tournaments/components/disputes-panel.tsx`

**Features:**
- ✅ **Blinking animation** when new alerts arrive (5 seconds)
- ✅ Alert type badges (dispute, warning, info)
- ✅ Click to resolve alert
- ✅ Collapsed "Resolved alerts" section
- ✅ Color-coded alerts

**Alert Types:**

| Type | Color | Icon | Use Case |
|------|-------|------|----------|
| `dispute` | Red | ⚠️ | Match result disputed |
| `warning` | Orange | ⚠️ | Technical issues, disconnects |
| `info` | Blue | 🔔 | General notifications |

**Blink Trigger:**

```typescript
useEffect(() => {
  if (hasUnresolved) {
    setIsBlinking(true)
    const timer = setTimeout(() => setIsBlinking(false), 5000)
    return () => clearTimeout(timer)
  }
}, [alerts.length]) // Trigger on new alerts
```

**CSS Animation:**

```tsx
className={cn(
  hasUnresolved && isBlinking && 'ring-2 ring-destructive animate-pulse'
)}
```

### 3. RefereeChat

**File:** `features/tournaments/components/referee-chat.tsx`

**Features:**
- ✅ Real-time chat with referees
- ✅ Role-based colors (ORG, REF, ADM)
- ✅ Auto-scroll to bottom on new messages
- ✅ Send message (Enter key or button)
- ✅ Message bubbles (left/right based on user)

**Roles:**

| Role | Badge | Color |
|------|-------|-------|
| ORGANIZER | ORG | Primary |
| REFEREE | REF | Orange |
| ADMIN | ADM | Red |

**Send Message:**

```typescript
const handleSend = () => {
  if (messageInput.trim()) {
    onSendMessage(messageInput.trim())
    setMessageInput('')
  }
}

// Enter key support
const handleKeyPress = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
```

### 4. MatchQuickEdit Modal

**File:** `features/tournaments/components/match-quick-edit.tsx`

**Features:**
- ✅ Quick score entry (number inputs)
- ✅ Click participant to select winner
- ✅ "Start Match Now" button (SCHEDULED → IN_PROGRESS)
- ✅ "Complete Match" button (validation required)
- ✅ Winner highlight (border + trophy)

**Workflow:**

```
1. Click match in LiveMatchesPanel
   ↓
2. Modal opens
   ↓
3. Enter scores + select winner
   ↓
4. Click "Complete Match"
   ↓
5. onSubmit callback → API call
   ↓
6. WebSocket event → Auto-refresh
```

---

## 🎛️ Mission Control Page

### File: `app/(dashboard)/tournaments/[id]/control/page.tsx`

**Grid Layout:**

```
┌─────────────────────────────────────────────────────┐
│  HEADER: Mission Control + Live Badge               │
├─────────────────────────────────────────────────────┤
│  STATS: [Live] [Participants] [Prize] [Progress]    │
├──────────────┬──────────────┬──────────────────────┤
│              │              │                       │
│ Live Matches │   Disputes   │    Referee Chat      │
│   Panel      │    Panel     │                       │
│              │              │                       │
│  (col-1)     │   (col-1)    │      (col-1)         │
│              │              │                       │
└──────────────┴──────────────┴──────────────────────┘
```

**Grid CSS:**

```tsx
<div className="grid gap-6 lg:grid-cols-3">
  <LiveMatchesPanel className="lg:col-span-1 h-[600px]" />
  <DisputesPanel className="lg:col-span-1 h-[600px]" />
  <RefereeChat className="lg:col-span-1 h-[600px]" />
</div>
```

**Connection Status Badge:**

```tsx
<Badge variant={isConnected ? 'default' : 'destructive'}>
  {isConnected ? (
    <><Wifi className="w-3 h-3" /> Live</>
  ) : (
    <><WifiOff className="w-3 h-3" /> Disconnected</>
  )}
</Badge>
```

**Stats Cards:**

- Live Matches (with Activity icon)
- Participants (with Users icon)
- Prize Pool (with Trophy icon)
- Progress % (with TrendingUp icon)

---

## 🔄 Data Flow

### Real-Time Update Flow

```
1. Backend emits event
   socket.emit('match:update', { matchId, tournamentId })

2. useTournamentSocket receives
   socket.on('match:update', handleMatchUpdate)

3. Query invalidation
   queryClient.invalidateQueries(['matches', tournamentId])

4. TanStack Query re-fetches
   useQuery({ queryKey: ['matches', tournamentId] })

5. React components re-render
   LiveMatchesPanel updates automatically
```

### Manual Update Flow

```
1. User edits match in MatchQuickEdit
   onSubmit(matchId, { scores, winnerId })

2. API call
   await apiClient.patch(`/matches/${matchId}`, data)

3. Backend broadcasts event
   socket.broadcast.to(tournamentId).emit('match:update', data)

4. All connected clients receive update
   (Including the one who made the change)
```

---

## 🚀 Usage Examples

### Example 1: Tournament Page with Real-Time

```tsx
'use client'

import { useTournamentSocket } from '@/lib/hooks/use-tournament-socket'
import { useQuery } from '@tanstack/react-query'

export default function TournamentPage({ tournamentId }) {
  // Auto-updates on WebSocket events
  const { data: matches } = useQuery({
    queryKey: ['matches', tournamentId],
    queryFn: () => fetchMatches(tournamentId),
  })

  // Connect to real-time updates
  const { isConnected } = useTournamentSocket({
    tournamentId,
    enabled: true,
  })

  return (
    <div>
      <TournamentBracket matches={matches} />
      {isConnected && <Badge>Live</Badge>}
    </div>
  )
}
```

### Example 2: Custom Event Handler

```tsx
const { socket } = useTournamentSocket({
  tournamentId,
  onMatchUpdate: (data) => {
    // Custom logic on match update
    toast.success(`Match ${data.matchId} updated!`)
  },
  onAlert: (data) => {
    // Show notification
    if (data.alert.type === 'dispute') {
      playSound('alert')
    }
  },
})
```

### Example 3: Manual WebSocket Emit

```tsx
import { emitEvent } from '@/lib/websocket'

// Send custom event
emitEvent('match:action', {
  matchId: 'm1',
  action: 'pause',
})
```

---

## 🔐 Security

### JWT Authentication

```typescript
// On connect/reconnect
socket.auth = { token: tokenManager.getToken() }

// Backend validates token
io.use((socket, next) => {
  const token = socket.handshake.auth.token
  const user = verifyToken(token)
  if (!user) return next(new Error('Unauthorized'))
  socket.userId = user.id
  next()
})
```

### Room Authorization

```typescript
// Backend: Only allow authorized users to join rooms
socket.on('tournament:join', async ({ tournamentId }) => {
  const canAccess = await checkTournamentAccess(socket.userId, tournamentId)
  if (!canAccess) return

  socket.join(tournamentId)
})
```

---

## 📊 Performance Considerations

### 1. Query Invalidation Optimization

```typescript
// Invalidate specific queries only
queryClient.invalidateQueries({
  queryKey: ['matches', tournamentId],
  exact: false, // Include nested queries
})

// Don't invalidate everything
queryClient.invalidateQueries() // ❌ Too broad
```

### 2. Debounce Rapid Updates

```typescript
const debouncedInvalidate = useMemo(
  () => debounce((key) => {
    queryClient.invalidateQueries({ queryKey: key })
  }, 300),
  [queryClient]
)
```

### 3. Lazy Connection

```typescript
// Only connect when needed
const { socket } = useTournamentSocket({
  tournamentId,
  enabled: isVisible && isAuthenticated,
})
```

---

## 🐛 Troubleshooting

### WebSocket Not Connecting

**Check:**
1. `NEXT_PUBLIC_WS_URL` environment variable
2. CORS settings on backend
3. JWT token validity
4. Network/firewall blocking WebSocket

**Debug:**
```typescript
const socket = getSocket()
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message)
})
```

### Events Not Received

**Check:**
1. Room joined (`tournament:join` emitted)
2. Event name spelling (case-sensitive)
3. Backend emitting to correct room
4. User has permission to access tournament

### Queries Not Invalidating

**Check:**
1. Query key matches exactly
2. `useQuery` called with same key
3. TanStack Query DevTools to inspect cache
4. `queryClient` instance is the same

---

## 📦 Dependencies

```json
{
  "socket.io-client": "^4.6.1",
  "@tanstack/react-query": "^5.90.11"
}
```

---

## 🎉 Features Summary

✅ **WebSocket Configuration** - Auto-reconnect, JWT auth, room-based
✅ **useTournamentSocket Hook** - Automatic query invalidation
✅ **LiveMatchesPanel** - Real-time match updates with animations
✅ **DisputesPanel** - Blinking alerts, color-coded, auto-resolve
✅ **RefereeChat** - Real-time messaging with role colors
✅ **MatchQuickEdit** - Quick score entry modal
✅ **Mission Control** - Complete dashboard with grid layout
✅ **Type-Safe** - Full TypeScript support
✅ **Performance** - Optimized invalidation, debouncing
✅ **Security** - JWT auth, room authorization

---

**Production Ready!** 🚀

All real-time features are fully functional with mock data. Connect to backend API to go live.
