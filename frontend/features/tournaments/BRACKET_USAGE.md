# Tournament Bracket - Guide d'Utilisation

## 🚀 Quick Start

```tsx
import { TournamentBracket, useBracketLayout, MatchRefereeModal } from '@/features/tournaments'
import { useState } from 'react'

function TournamentPage({ tournamentId }: { tournamentId: string }) {
  const [selectedMatch, setSelectedMatch] = useState(null)

  // Fetch matches from API
  const { data: matches } = useMatches(tournamentId)

  // Transform to bracket layout
  const bracketData = useBracketLayout({
    matches: matches || [],
    tournamentId,
  })

  const handleMatchClick = (match) => {
    setSelectedMatch(match)
  }

  const handleSubmitResult = async (matchId, result) => {
    await updateMatch(matchId, result)
    // Invalidate queries to refresh bracket
  }

  return (
    <>
      <TournamentBracket
        tournamentId={tournamentId}
        data={bracketData}
        onMatchClick={handleMatchClick}
        className="h-screen"
      />

      <MatchRefereeModal
        match={selectedMatch}
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onSubmit={handleSubmitResult}
      />
    </>
  )
}
```

## 📐 Données Backend Requises

### Structure de Match (API)

```typescript
interface Match {
  id: string
  tournamentId: string
  round: number              // 0, 1, 2, 3...
  matchNumber: number        // Position in round
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED'

  // Bracket type
  bracket: 'winners' | 'losers' | 'grand-final'

  // Participants
  participant1?: {
    id: string
    name: string
    seed?: number
  }
  participant2?: {
    id: string
    name: string
    seed?: number
  }

  // Results
  winnerId?: string
  score?: {
    participant1: number
    participant2: number
  }

  // Navigation
  nextMatchId?: string       // IMPORTANT: Pour construire l'arbre
}
```

### Exemple de Données (8 joueurs, Single Elimination)

```json
[
  // Round 1 (Quarter-Finals)
  {
    "id": "m1",
    "round": 0,
    "matchNumber": 0,
    "bracket": "winners",
    "participant1": { "id": "p1", "name": "Player 1", "seed": 1 },
    "participant2": { "id": "p8", "name": "Player 8", "seed": 8 },
    "nextMatchId": "m5",
    "status": "COMPLETED",
    "winnerId": "p1",
    "score": { "participant1": 2, "participant2": 0 }
  },
  {
    "id": "m2",
    "round": 0,
    "matchNumber": 1,
    "bracket": "winners",
    "participant1": { "id": "p4", "name": "Player 4", "seed": 4 },
    "participant2": { "id": "p5", "name": "Player 5", "seed": 5 },
    "nextMatchId": "m5",
    "status": "IN_PROGRESS"
  },

  // Round 2 (Semi-Finals)
  {
    "id": "m5",
    "round": 1,
    "matchNumber": 0,
    "bracket": "winners",
    "participant1": { "id": "p1", "name": "Player 1" },
    "nextMatchId": "m7",
    "status": "SCHEDULED"
  },

  // Finals
  {
    "id": "m7",
    "round": 2,
    "matchNumber": 0,
    "bracket": "winners",
    "status": "SCHEDULED"
  }
]
```

## 🎨 Customisation

### Layout Configuration

```tsx
<TournamentBracket
  data={bracketData}
  config={{
    matchWidth: 320,           // Largeur d'un match
    matchHeight: 140,          // Hauteur d'un match
    horizontalGap: 250,        // Espace entre rounds
    verticalGap: 50,           // Espace entre matches
    winnerLoserGap: 250,       // Espace Winner's ↔ Loser's bracket
    connectorCurve: 0.6,       // Courbure des Bézier (0-1)
  }}
/>
```

### Styling avec Tailwind

```tsx
<TournamentBracket
  className="h-[800px] border rounded-lg shadow-xl"
  data={bracketData}
/>
```

## 📱 Mobile Optimization

Le bracket est mobile-friendly par défaut:

- **Pinch-to-zoom** natif sur tactile
- **Pan** avec un doigt
- **Double-tap** pour reset zoom
- **Zoom controls** toujours visibles

### Ajuster le zoom initial pour mobile

```tsx
// Dans tournament-bracket.tsx, ligne 62
<TransformWrapper
  initialScale={window.innerWidth < 768 ? 0.4 : 0.7} // Plus petit sur mobile
  minScale={0.2}
  maxScale={2}
>
```

## 🔄 Real-time Updates

### Avec WebSocket

```tsx
import { useEffect } from 'react'
import { socket } from '@/lib/websocket'

function TournamentPage() {
  const queryClient = useQueryClient()

  useEffect(() => {
    socket.on('match:update', (data) => {
      // Invalider la query pour re-fetch
      queryClient.invalidateQueries(['matches', tournamentId])
    })

    return () => socket.off('match:update')
  }, [])

  // ... rest of component
}
```

## 🎯 Performance

### Virtual Rendering (optionnel)

Pour très grands brackets (256+ matches), implémenter virtual rendering:

```tsx
import { useCallback } from 'react'

function useVisibleMatches(matches, zoom, pan) {
  return useCallback(() => {
    // Calculer viewport bounds
    const viewportBounds = calculateViewportBounds(zoom, pan)

    // Filter matches in viewport
    return matches.filter(match =>
      isInViewport(match.x, match.y, viewportBounds)
    )
  }, [matches, zoom, pan])
}
```

### Memoization

Tous les composants utilisent `React.memo()` pour éviter re-renders inutiles:

```tsx
// MatchNode ne re-render que si status ou score change
const MatchNode = React.memo(
  ({ match }) => { ... },
  (prev, next) => prev.match.status === next.match.status
)
```

## 🎨 Variants de Style

### Dark Mode (par défaut)

Les couleurs utilisent les CSS variables:

```css
.dark {
  --primary: 0 0% 98%;
  --border: 240 3.7% 15.9%;
}
```

### Light Mode

Changer `className="dark"` sur `<html>` pour basculer.

### Thème Personnalisé

Modifier `app/globals.css`:

```css
.dark {
  --primary: 142 76% 36%;  /* Green accent */
  --border: 142 76% 20%;   /* Green borders */
}
```

## 🐛 Troubleshooting

### Bracket vide

**Problème:** Aucun match affiché

**Solution:**
1. Vérifier que `matches` n'est pas vide
2. Vérifier que `bracket` field est présent (`'winners'`, `'losers'`)
3. Vérifier la console pour erreurs de layout

### Connexions manquantes

**Problème:** Pas de lignes entre matches

**Solution:**
- S'assurer que `nextMatchId` est renseigné sur chaque match
- Vérifier que l'ID du match suivant existe dans la liste

### Performance lente

**Problème:** Lag au zoom/pan

**Solution:**
1. Activer virtual rendering si > 128 matches
2. Vérifier que `React.memo()` fonctionne (React DevTools)
3. Désactiver React DevTools en production

## 📊 Exemples de Layouts

### Single Elimination (8 joueurs)

```
Round 1    Round 2    Finals
───────    ───────    ──────
P1 vs P8 ─┐
          ├─ W1 vs W2 ─┐
P4 vs P5 ─┘            │
                       ├─ Champion
P2 vs P7 ─┐            │
          ├─ W3 vs W4 ─┘
P3 vs P6 ─┘
```

### Double Elimination (4 joueurs)

```
WINNER'S BRACKET
─────────────────
P1 vs P4 ─┐
          ├─ W1 ──┐
P2 vs P3 ─┘       │
                  ├─── GF
LOSER'S BRACKET   │
─────────────────  │
L(P1vsP4) ─┐      │
           ├─ LW ─┘
L(P2vsP3) ─┘
```

## 🔗 Intégration avec TanStack Query

```tsx
// features/tournaments/api/use-matches.ts
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

export function useMatches(tournamentId: string) {
  return useQuery({
    queryKey: ['matches', tournamentId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tournaments/${tournamentId}/matches`)
      return data
    },
  })
}

// features/tournaments/api/use-update-match.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useUpdateMatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ matchId, result }) => {
      await apiClient.patch(`/matches/${matchId}`, result)
    },
    onSuccess: (_, { tournamentId }) => {
      queryClient.invalidateQueries(['matches', tournamentId])
    },
  })
}
```

---

**Questions ?** Check `BRACKET_TECHNICAL_ANALYSIS.md` pour les détails d'implémentation.
