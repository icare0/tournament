# Landing Page Architecture

## 📁 Structure du Projet

```
frontend/
├── app/
│   └── page.tsx                    # Page principale (refactorisée)
├── components/
│   └── landing/                    # Composants de la landing page
│       ├── index.ts               # Point d'export central
│       ├── CustomCursor.tsx       # Curseur personnalisé (desktop)
│       ├── Navigation.tsx         # Barre de navigation
│       ├── DownloadButton.tsx     # Bouton de téléchargement du code
│       ├── HeroSection.tsx        # Section hero avec dashboard image
│       ├── MarqueeSection.tsx     # Bande défilante (intégrations)
│       ├── FeaturesSection.tsx    # Grille Bento des fonctionnalités
│       ├── ShowcaseSection.tsx    # Section showcase avec paramètres
│       ├── PricingSection.tsx     # Section tarification (3 plans)
│       └── FooterSection.tsx      # Pied de page
├── hooks/
│   └── useScrollReveal.ts         # Hook pour animations au scroll
├── styles/
│   └── landing.css                # Styles CSS personnalisés
└── tailwind.config.ts             # Configuration Tailwind (Bloom colors)
```

## 🎨 Design System

### Couleurs Bloom
- **bloom-bg**: `#F4F1EA` - Fond beige clair
- **bloom-dark**: `#1C2321` - Texte principal sombre
- **bloom-accent**: `#C46D5E` - Accent terracotta
- **bloom-green**: `#2D3A36` - Vert foncé
- **bloom-sage**: `#8DA399` - Vert sauge
- **bloom-gold**: `#D4AF37` - Or

### Typographie
- **Font Serif**: "Cormorant Garamond" - Titres élégants
- **Font Sans**: "Manrope" - Corps de texte moderne

### Animations
- **reveal-up**: Animation de révélation au scroll (avec delays)
- **float**: Animation flottante pour éléments décoratifs
- **marquee**: Défilement horizontal infini
- **pulse-slow**: Pulsation douce

## 🧩 Composants

### 1. CustomCursor
Curseur personnalisé pour desktop avec effet de suivi et interactions au hover.

**Props**: Aucune
**Features**:
- Point central qui suit la souris
- Cercle extérieur avec animation smooth
- Changement de taille/couleur au hover d'éléments interactifs

### 2. Navigation
Barre de navigation fixe en haut avec effet mix-blend-difference.

**Contenu**:
- Badge "SaaS • Beta"
- Logo "Bloom."
- Menu button

### 3. DownloadButton
Bouton flottant en bas à droite permettant de télécharger le code source HTML.

**Features**:
- Tooltip au hover
- Animation de fond au hover
- Export HTML complet de la page

### 4. HeroSection
Section hero avec titre principal et mockup du dashboard.

**Éléments**:
- Titre principal avec typographie fluid
- Description
- Dashboard card avec browser bar
- Badge "Tournoi Actif" animé
- CTA buttons

### 5. MarqueeSection
Bande défilante affichant les intégrations (Twitch, Stripe, Discord, etc.).

**Features**:
- Animation marquee infinie
- Effet grayscale → couleur au hover

### 6. FeaturesSection
Grille Bento modulaire présentant les fonctionnalités clés.

**Blocs**:
1. **Moteur de Brackets** (8 cols, 2 rows) - Grande carte avec illustration
2. **Mode Broadcast** (4 cols, 2 rows) - Carte sombre avec mockup mobile
3. **Billetterie** (4 cols) - Carte de paiement
4. **Communauté** (4 cols) - Avatars utilisateurs
5. **Analytics** (4 cols) - Graphique en barres animé

### 7. ShowcaseSection
Section showcase sur fond sombre avec formulaire de paramètres.

**Contenu**:
- Liste numérotée des features
- Carte glassmorphism avec form de paramètres
- Notification flottante animée

### 8. PricingSection
Section de tarification avec 3 plans.

**Plans**:
1. **Graine** - Gratuit
2. **Floraison** - 29€/mois (populaire, mise en avant)
3. **Forêt** - Sur devis

### 9. FooterSection
Pied de page complet.

**Contenu**:
- Logo Bloom géant
- Liens produit
- Liens légaux
- Réseaux sociaux
- Copyright

## 🎣 Hooks

### useScrollReveal
Hook gérant les animations de révélation au scroll.

**Fonctionnement**:
- Utilise IntersectionObserver
- Ajoute la classe `active` aux éléments `.reveal-up` visibles
- Supporte des delays pour effets en cascade

**Usage**:
```tsx
import { useScrollReveal } from '@/hooks/useScrollReveal'

export default function Page() {
  useScrollReveal()

  return (
    <div className="reveal-up delay-100">
      Contenu animé
    </div>
  )
}
```

## 🎨 Styles CSS Personnalisés

Le fichier `landing.css` contient:

1. **Noise Overlay**: Texture granuleuse subtile
2. **Fluid Typography**: Classes responsive pour H1/H2
3. **Reveal Animations**: Système d'animations au scroll
4. **Glassmorphism**: Effet verre pour les cards
5. **Bento Cards**: Styles pour la grille modulaire
6. **Custom Cursor**: Styles du curseur personnalisé
7. **3D Perspective**: Effets 3D pour le dashboard

## 🚀 Améliorations vs Version Originale

### Architecture
✅ **Séparation des responsabilités**: Un composant par section
✅ **Code réutilisable**: Composants modulaires et indépendants
✅ **Type safety**: TypeScript dans tous les composants
✅ **Imports centralisés**: Point d'export unique pour les composants

### Performance
✅ **CSS externe**: Styles séparés du HTML
✅ **Lazy effects**: Hooks utilisés seulement quand nécessaire
✅ **Cleanup**: Proper cleanup des event listeners et observers

### Maintenabilité
✅ **Organisation claire**: Structure de dossiers logique
✅ **Commentaires**: Code bien documenté
✅ **Nommage cohérent**: Conventions respectées
✅ **Git-friendly**: Changements isolés par composant

## 📝 Notes Importantes

### Design Identique
Le design visuel est **strictement identique** à la version HTML originale. Seule l'architecture du code a été modernisée.

### Compatibilité
- Next.js 14+ (App Router)
- React 18+
- Tailwind CSS 3+
- TypeScript 5+

### Prochaines Améliorations Possibles
- [ ] Ajouter des vraies images pour le dashboard
- [ ] Implémenter un système de routing pour le menu
- [ ] Ajouter des animations Framer Motion plus avancées
- [ ] Créer des variants pour dark mode
- [ ] Ajouter des tests unitaires
- [ ] Optimiser les performances avec React.memo
- [ ] Ajouter l'internationalisation (i18n)

## 🔧 Utilisation

### Développement
```bash
cd frontend
npm run dev
```

### Build
```bash
npm run build
```

### Linting
```bash
npm run lint
```

---

**Architecture conçue pour**: Scalabilité, maintenabilité, et performance optimale.
