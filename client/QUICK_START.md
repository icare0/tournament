# 🚀 Quick Start Guide - Tournament Platform Frontend

## 📋 Prérequis

- Node.js 18+ ou 20+
- npm ou pnpm
- Backend NestJS démarré sur `http://localhost:3000`

## 🛠 Installation

```bash
# Naviguer dans le dossier client
cd client

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# (Optionnel) Installer Shadcn/ui
npx shadcn-ui@latest init
```

## ⚙️ Configuration

### 1. Variables d'environnement (`.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXT_PUBLIC_APP_NAME=Tournament Platform
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 2. Vérifier la connexion backend

Assurez-vous que le backend NestJS tourne sur le port 3000 :

```bash
# Dans le dossier racine
cd ..
npm run start:dev
```

## 🎮 Lancement

```bash
# Mode développement (port 3001 par défaut)
npm run dev

# Build production
npm run build

# Lancer en production
npm run start
```

## 📂 Navigation

Une fois lancé, accédez à :

- **Homepage**: http://localhost:3001
- **Dashboard**: http://localhost:3001/dashboard
- **Tournaments**: http://localhost:3001/tournaments

## 🎯 Features Principales à Tester

### 1. Visual Bracket

```typescript
// Exemple d'utilisation
import { Bracket } from '@/components/features/bracket/Bracket'

<Bracket
  tournamentId="tournament-123"
  type="DOUBLE_ELIMINATION"
  matches={matches}
  participants={participants}
  enableZoom={true}
  onMatchClick={(match) => console.log(match)}
/>
```

**Interactions:**
- Zoom: Molette de la souris ou boutons +/-
- Pan: Cliquer et glisser
- Clic sur match: Ouvre les détails

### 2. WebSocket Temps Réel

```typescript
// Exemple d'utilisation
import { useTournamentSocket } from '@/hooks/useTournamentSocket'

function TournamentLive({ tournamentId }) {
  const { isConnected } = useTournamentSocket(tournamentId, {
    onMatchUpdate: (data) => {
      console.log('Match updated:', data)
    },
    onTournamentUpdate: (data) => {
      console.log('Tournament updated:', data)
    }
  })

  return <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
}
```

### 3. Planning avec Drag & Drop

```typescript
// Exemple d'utilisation
import { ScheduleCalendar } from '@/components/features/planning/ScheduleCalendar'

<ScheduleCalendar
  matches={upcomingMatches}
  onScheduleChange={(matchId, slotId) => {
    console.log(`Match ${matchId} scheduled to ${slotId}`)
  }}
/>
```

## 🎨 Design System

### Couleurs Gaming

```tsx
<div className="bg-gaming-purple">Purple</div>
<div className="bg-gaming-blue">Blue</div>
<div className="bg-gaming-cyan">Cyan</div>
<div className="bg-gaming-gold">Gold</div>
```

### Effets Glassmorphism

```tsx
<div className="glass rounded-xl p-6">
  Glassmorphism card
</div>
```

### Animations

```tsx
<div className="animate-pulse-glow">
  Pulsing glow effect
</div>
```

## 🔌 API Integration

### Services Disponibles

```typescript
import { tournamentService } from '@/services/tournament.service'
import { matchService } from '@/services/match.service'
import { authService } from '@/services/auth.service'

// Exemple: Récupérer un tournoi
const tournament = await tournamentService.getById('tournament-123')

// Exemple: Récupérer les matchs live
const liveMatches = await matchService.getLive()

// Exemple: Login
const { user, accessToken } = await authService.login({
  email: 'user@example.com',
  password: 'password123'
})
```

### React Query

```typescript
import { useQuery } from '@tanstack/react-query'
import { tournamentService } from '@/services/tournament.service'

function TournamentDetails({ id }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tournament', id],
    queryFn: () => tournamentService.getById(id)
  })

  if (isLoading) return <Skeleton />
  if (error) return <Error message={error.message} />

  return <div>{data.name}</div>
}
```

## 🗄️ State Management

### Zustand Stores

```typescript
// Auth Store
import { useAuthStore } from '@/stores/useAuthStore'

function Profile() {
  const { user, logout } = useAuthStore()
  return (
    <div>
      <p>{user?.username}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

// UI Store
import { useUIStore } from '@/stores/useUIStore'

function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  return (
    <aside className={sidebarOpen ? 'w-64' : 'w-20'}>
      <button onClick={toggleSidebar}>Toggle</button>
    </aside>
  )
}
```

## 🧪 Testing (À Implémenter)

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📦 Structure de Données

### Tournament

```typescript
interface Tournament {
  id: string
  name: string
  game: string
  type: TournamentType  // SINGLE_ELIMINATION, DOUBLE_ELIMINATION, etc.
  status: TournamentStatus
  maxParticipants: number
  entryFee: number
  prizePool: number
  startDate: string
}
```

### Match

```typescript
interface Match {
  id: string
  tournamentId: string
  round: number
  bestOf: number
  homeParticipantId: string
  awayParticipantId: string
  homeScore: number
  awayScore: number
  winnerId?: string
  status: MatchStatus  // PENDING, LIVE, COMPLETED
}
```

## 🐛 Debugging

### React Query Devtools

Activé automatiquement en développement. Appuyez sur le bouton flottant en bas à gauche.

### WebSocket Debugging

```typescript
const { socket } = useTournamentSocket(tournamentId)

// Dans la console
socket?.on('*', (event, data) => {
  console.log('Socket event:', event, data)
})
```

### API Errors

```typescript
import { getErrorMessage } from '@/services/api'

try {
  await tournamentService.create(data)
} catch (error) {
  const message = getErrorMessage(error)
  console.error(message)
}
```

## 📚 Ressources

- [Next.js Docs](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [dnd-kit](https://dndkit.com/)

## 🆘 Problèmes Courants

### Port déjà utilisé

```bash
# Changer le port dans package.json
"dev": "next dev -p 3002"
```

### Erreur CORS

Vérifier la configuration CORS du backend NestJS :

```typescript
// backend/src/main.ts
app.enableCors({
  origin: 'http://localhost:3001',
  credentials: true,
})
```

### WebSocket ne se connecte pas

Vérifier que le backend WebSocket Gateway est bien démarré et accessible.

## 🚀 Prochaines Étapes

1. **Installer Shadcn/ui components** :
   ```bash
   npx shadcn-ui@latest add button
   npx shadcn-ui@latest add card
   npx shadcn-ui@latest add dialog
   npx shadcn-ui@latest add form
   ```

2. **Implémenter les pages manquantes** :
   - Login/Register
   - Tournament creation form
   - Match details
   - User profile

3. **Ajouter les animations** :
   - Page transitions
   - Loading states
   - Micro-interactions

4. **Tests** :
   - Unit tests (Vitest)
   - E2E tests (Playwright)

---

**Happy Coding! 🎮**
