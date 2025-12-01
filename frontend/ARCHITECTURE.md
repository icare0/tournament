# Frontend Architecture - Tournament SaaS Platform

## 🎯 Vue d'ensemble

Architecture Next.js 14+ moderne avec App Router, conçue pour un SaaS de gestion de tournois e-sport. Design inspiré d'Apple avec dark mode par défaut.

## 📐 Principes Architecturaux

### 1. **Séparation des Préoccupations**

```
Présentation (UI) → Logique Métier (Features) → Données (API)
```

- **UI Components** (`components/`) - Purement visuels, réutilisables
- **Features** (`features/`) - Logique métier par domaine
- **API Layer** (`lib/api/`) - Communication avec le backend

### 2. **Organisation par Domaine**

Chaque feature possède sa propre structure autonome:

```
features/tournaments/
├── api/
│   ├── use-tournaments.ts       # React Query hooks
│   ├── use-create-tournament.ts
│   └── tournament-api.ts         # Raw API calls
├── components/
│   ├── tournament-card.tsx
│   ├── tournament-form.tsx
│   └── bracket-view.tsx
├── hooks/
│   └── use-tournament-filters.ts # Business logic hooks
└── types.ts                      # Domain-specific types
```

**Avantages:**
- ✅ Code découplé et maintenable
- ✅ Facilite le travail en équipe (1 dev = 1 feature)
- ✅ Tests unitaires ciblés
- ✅ Réutilisabilité maximale

### 3. **Type Safety First**

```typescript
// types/api.ts - Single source of truth
export interface Tournament {
  id: string
  name: string
  type: TournamentType
  status: TournamentStatus
  // ...
}

// Utilisé partout dans l'app
import { Tournament } from '@/types/api'
```

## 🗂️ Structure des Dossiers Détaillée

### `/app` - Next.js App Router

```
app/
├── layout.tsx                    # Root layout (providers globaux)
├── page.tsx                      # Landing page
├── globals.css                   # Design tokens + Tailwind
│
├── (public)/                     # Route group: Vue spectateur
│   ├── layout.tsx                # Header + Footer
│   ├── tournaments/
│   │   └── page.tsx              # Liste publique des tournois
│   └── spectate/
│       ├── page.tsx              # Hub spectateur
│       └── [id]/page.tsx         # Spectate match spécifique
│
└── (dashboard)/                  # Route group: Organisateur
    ├── layout.tsx                # Sidebar + Container
    ├── page.tsx                  # Dashboard principal
    ├── tournaments/
    │   ├── page.tsx              # Liste mes tournois
    │   ├── new/page.tsx          # Créer tournoi
    │   └── [id]/
    │       ├── page.tsx          # Vue détaillée
    │       └── edit/page.tsx     # Éditer tournoi
    ├── matches/
    ├── wallet/
    └── settings/
```

**Route Groups `()` :**
- Ne créent PAS de segment d'URL
- Permettent des layouts différents
- `(public)` = Layout public avec header
- `(dashboard)` = Layout privé avec sidebar

### `/components` - Composants UI

```
components/
├── ui/                           # Shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── avatar.tsx
│   ├── table.tsx
│   └── sheet.tsx
│
└── layout/                       # Layout components
    ├── app-sidebar.tsx           # Dashboard sidebar
    ├── public-header.tsx         # Public header
    └── theme-toggle.tsx          # Dark/light mode toggle
```

**Principes:**
- Composants **sans logique métier**
- Props bien typées
- Variants via `class-variance-authority`
- Composables et réutilisables

### `/features` - Domain Logic

```
features/
├── auth/
│   ├── api/
│   │   ├── use-login.ts          # useMutation pour login
│   │   ├── use-register.ts
│   │   └── auth-api.ts           # Raw API calls
│   ├── components/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   └── hooks/
│       └── use-auth.ts           # Hook combiné
│
├── tournaments/
│   ├── api/
│   │   ├── use-tournaments.ts    # useQuery
│   │   ├── use-create-tournament.ts
│   │   └── tournament-api.ts
│   ├── components/
│   │   ├── tournament-card.tsx
│   │   ├── tournament-form.tsx
│   │   ├── bracket-view.tsx
│   │   └── tournament-filters.tsx
│   └── hooks/
│       ├── use-tournament-filters.ts
│       └── use-bracket-generator.ts
│
├── matches/
│   └── ...
│
└── wallet/
    └── ...
```

**Pattern API Hooks:**

```typescript
// features/tournaments/api/use-tournaments.ts
import { useQuery } from '@tanstack/react-query'
import { tournamentApi } from './tournament-api'

export function useTournaments(filters?: TournamentFilters) {
  return useQuery({
    queryKey: ['tournaments', filters],
    queryFn: () => tournamentApi.getAll(filters),
  })
}

// Usage dans un component
const { data: tournaments, isLoading } = useTournaments({ status: 'ACTIVE' })
```

### `/lib` - Utilities & Configuration

```
lib/
├── api/
│   └── client.ts                 # Axios instance configurée
│
├── hooks/                        # Hooks génériques
│   ├── use-media-query.ts
│   ├── use-debounce.ts
│   └── use-local-storage.ts
│
├── stores/                       # Zustand stores
│   ├── auth-store.ts             # Auth state (user, tokens)
│   ├── ui-store.ts               # UI state (sidebar, modals)
│   └── filters-store.ts          # Filter states
│
├── utils.ts                      # Utility functions
│   └── cn()                      # Tailwind class merger
│
└── query-client.ts               # TanStack Query config
```

## 🔌 Data Fetching Strategy

### TanStack Query (Server State)

Gère **toutes les données serveur** (tournaments, matches, users):

```typescript
// Queries (GET)
const { data, isLoading, error } = useQuery({
  queryKey: ['tournaments', id],
  queryFn: () => apiClient.get(`/tournaments/${id}`),
})

// Mutations (POST/PUT/DELETE)
const { mutate, isPending } = useMutation({
  mutationFn: (data) => apiClient.post('/tournaments', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tournaments'] })
  },
})
```

**Avantages:**
- ✅ Cache automatique avec stale time
- ✅ Background refetch
- ✅ Optimistic updates
- ✅ Retry logic

### Zustand (Client State)

Gère **l'état UI et auth** (non-serveur):

```typescript
// Auth Store
const { user, isAuthenticated, setUser, logout } = useAuthStore()

// UI Store
const { isSidebarOpen, toggleSidebar } = useUIStore()
```

**Principe:**
- Server state → TanStack Query
- Client state → Zustand

## 🔐 Authentication Flow

### 1. Login Process

```
User Login
  ↓
POST /auth/login
  ↓
Receive { access_token, refresh_token, user }
  ↓
Store in localStorage (tokenManager)
  ↓
Update Zustand (useAuthStore)
  ↓
Redirect to /dashboard
```

### 2. API Request avec JWT

```
Component calls apiClient.get('/tournaments')
  ↓
Request Interceptor injecte Authorization: Bearer {token}
  ↓
Backend API
  ↓
Response 200 → Return data
Response 401 → Try refresh token
  ↓
Refresh success → Retry original request
Refresh fail → Logout + Redirect /login
```

**Code:**

```typescript
// lib/api/client.ts
apiClient.interceptors.request.use((config) => {
  const token = tokenManager.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh token logic...
    }
    return Promise.reject(error)
  }
)
```

## 🎨 Design System

### Tailwind Configuration

```typescript
// tailwind.config.ts
export default {
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: 'hsl(var(--primary))',
        // ...
      },
    },
  },
}
```

### CSS Variables (app/globals.css)

```css
:root {
  --background: 0 0% 100%;        /* Light mode */
  --primary: 240 5.9% 10%;
}

.dark {
  --background: 240 10% 3.9%;    /* Dark mode */
  --primary: 0 0% 98%;
}
```

**Usage:**

```tsx
<div className="bg-background text-foreground">
  <Card className="border-border bg-card">
    <Button variant="default">Primary Action</Button>
  </Card>
</div>
```

### Shadcn/ui Pattern

```bash
# Installer un composant
npx shadcn-ui@latest add dialog

# Crée components/ui/dialog.tsx
# Déjà configuré avec design tokens
```

## 📱 Responsive Design

### AppSidebar - Mobile First

```tsx
// Desktop: Sticky sidebar (toujours visible)
// Mobile: Hamburger menu + overlay

<aside className={cn(
  'fixed lg:sticky',
  'lg:translate-x-0',
  isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
)}>
  {/* Sidebar content */}
</aside>
```

### Breakpoints Tailwind

```tsx
<div className="
  grid
  grid-cols-1        // Mobile
  md:grid-cols-2     // Tablet
  lg:grid-cols-4     // Desktop
">
```

## 🧪 Testing Strategy (Phase 2)

```
├── __tests__/
│   ├── components/
│   │   └── button.test.tsx
│   ├── features/
│   │   └── auth/
│   │       └── login-form.test.tsx
│   └── lib/
│       └── utils.test.ts
```

**Stack recommandé:**
- Jest + React Testing Library
- Mock Service Worker (MSW) pour API
- Playwright pour E2E

## 🚀 Performance Optimizations

### 1. **Code Splitting**

```tsx
// Dynamic imports pour pages lourdes
const BracketEditor = dynamic(() => import('@/features/tournaments/bracket-editor'))
```

### 2. **Image Optimization**

```tsx
import Image from 'next/image'

<Image
  src="/tournament-banner.jpg"
  width={1200}
  height={600}
  alt="Tournament"
  priority
/>
```

### 3. **React Query Optimizations**

```typescript
{
  staleTime: 5 * 60 * 1000,    // 5 min avant re-fetch
  gcTime: 10 * 60 * 1000,      // 10 min avant garbage collect
  refetchOnWindowFocus: false, // Pas de re-fetch au focus
}
```

## 🔄 Real-time (Phase 2)

### WebSocket Integration

```typescript
// lib/websocket.ts
import { io } from 'socket.io-client'

export const socket = io(process.env.NEXT_PUBLIC_WS_URL)

socket.on('match:update', (data) => {
  queryClient.invalidateQueries({ queryKey: ['matches', data.matchId] })
})
```

## 📦 Build & Deploy

### Build Process

```bash
npm run build
# Next.js compile
# TypeScript check
# Tailwind CSS purge
# Output: .next/ standalone
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.tournament.com/v1
NEXT_PUBLIC_WS_URL=wss://api.tournament.com
```

### Deployment (Vercel)

```bash
vercel --prod
# Auto-déploie à chaque push sur main
```

## 🛡️ Security Best Practices

1. **XSS Protection** - Next.js escape automatiquement
2. **CSRF** - JWT en Authorization header (pas de cookies)
3. **Environment Variables** - `NEXT_PUBLIC_*` seulement pour variables publiques
4. **Content Security Policy** - Headers Next.js

## 📊 Monitoring (Phase 2)

```typescript
// Sentry pour error tracking
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
})

// Vercel Analytics
import { Analytics } from '@vercel/analytics/react'

<Analytics />
```

---

**Version:** 1.0
**Date:** 2025-11-30
**Stack:** Next.js 14 + TypeScript + Tailwind CSS + Shadcn/ui
