# 🎮 Tournament Platform - Frontend

Next-Gen Esports Tournament Management Platform - React Frontend avec Next.js 14+

## 📁 Structure du Projet

```
client/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Groupe de routes auth (layout partagé)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/                # Dashboard organisateur
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── tournaments/
│   │   ├── tournaments/              # Pages publiques tournois
│   │   │   ├── [id]/
│   │   │   │   ├── bracket/          # Visualisation bracket
│   │   │   │   ├── matches/
│   │   │   │   └── stats/
│   │   │   └── page.tsx              # Liste tournois
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Homepage
│   │
│   ├── components/
│   │   ├── ui/                       # Shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   │
│   │   └── features/                 # Feature-specific components
│   │       ├── bracket/
│   │       │   ├── Bracket.tsx       # Main bracket component (SVG)
│   │       │   ├── BracketMatch.tsx
│   │       │   ├── BracketConnector.tsx
│   │       │   └── types.ts
│   │       │
│   │       ├── dashboard/
│   │       │   ├── DashboardLayout.tsx
│   │       │   ├── LiveMatchWidget.tsx
│   │       │   ├── DisputeWidget.tsx
│   │       │   └── ChatWidget.tsx
│   │       │
│   │       ├── planning/
│   │       │   ├── ScheduleCalendar.tsx
│   │       │   ├── MatchDragItem.tsx
│   │       │   └── types.ts
│   │       │
│   │       └── tournament/
│   │           ├── TournamentCard.tsx
│   │           ├── TournamentForm.tsx
│   │           └── MatchCard.tsx
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useTournamentSocket.ts    # WebSocket hook
│   │   ├── useAuth.ts
│   │   ├── useTournament.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── services/                     # API services
│   │   ├── api.ts                    # Axios instance + interceptors
│   │   ├── tournament.service.ts
│   │   ├── auth.service.ts
│   │   ├── match.service.ts
│   │   └── websocket.service.ts
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── useAuthStore.ts
│   │   ├── useUIStore.ts             # UI state (sidebar, theme)
│   │   └── useNotificationStore.ts
│   │
│   ├── types/                        # TypeScript types
│   │   ├── tournament.types.ts
│   │   ├── match.types.ts
│   │   ├── user.types.ts
│   │   └── api.types.ts
│   │
│   ├── lib/                          # Utilities
│   │   ├── utils.ts                  # cn() + helpers
│   │   ├── queryClient.ts            # TanStack Query config
│   │   └── validations/              # Zod schemas
│   │       ├── tournament.schema.ts
│   │       └── auth.schema.ts
│   │
│   └── styles/
│       └── globals.css               # Tailwind + custom styles
│
├── public/
│   ├── images/
│   └── icons/
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.example
```

## 🛠 Stack Technique

| Technologie | Usage |
|-------------|-------|
| **Next.js 14+** | Framework React avec App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling utility-first |
| **Shadcn/ui** | Composants UI accessibles |
| **TanStack Query** | State management serveur + cache |
| **Zustand** | State management global UI |
| **React Hook Form** | Gestion formulaires |
| **Zod** | Validation de schémas |
| **Axios** | HTTP client |
| **Socket.io Client** | WebSockets temps réel |
| **Recharts** | Visualisation de données |
| **dnd-kit** | Drag & drop |
| **Framer Motion** | Animations |

## 🚀 Installation

```bash
# Installation des dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Lancer le serveur de développement
npm run dev
```

## 📦 Features Principales

### 1. Visual Bracket (Arbre de Tournoi)
- ✅ Affichage SVG avec zoom/pan (react-zoom-pan-pinch)
- ✅ Support Double Elimination (128+ participants)
- ✅ Animations smooth sur les transitions
- ✅ Mobile responsive

### 2. Dashboard Mission Control
- ✅ Layout avec sidebar collapsible
- ✅ Widgets temps réel (WebSocket)
- ✅ Notifications live
- ✅ Gestion des litiges

### 3. WebSocket Real-time
- ✅ Hook `useTournamentSocket(tournamentId)`
- ✅ Auto-reconnection
- ✅ Invalidation cache React Query

### 4. Smart Planning UI
- ✅ Calendrier de type Gantt
- ✅ Drag & drop (dnd-kit)
- ✅ Édition manuelle des horaires

## 🎨 Design System

### Couleurs
```css
--gaming-purple: #8B5CF6   /* Primary */
--gaming-blue: #3B82F6     /* Secondary */
--gaming-cyan: #06B6D4     /* Accent */
--gaming-pink: #EC4899     /* Highlight */
--gaming-gold: #F59E0B     /* Winner */
```

### Composants Shadcn/ui
- Button, Card, Dialog, Form
- Input, Select, Tabs
- Skeleton (loading states)
- Toast (notifications)

## ⚡ Performance Optimizations

### Server Components vs Client Components
```tsx
// Server Component (default)
export default async function TournamentPage({ params }) {
  const tournament = await fetchTournament(params.id)
  return <TournamentDetails data={tournament} />
}

// Client Component (interactivité)
'use client'
export function BracketInteractive({ data }) {
  const [zoom, setZoom] = useState(1)
  // ...
}
```

### Lazy Loading
```tsx
const Bracket = dynamic(() => import('@/components/features/bracket/Bracket'), {
  loading: () => <BracketSkeleton />,
  ssr: false // Client-only pour canvas/SVG
})
```

### React Query Caching
```tsx
const { data, isLoading } = useQuery({
  queryKey: ['tournament', id],
  queryFn: () => tournamentService.getDetails(id),
  staleTime: 5 * 60 * 1000, // 5 min
  cacheTime: 10 * 60 * 1000, // 10 min
})
```

## 🔌 API Integration

### Axios Client
```typescript
// src/services/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

// JWT Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### WebSocket Client
```typescript
// src/hooks/useTournamentSocket.ts
export function useTournamentSocket(tournamentId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const socket = io(WS_URL)
    socket.emit('joinTournament', tournamentId)

    socket.on('matchUpdate', (data) => {
      queryClient.invalidateQueries(['matches', tournamentId])
    })

    return () => socket.disconnect()
  }, [tournamentId])
}
```

## 📱 Responsive Design

- **Mobile First** : Design optimisé pour mobile d'abord
- **Breakpoints Tailwind** : sm, md, lg, xl, 2xl
- **Sidebar collapsible** sur mobile
- **Bracket zoomable** pour petits écrans

## 🧪 Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build production
npm run build

# Start production server
npm run start
```

## 🌐 Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXT_PUBLIC_APP_NAME=Tournament Platform
```

## 📚 Documentation

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Version:** 1.0.0
**Date:** 2025-11-29
