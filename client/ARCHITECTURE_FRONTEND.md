# 🎮 Tournament Platform - Architecture Frontend

## 📐 Vue d'Ensemble de l'Architecture

### Stack Technique

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 14+ (App Router)                  │
├─────────────────────────────────────────────────────────────┤
│  React 18  │  TypeScript  │  Tailwind CSS  │  Shadcn/ui    │
├─────────────────────────────────────────────────────────────┤
│  TanStack Query  │  Zustand  │  React Hook Form  │  Zod    │
├─────────────────────────────────────────────────────────────┤
│  Socket.io Client  │  Axios  │  dnd-kit  │  Framer Motion │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Structure du Projet (Détaillée)

```
client/
├── src/
│   ├── app/                          # Next.js 14+ App Router
│   │   ├── (auth)/                   # Route Group (layout partagé)
│   │   │   ├── layout.tsx            # Layout auth (centré, minimal)
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # Page de connexion
│   │   │   └── register/
│   │   │       └── page.tsx          # Page d'inscription
│   │   │
│   │   ├── dashboard/                # Dashboard organisateur
│   │   │   ├── layout.tsx            # Layout avec sidebar
│   │   │   ├── page.tsx              # Vue d'ensemble (Mission Control)
│   │   │   ├── tournaments/
│   │   │   │   ├── page.tsx          # Liste des tournois
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Créer un tournoi
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Détails tournoi
│   │   │   │       ├── edit/
│   │   │   │       └── settings/
│   │   │   ├── schedule/
│   │   │   │   └── page.tsx          # Planning (drag-and-drop)
│   │   │   └── analytics/
│   │   │       └── page.tsx          # Analytics
│   │   │
│   │   ├── tournaments/              # Pages publiques tournois
│   │   │   ├── page.tsx              # Liste publique
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Vue publique
│   │   │       ├── bracket/
│   │   │       │   └── page.tsx      # Bracket interactif
│   │   │       ├── matches/
│   │   │       │   └── page.tsx      # Liste des matchs
│   │   │       └── stats/
│   │   │           └── page.tsx      # Statistiques
│   │   │
│   │   ├── layout.tsx                # Root Layout (providers)
│   │   ├── page.tsx                  # Homepage (landing)
│   │   └── providers.tsx             # React Query, Theme providers
│   │
│   ├── components/
│   │   ├── ui/                       # Composants Shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   └── features/                 # Composants métier
│   │       ├── bracket/
│   │       │   ├── Bracket.tsx       # ⭐ Composant principal
│   │       │   ├── BracketMatch.tsx  # Match dans le bracket
│   │       │   ├── BracketConnector.tsx # Connexions SVG
│   │       │   └── types.ts          # Types bracket
│   │       │
│   │       ├── dashboard/
│   │       │   ├── DashboardLayout.tsx # ⭐ Layout sidebar
│   │       │   ├── LiveMatchWidget.tsx # Widget matchs live
│   │       │   ├── StatsWidget.tsx     # Widget statistiques
│   │       │   └── DisputeWidget.tsx   # Widget litiges
│   │       │
│   │       ├── planning/
│   │       │   ├── ScheduleCalendar.tsx # ⭐ Calendrier Gantt
│   │       │   ├── MatchDragItem.tsx    # Item draggable
│   │       │   └── types.ts
│   │       │
│   │       └── tournament/
│   │           ├── TournamentCard.tsx
│   │           ├── TournamentForm.tsx
│   │           └── MatchCard.tsx
│   │
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useTournamentSocket.ts    # ⭐ WebSocket hook principal
│   │   ├── useMatchSocket.ts         # WebSocket pour match
│   │   ├── useAuth.ts                # Hook authentification
│   │   ├── useTournament.ts          # Hook tournoi (React Query)
│   │   └── useLocalStorage.ts        # Hook localStorage
│   │
│   ├── services/                     # API Services
│   │   ├── api.ts                    # ⭐ Instance Axios + intercepteurs
│   │   ├── tournament.service.ts     # Service tournois
│   │   ├── match.service.ts          # Service matchs
│   │   ├── auth.service.ts           # Service authentification
│   │   └── websocket.service.ts      # Service WebSocket
│   │
│   ├── stores/                       # Zustand Stores (UI State)
│   │   ├── useAuthStore.ts           # Store auth (persisted)
│   │   ├── useUIStore.ts             # Store UI (sidebar, theme)
│   │   └── useNotificationStore.ts   # Store notifications
│   │
│   ├── types/                        # TypeScript Types
│   │   ├── tournament.types.ts       # Types tournois, matchs, etc.
│   │   ├── api.types.ts              # Types API responses
│   │   └── user.types.ts             # Types utilisateurs
│   │
│   ├── lib/                          # Utilitaires
│   │   ├── utils.ts                  # cn(), helpers
│   │   ├── queryClient.ts            # Config TanStack Query
│   │   └── validations/              # Schémas Zod
│   │       ├── tournament.schema.ts
│   │       └── auth.schema.ts
│   │
│   └── styles/
│       └── globals.css               # Styles Tailwind + customs
│
├── public/
│   ├── images/
│   └── icons/
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

---

## 🔑 Modules Clés - Détails Techniques

### 1️⃣ Visual Bracket (Arbre de Tournoi)

**Fichiers:**
- `src/components/features/bracket/Bracket.tsx`
- `src/components/features/bracket/BracketMatch.tsx`
- `src/components/features/bracket/BracketConnector.tsx`

**Architecture:**

```
┌─────────────────────────────────────────┐
│      react-zoom-pan-pinch              │  ← Zoom/Pan wrapper
├─────────────────────────────────────────┤
│              SVG Canvas                 │  ← Scalable rendering
│  ┌─────────────────────────────────┐   │
│  │  BracketMatch (Round 1)         │   │  ← Composant Match
│  │  ┌──────────────┐               │   │
│  │  │ Team A  |  2 │               │   │
│  │  │ Team B  |  1 │               │   │
│  │  └──────────────┘               │   │
│  └─────────────────────────────────┘   │
│           │                             │
│           └─ BracketConnector ─────→    │  ← Connexions SVG
└─────────────────────────────────────────┘
```

**Choix Technique: SVG vs Canvas vs DOM**

| Solution | Avantages | Inconvénients | Verdict |
|----------|-----------|---------------|---------|
| **SVG** ✅ | - Scalable sans perte<br>- Facile à styliser (CSS/Tailwind)<br>- Accessible<br>- Interactivité native | - Performance moyenne à 500+ éléments | **Choisi** |
| Canvas | - Performance maximale | - Complexe à implémenter<br>- Pas d'accessibilité native | Non |
| DOM pur | - Simple | - Ralentit avec 100+ éléments | Non |

**Structure de données attendue:**

```typescript
interface BracketData {
  type: TournamentType  // SINGLE_ELIMINATION, DOUBLE_ELIMINATION
  rounds: BracketRound[]
  participants: Participant[]
}

interface BracketRound {
  round: number
  name: string  // "Quarter Finals", "Semi Finals", etc.
  matches: Match[]
}

interface Match {
  id: string
  homeParticipantId: string
  awayParticipantId: string
  homeScore: number
  awayScore: number
  winnerId?: string
  status: MatchStatus  // PENDING, LIVE, COMPLETED
}
```

**Algorithme de Layout:**

```typescript
function calculateBracketPosition(round: number, matchIndex: number) {
  const roundSpacing = 350  // Espacement horizontal entre rounds
  const matchSpacing = 100  // Espacement vertical de base
  const baseSpacing = Math.pow(2, round)  // Espacement exponentiel

  return {
    x: round * roundSpacing,
    y: matchIndex * matchSpacing * baseSpacing
  }
}
```

**Performance:**
- Lazy rendering des rounds hors viewport
- Virtualisation si > 256 participants
- Debounce sur les événements pan/zoom

---

### 2️⃣ Dashboard "Mission Control"

**Fichiers:**
- `src/components/features/dashboard/DashboardLayout.tsx`
- `src/components/features/dashboard/LiveMatchWidget.tsx`
- `src/components/features/dashboard/StatsWidget.tsx`

**Architecture:**

```
┌──────────────────────────────────────────────────────────┐
│  Sidebar (Collapsible)    │    Main Content             │
│  ┌──────────────────────┐ │  ┌────────────────────────┐ │
│  │ 🏠 Dashboard         │ │  │  Header (Actions)      │ │
│  │ 🏆 Tournaments       │ │  ├────────────────────────┤ │
│  │ 📅 Schedule          │ │  │  Stats Grid (4 cards)  │ │
│  │ 👥 Participants      │ │  ├────────────────────────┤ │
│  │ 📊 Analytics         │ │  │  Live Matches Widget   │ │
│  │ ⚙️  Settings          │ │  │  (WebSocket updates)   │ │
│  └──────────────────────┘ │  └────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

**Layout Technique:**

```tsx
<div className="flex h-screen">
  {/* Sidebar - Fixed */}
  <aside className={cn(
    'fixed inset-y-0 left-0 z-50',
    isSidebarOpen ? 'w-64' : 'w-20',
    'transition-all duration-300'
  )}>
    <Sidebar />
  </aside>

  {/* Main - Scrollable */}
  <main className="flex-1 overflow-y-auto">
    <Header />
    <div className="p-6">{children}</div>
  </main>
</div>
```

**Widgets Temps Réel:**

```tsx
// LiveMatchWidget.tsx
export function LiveMatchWidget() {
  // React Query avec refetch automatique
  const { data } = useQuery({
    queryKey: ['matches', 'live'],
    queryFn: () => matchService.getLive(),
    refetchInterval: 10000,  // Refetch toutes les 10s
  })

  // WebSocket pour mises à jour instantanées
  useTournamentSocket(tournamentId, {
    onMatchUpdate: (data) => {
      queryClient.invalidateQueries(['matches', 'live'])
    }
  })

  // ...
}
```

**Optimisations:**
- Server Components pour le shell (layout, header)
- Client Components uniquement pour les widgets interactifs
- Suspense boundaries pour le streaming

---

### 3️⃣ Gestion Temps Réel (WebSocket)

**Fichier:** `src/hooks/useTournamentSocket.ts`

**Architecture:**

```
┌─────────────────────────────────────────────────────┐
│              Frontend (React)                        │
│  ┌────────────────────────────────────────────────┐ │
│  │  useTournamentSocket(tournamentId)             │ │
│  │  ┌──────────────────────────────────────────┐  │ │
│  │  │  1. Connect to Socket.io                 │  │ │
│  │  │  2. socket.emit('joinTournament', id)    │  │ │
│  │  │  3. Listen to events:                    │  │ │
│  │  │     - matchUpdate                        │  │ │
│  │  │     - tournamentUpdate                   │  │ │
│  │  │     - notification                       │  │ │
│  │  └──────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                         ↕ WebSocket
┌─────────────────────────────────────────────────────┐
│              Backend (NestJS)                        │
│  ┌────────────────────────────────────────────────┐ │
│  │  RealtimeGateway (@WebSocketGateway)          │ │
│  │  ┌──────────────────────────────────────────┐  │ │
│  │  │  handleJoinTournament(tournamentId)      │  │ │
│  │  │  handleMatchUpdate(matchId, data)        │  │ │
│  │  │  server.to(tournamentId).emit(...)       │  │ │
│  │  └──────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Code Complet du Hook:**

```typescript
export function useTournamentSocket(tournamentId: string, options) {
  const queryClient = useQueryClient()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')

    // 1. Créer la connexion Socket.io
    const socket = io(WS_URL, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
    })

    socketRef.current = socket

    // 2. Events de connexion
    socket.on('connect', () => {
      setIsConnected(true)
      socket.emit('joinTournament', tournamentId)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    // 3. Events métier
    socket.on('matchUpdate', (data: MatchUpdateEvent) => {
      // Invalider le cache React Query
      queryClient.invalidateQueries(['matches', tournamentId])
      queryClient.invalidateQueries(['match', data.matchId])
      queryClient.invalidateQueries(['bracket', tournamentId])

      // Callback custom
      options.onMatchUpdate?.(data)
    })

    socket.on('tournamentUpdate', (data: TournamentUpdateEvent) => {
      queryClient.invalidateQueries(['tournament', tournamentId])
      options.onTournamentUpdate?.(data)
    })

    // 4. Cleanup
    return () => {
      socket.emit('leaveTournament', tournamentId)
      socket.disconnect()
    }
  }, [tournamentId])

  return { isConnected, socket: socketRef.current }
}
```

**Stratégie d'Invalidation Cache:**

| Event | Queries Invalidées |
|-------|-------------------|
| `matchUpdate` | `['matches', tournamentId]`<br>`['match', matchId]`<br>`['bracket', tournamentId]` |
| `tournamentUpdate` | `['tournament', tournamentId]`<br>`['tournaments']` |
| `notification` | `['notifications']` |

**Gestion des Reconnexions:**
- Auto-reconnect avec backoff exponentiel
- Re-join automatique des rooms après reconnexion
- Buffer des events pendant la déconnexion (côté backend)

---

### 4️⃣ UX de Planification (Drag & Drop)

**Fichiers:**
- `src/components/features/planning/ScheduleCalendar.tsx`
- `src/components/features/planning/MatchDragItem.tsx`

**Architecture:**

```
┌─────────────────────────────────────────────────────────┐
│           DndContext (@dnd-kit/core)                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Calendar Grid (7 days x 12 hours)               │  │
│  │  ┌──────┬──────┬──────┬──────┬──────┬──────┐     │  │
│  │  │ Mon  │ Tue  │ Wed  │ Thu  │ Fri  │ Sat  │     │  │
│  │  ├──────┼──────┼──────┼──────┼──────┼──────┤     │  │
│  │  │ 9:00 │      │ 🎮   │      │      │      │     │  │
│  │  │10:00 │ 🎮   │      │ 🎮   │      │      │     │  │
│  │  │11:00 │      │      │      │      │ 🎮   │     │  │
│  │  └──────┴──────┴──────┴──────┴──────┴──────┘     │  │
│  │                                                   │  │
│  │  Unscheduled Matches (Droppable)                 │  │
│  │  [Match 1] [Match 2] [Match 3]                   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Librairies:**

```json
{
  "@dnd-kit/core": "^6.1.0",       // Core DnD logic
  "@dnd-kit/sortable": "^8.0.0",   // Sorting strategies
  "@dnd-kit/utilities": "^3.2.2"   // Helpers
}
```

**Flow Drag & Drop:**

```typescript
// 1. Drag start - Capture le match
const handleDragStart = (event: DragStartEvent) => {
  const match = matches.find(m => m.id === event.active.id)
  setActiveMatch({ match })
}

// 2. Drag end - Update le schedule
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event
  if (!over) return

  const matchId = active.id as string
  const slotId = over.id as string

  // Update local state
  setScheduleSlots(slots => {
    return slots.map(slot => {
      if (slot.id === slotId) {
        return { ...slot, matchId, match }
      }
      if (slot.matchId === matchId) {
        return { ...slot, matchId: undefined }
      }
      return slot
    })
  })

  // Sync avec backend
  onScheduleChange?.(matchId, slotId)
}
```

**Optimisations:**
- Virtualisation du calendrier (visible days only)
- Debounce des mutations backend
- Optimistic updates

---

## 🎨 Design System & Styling

### Tailwind Custom Config

```typescript
// tailwind.config.ts
{
  theme: {
    extend: {
      colors: {
        gaming: {
          purple: '#8B5CF6',
          blue: '#3B82F6',
          cyan: '#06B6D4',
          gold: '#F59E0B',
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.8)'
          },
        },
      },
    }
  }
}
```

### Glassmorphism

```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

---

## ⚡ Performance Optimizations

### 1. Server vs Client Components

```tsx
// ✅ Server Component (default)
export default async function TournamentPage({ params }) {
  const tournament = await fetchTournament(params.id)
  return <TournamentDetails data={tournament} />
}

// ✅ Client Component (interactivité)
'use client'
export function BracketInteractive({ data }) {
  const [zoom, setZoom] = useState(1)
  // ...
}
```

### 2. React Query Caching

```typescript
const queryConfig = {
  staleTime: 5 * 60 * 1000,  // Fresh for 5 min
  gcTime: 10 * 60 * 1000,    // Cache for 10 min
  refetchOnWindowFocus: false,
}
```

### 3. Code Splitting

```tsx
import dynamic from 'next/dynamic'

const Bracket = dynamic(
  () => import('@/components/features/bracket/Bracket'),
  {
    loading: () => <BracketSkeleton />,
    ssr: false  // Client-only pour SVG interactif
  }
)
```

---

## 🔐 Authentification JWT

### Flow Complet

```
┌──────────────────────────────────────────────────────┐
│  1. Login                                             │
│     POST /api/v1/auth/login                          │
│     → { accessToken, refreshToken, user }            │
│                                                       │
│  2. Store Tokens                                     │
│     localStorage.setItem('accessToken', ...)         │
│     useAuthStore.setTokens(...)                      │
│                                                       │
│  3. API Request                                      │
│     api.interceptors.request.use((config) => {       │
│       config.headers.Authorization = `Bearer ${token}`│
│     })                                                │
│                                                       │
│  4. Token Expired (401)                              │
│     → Try refresh token                              │
│     → If success: retry request                      │
│     → If fail: redirect to login                     │
└──────────────────────────────────────────────────────┘
```

### Intercepteur Axios

```typescript
// src/services/api.ts
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refreshToken')
      const { accessToken } = await refreshTokenAPI(refreshToken)

      localStorage.setItem('accessToken', accessToken)
      originalRequest.headers.Authorization = `Bearer ${accessToken}`

      return api(originalRequest)  // Retry
    }

    return Promise.reject(error)
  }
)
```

---

## 📱 Responsive Design

### Breakpoints

```
sm:  640px   → Mobile landscape
md:  768px   → Tablet
lg:  1024px  → Desktop
xl:  1280px  → Large desktop
2xl: 1536px  → Ultra-wide
```

### Sidebar Mobile

```tsx
<aside className={cn(
  'fixed inset-y-0 left-0 z-50',
  'transition-all duration-300',
  isSidebarOpen ? 'w-64' : 'w-20',
  // Mobile: overlay
  'lg:relative lg:translate-x-0'
)}>
```

---

## 🧪 Testing Strategy (À Implémenter)

### Unit Tests
- Vitest + React Testing Library
- Hooks testing (`useTournamentSocket`, `useAuth`)
- Utils (`cn()`, formatters)

### Integration Tests
- Page rendering
- API calls mocking
- WebSocket events simulation

### E2E Tests
- Playwright
- Critical flows: Login → Create Tournament → View Bracket

---

## 🚀 Prochaines Étapes

### Phase 1 : Core Features
- ✅ Structure projet
- ✅ API client + WebSocket
- ✅ Bracket component
- ✅ Dashboard layout
- ✅ Planning UI
- ⏳ Shadcn/ui components (installer via CLI)
- ⏳ Formulaires (React Hook Form + Zod)

### Phase 2 : Polish
- Animations (Framer Motion)
- Dark/Light theme toggle
- Notifications toast
- Error boundaries
- Loading states

### Phase 3 : Advanced
- PWA (offline mode)
- Real-time chat
- Video streaming integration
- Mobile app (React Native)

---

**Auteur:** Senior Frontend Architect
**Version:** 1.0
**Date:** 2025-11-29
