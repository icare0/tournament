# Shadcn/ui Components - Installation Guide

## ✅ Already Installed

Les composants suivants sont déjà créés et configurés:

- ✅ **Button** - `components/ui/button.tsx`
- ✅ **Card** - `components/ui/card.tsx`
- ✅ **Avatar** - `components/ui/avatar.tsx`
- ✅ **Input** - `components/ui/input.tsx`

## 📦 Components à Installer (Prioritaires)

### 1. Navigation & Layout

```bash
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add scroll-area
```

**Usage:**
- `Sheet` - Mobile sidebar/drawer
- `Separator` - Dividers entre sections
- `ScrollArea` - Smooth scrolling containers

### 2. Forms & Inputs

```bash
npx shadcn-ui@latest add form
npx shadcn-ui@latest add label
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add switch
```

**Usage:**
- Create Tournament Form
- Match Score Input
- Settings Panel

### 3. Data Display

```bash
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add progress
```

**Usage:**
- `Table` - Tournament participants, match history
- `Badge` - Status indicators (ACTIVE, IN_PROGRESS)
- `Skeleton` - Loading states
- `Progress` - Tournament progress bars

### 4. Feedback & Overlays

```bash
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add alert
```

**Usage:**
- `Dialog` - Modal forms (Edit tournament)
- `AlertDialog` - Confirmations (Delete tournament)
- `Toast` - Success/error notifications
- `Popover` - Dropdown menus
- `Tooltip` - Hints

### 5. Navigation

```bash
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add breadcrumb
```

**Usage:**
- `Tabs` - Tournament details (Info, Bracket, Participants)
- `DropdownMenu` - User menu, actions
- `Breadcrumb` - Navigation trail

## 🎯 Components par Feature

### Feature: Tournaments

```bash
# Formulaire création tournoi
npx shadcn-ui@latest add form
npx shadcn-ui@latest add select
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add date-picker

# Liste tournois
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add pagination

# Vue détaillée
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add alert-dialog
```

### Feature: Matches

```bash
# Score input
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add toast

# Match list
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add skeleton
```

### Feature: Wallet

```bash
# Transaction history
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add pagination

# Deposit/Withdraw
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
```

### Feature: Settings

```bash
# Settings panel
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add form
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add separator
```

## 🚀 Installation Rapide (Tous les Components)

```bash
# Copier-coller cette commande pour installer TOUS les composants essentiels
npx shadcn-ui@latest add sheet separator scroll-area form label textarea select checkbox radio-group switch table badge skeleton progress dialog alert-dialog toast popover tooltip alert tabs dropdown-menu navigation-menu breadcrumb calendar
```

## 📝 Customization

Tous les composants sont dans `components/ui/` et peuvent être modifiés:

```tsx
// components/ui/button.tsx
const buttonVariants = cva(
  'base-styles',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        // Ajouter vos propres variants
        success: 'bg-green-600 text-white',
      },
    },
  }
)
```

## 🎨 Design Tokens

Les composants utilisent les variables CSS définies dans `app/globals.css`:

```css
.dark {
  --primary: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  /* Modifier ici pour changer tout le design */
}
```

## 📦 Maintenance

### Mettre à jour un composant

```bash
# Re-installer pour obtenir la dernière version
npx shadcn-ui@latest add button --overwrite
```

### Vérifier les dépendances

Certains composants nécessitent des packages additionnels:

```bash
# Form (react-hook-form + zod)
npm install react-hook-form zod @hookform/resolvers

# Calendar (date-fns)
npm install date-fns

# Toast (sonner)
npm install sonner
```

## 🔗 Documentation Officielle

https://ui.shadcn.com/docs/components

Chaque composant a:
- ✅ Exemples d'usage
- ✅ Props API
- ✅ Variants disponibles
- ✅ Accessibility (ARIA)

---

**Note:** Shadcn/ui n'est PAS une library npm classique. Les composants sont **copiés dans votre projet** et peuvent être modifiés librement.
