# 🏆 Tournament Platform - Frontend

Premium Next.js 14+ frontend for the Tournament SaaS platform with Apple-inspired design.

## 🎨 Design Philosophy

**Style:** Apple Premium - Clean, minimal, sophisticated
**Theme:** Dark mode by default with subtle animations
**Typography:** System fonts optimized for readability
**UX:** Intuitive navigation with responsive layouts

## 🚀 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14+** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Shadcn/ui** | Premium component library |
| **TanStack Query v5** | Server state management |
| **Zustand** | Client state management |
| **Axios** | HTTP client with interceptors |
| **Lucide React** | Icon library |

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public routes (spectator view)
│   │   ├── tournaments/          # Browse tournaments
│   │   ├── spectate/             # Watch live matches
│   │   └── layout.tsx            # Public layout with header
│   ├── (dashboard)/              # Protected routes (organizer)
│   │   ├── tournaments/          # Manage tournaments
│   │   ├── matches/              # Match management
│   │   ├── wallet/               # Financial management
│   │   ├── settings/             # User settings
│   │   └── layout.tsx            # Dashboard layout with sidebar
│   ├── layout.tsx                # Root layout with providers
│   └── globals.css               # Global styles + design tokens
│
├── components/
│   ├── ui/                       # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── avatar.tsx
│   │   └── input.tsx
│   └── layout/                   # Layout components
│       └── app-sidebar.tsx       # Sticky responsive sidebar
│
├── features/                     # Domain-driven features
│   ├── auth/                     # Authentication logic
│   ├── tournaments/              # Tournament features
│   ├── matches/                  # Match features
│   └── wallet/                   # Wallet features
│
├── lib/
│   ├── api/
│   │   └── client.ts             # Axios instance with JWT injection
│   ├── hooks/                    # Custom React hooks
│   ├── stores/                   # Zustand stores
│   │   └── auth-store.ts         # Auth state management
│   ├── utils.ts                  # Utility functions (cn, etc.)
│   └── query-client.ts           # TanStack Query configuration
│
├── types/
│   └── api.ts                    # TypeScript API types
│
└── public/                       # Static assets
    ├── images/
    └── fonts/
```

## 🔧 Configuration Files

### 1. **API Client** (`lib/api/client.ts`)

Axios instance with automatic JWT token injection and refresh:

```typescript
import { apiClient, tokenManager } from '@/lib/api/client'

// All requests automatically include Authorization header
const response = await apiClient.get('/tournaments')

// Token refresh on 401 errors (automatic)
// Redirects to /login if refresh fails
```

**Features:**
- ✅ Auto-inject JWT token from localStorage
- ✅ Token refresh on 401 errors
- ✅ Global error handling
- ✅ Request/response interceptors

### 2. **TanStack Query** (`lib/query-client.ts`)

Configured in root layout with optimal defaults:

```typescript
// app/layout.tsx
<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools />
</QueryClientProvider>
```

**Defaults:**
- `refetchOnWindowFocus: false`
- `retry: 1`
- `staleTime: 5 minutes`

### 3. **Zustand Store** (`lib/stores/auth-store.ts`)

Persistent auth state with localStorage:

```typescript
const { user, isAuthenticated, setUser, logout } = useAuthStore()
```

## 🎯 Key Components

### AppSidebar (`components/layout/app-sidebar.tsx`)

Responsive sidebar for the dashboard with:
- ✅ Sticky positioning
- ✅ Mobile-friendly with hamburger menu
- ✅ Active route highlighting
- ✅ User profile section
- ✅ Smooth animations

**Usage:**
```tsx
// Automatically included in (dashboard)/layout.tsx
<AppSidebar />
```

### Shadcn/ui Components

**Installed Components:**
- `Button` - Multiple variants (default, outline, ghost, etc.)
- `Card` - Card, CardHeader, CardTitle, CardDescription, CardContent
- `Avatar` - Avatar, AvatarImage, AvatarFallback
- `Input` - Form input with focus states

**Adding More Components:**
```bash
# Install shadcn CLI (if needed)
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
npx shadcn-ui@latest add sheet
```

## 🎨 Design System

### Color Palette (Dark Mode)

Defined in `app/globals.css`:

```css
.dark {
  --background: 240 10% 3.9%;      /* Deep charcoal */
  --foreground: 0 0% 98%;          /* Off-white */
  --primary: 0 0% 98%;             /* White accent */
  --muted: 240 3.7% 15.9%;         /* Subtle gray */
  --border: 240 3.7% 15.9%;        /* Dark border */
}
```

### Utility Function

```typescript
import { cn } from '@/lib/utils'

// Merge Tailwind classes intelligently
<div className={cn('base-classes', conditionalClass && 'extra')} />
```

## 🚦 Getting Started

### Prerequisites
- Node.js >= 18
- Backend API running on `http://localhost:3000/api/v1`

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Development

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

### Build

```bash
npm run build
npm run start
```

## 📐 Architecture Patterns

### 1. **Feature-Based Organization**

Each domain (auth, tournaments, matches) has its own folder in `features/`:

```
features/tournaments/
├── api/              # API calls for tournaments
├── hooks/            # Tournament-specific hooks
├── components/       # Tournament UI components
└── types.ts          # Tournament types
```

### 2. **Layout Separation**

Two distinct layouts via route groups:

- `(public)` - No authentication, public header
- `(dashboard)` - Requires auth, sidebar navigation

### 3. **Type Safety**

All API responses typed in `types/api.ts`:

```typescript
import { Tournament, User, Match } from '@/types/api'

const tournament: Tournament = await apiClient.get('/tournaments/1')
```

## 🔐 Authentication Flow

1. **Login** → Store tokens in localStorage
2. **API Requests** → Auto-inject Bearer token
3. **401 Error** → Attempt token refresh
4. **Refresh Success** → Retry original request
5. **Refresh Fail** → Redirect to `/login`

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🎯 Next Steps

### Phase 2: Feature Implementation

1. **Authentication Pages**
   - Login form with validation
   - Register form
   - Password reset

2. **Tournament Management**
   - Create tournament wizard
   - Bracket visualization
   - Match scheduling

3. **Real-time Features**
   - WebSocket integration
   - Live match updates
   - Notifications

4. **Wallet & Billing**
   - Transaction history
   - Prize distribution UI
   - Payment integration

## 🛠️ Customization

### Adding New Routes

```tsx
// Create app/(dashboard)/analytics/page.tsx
export default function AnalyticsPage() {
  return <div>Analytics Dashboard</div>
}

// Add to AppSidebar navItems
{
  title: 'Analytics',
  href: '/dashboard/analytics',
  icon: BarChart,
}
```

### Custom Hooks Example

```typescript
// lib/hooks/use-tournaments.ts
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

export function useTournaments() {
  return useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data } = await apiClient.get('/tournaments')
      return data
    },
  })
}
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Shadcn/ui Components](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com)

---

**Architecture:** Next.js 14+ App Router
**Created:** 2025-11-30
**Style:** Apple Premium Dark Mode
