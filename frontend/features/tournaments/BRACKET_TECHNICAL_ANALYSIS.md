# Tournament Bracket - Analyse Technique

## 🎯 Objectif

Afficher des brackets de double élimination avec un nombre illimité de participants, fluide à 60fps, zoomable et mobile-friendly.

## 📊 Comparaison des Solutions

### Option 1: Custom SVG (React + SVG natif)

**✅ Avantages:**
- **Performance maximale** - SVG natif est GPU-accelerated
- **Contrôle total** - Customisation illimitée du design
- **Léger** - Pas de dépendance externe lourde
- **Responsive** - ViewBox SVG s'adapte automatiquement
- **Accessibilité** - Facile d'ajouter ARIA labels

**❌ Inconvénients:**
- **Développement from scratch** - Plus de code à écrire
- **Calculs de layout** - Doit calculer positions manuellement
- **Edge cases** - Gérer tous les cas (byes, etc.)

**Performance:**
- ✅ 60fps facile même avec 512+ participants
- ✅ Virtual rendering possible si besoin
- ✅ Bundle size minimal (~0kb extra)

### Option 2: react-tournament-bracket

**✅ Avantages:**
- **Quick start** - Bracket prêt à l'emploi
- **Battle-tested** - Cas d'usage déjà gérés

**❌ Inconvénients:**
- **Customisation limitée** - Style Apple difficile à appliquer
- **Bundle size** - ~50kb+ minified
- **Performance** - Pas optimisé pour très grands brackets
- **Pas de zoom natif** - Doit wrapper avec autre lib
- **Single elimination only** - Pas de double elimination out-of-the-box

### Option 3: Hybrid (Custom + react-zoom-pan-pinch)

**✅ Avantages:**
- **Meilleur des deux mondes**
- Custom SVG pour le bracket (performance + design)
- react-zoom-pan-pinch pour navigation (battle-tested)
- **Mobile-friendly** - Pinch-to-zoom natif
- **Performance** - GPU-accelerated zoom

**Bundle size:**
- react-zoom-pan-pinch: ~15kb minified
- Custom SVG: 0kb extra
- **Total: ~15kb**

## 🏆 Recommandation: Option 3 (Hybrid)

**Architecture:**
```
<TransformWrapper>          # react-zoom-pan-pinch
  <TransformComponent>
    <svg viewBox="...">     # Custom SVG
      <MatchNode />
      <BezierConnector />
    </svg>
  </TransformComponent>
</TransformWrapper>
```

**Pourquoi:**
1. ✅ Performance optimale (SVG natif)
2. ✅ Zoom/Pan gratuit (lib robuste)
3. ✅ Design Apple totalement customisable
4. ✅ Mobile pinch-to-zoom
5. ✅ Bundle size raisonnable

## 📐 Layout Algorithm (Double Elimination)

### Structure du Bracket

```
Double Elimination:
┌─────────────────────────────────┐
│     WINNER'S BRACKET            │
│  Round 1 → Round 2 → Finals     │
└─────────────────────────────────┘
         ↓ (losers)
┌─────────────────────────────────┐
│     LOSER'S BRACKET             │
│  Round 1 → Round 2 → Finals     │
└─────────────────────────────────┘
         ↓
   GRAND FINALS
```

### Calcul des Positions

**Vertical Spacing:**
```typescript
const MATCH_HEIGHT = 120
const MATCH_VERTICAL_GAP = 40
const roundVerticalSpacing = (round: number) => {
  return Math.pow(2, round) * (MATCH_HEIGHT + MATCH_VERTICAL_GAP)
}
```

**Horizontal Spacing:**
```typescript
const ROUND_HORIZONTAL_GAP = 200
const matchX = roundIndex * (MATCH_WIDTH + ROUND_HORIZONTAL_GAP)
```

**Y Position (Centered in bracket):**
```typescript
const matchY = (matchIndex * roundVerticalSpacing(round)) + offset
```

## 🎨 Bézier Connectors

### Courbes Cubiques pour Élégance

```svg
<path
  d="M x1,y1 C cx1,cy1 cx2,cy2 x2,y2"
  stroke="hsl(var(--border))"
  stroke-width="2"
  fill="none"
/>
```

**Calcul des points de contrôle:**
```typescript
const controlPointOffset = (x2 - x1) / 2

const bezierPath = `
  M ${x1},${y1}
  C ${x1 + controlPointOffset},${y1}
    ${x2 - controlPointOffset},${y2}
    ${x2},${y2}
`
```

## 🔧 Optimisations Performance

### 1. Virtual Rendering (si > 256 matches)

```typescript
// Render seulement les matches visibles dans viewport
const visibleMatches = useMemo(() => {
  return matches.filter(match =>
    isInViewport(match.x, match.y, zoom, pan)
  )
}, [matches, zoom, pan])
```

### 2. Memoization

```typescript
const MatchNode = React.memo(({ match }) => {
  // Ne re-render que si match.status change
}, (prev, next) => prev.match.status === next.match.status)
```

### 3. GPU Acceleration

```css
.bracket-svg {
  will-change: transform;
  transform: translateZ(0);
}
```

## 📱 Mobile Considerations

**Touch Targets:**
- Min 44x44px pour chaque match (iOS guidelines)
- Padding généreux autour des clics

**Zoom Defaults:**
```typescript
<TransformWrapper
  initialScale={0.6}      // Zoom out sur mobile
  minScale={0.3}
  maxScale={2}
  wheel={{ step: 0.1 }}
  pinch={{ step: 5 }}
  doubleClick={{ mode: 'reset' }}
>
```

## 🎯 Data Flow

```
Backend API
  ↓
Tournament { phases: [...], matches: [...] }
  ↓
useTournamentBracket() hook
  ↓
transformMatchesToBracketLayout()
  ↓
BracketData { winnersBracket, losersBracket }
  ↓
<TournamentBracket />
  ↓
<MatchNode onClick={openModal} />
```

## 🔐 Type Safety

```typescript
interface Match {
  id: string
  tournamentId: string
  round: number
  matchNumber: number
  participant1?: Participant
  participant2?: Participant
  winnerId?: string
  status: MatchStatus
  nextMatchId?: string  // Pour construire l'arbre
}

interface BracketNode extends Match {
  x: number             // Position calculée
  y: number
  connections: string[] // IDs des matches suivants
}
```

## 🚀 Performance Benchmarks (Target)

- **64 participants (63 matches)**: 60fps constant
- **128 participants (127 matches)**: 60fps constant
- **256 participants (255 matches)**: 60fps avec virtual rendering
- **512+ participants**: Virtual rendering obligatoire

## 📦 Bundle Impact

```
react-zoom-pan-pinch: 15kb
Custom SVG logic: ~5kb
Total: ~20kb
```

**vs**

```
react-tournament-bracket: 50kb+
react-zoom-pan-pinch: 15kb
Total: 65kb+
```

**Gain: -45kb (69% reduction)**

---

**Decision: Custom SVG + react-zoom-pan-pinch** ✅
