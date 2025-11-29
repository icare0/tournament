# Tournament SaaS Platform - Architecture Documentation

## 📋 Table des Matières
1. [Vue d'ensemble](#vue-densemble)
2. [Stack Technique](#stack-technique)
3. [Architecture des Données (Prisma Schema)](#architecture-des-données)
4. [Architecture Modulaire NestJS](#architecture-modulaire-nestjs)
5. [Modèle Fintech - Double-Entry Accounting](#modèle-fintech)
6. [Diagramme de Relations](#diagramme-de-relations)

---

## 🎯 Vue d'ensemble

Plateforme SaaS de gestion de tournois e-sport avec une approche **API-First**. Architecture modulaire scalable utilisant NestJS et PostgreSQL.

### Fonctionnalités Principales
- Gestion complète de tournois (Single/Double Elimination, Round Robin, Swiss, Battle Royale)
- Système de paiement et wallet intégré avec comptabilité double-entrée
- Gestion des matchs en temps réel (WebSockets)
- Analytics et leaderboards
- Système d'arbitrage
- File d'attente de jobs (Bull/Redis)

---

## 🛠 Stack Technique

| Technologie | Usage |
|-------------|-------|
| **NestJS** | Framework backend TypeScript |
| **PostgreSQL** | Base de données relationnelle avec support JSONB |
| **Prisma** | ORM moderne avec type-safety |
| **Redis** | Cache + Bull Queue pour jobs asynchrones |
| **JWT** | Authentification stateless |
| **Socket.io** | WebSockets pour temps réel |
| **Swagger** | Documentation API auto-générée |

---

## 🗄️ Architecture des Données

### 1. **Users & Authentication**

```prisma
model User {
  id            String       @id @default(uuid())
  email         String       @unique
  username      String       @unique
  passwordHash  String
  role          UserRole     // ADMIN, ORGANIZER, PLAYER, REFEREE, SPECTATOR
  status        UserStatus   // ACTIVE, SUSPENDED, BANNED
}
```

**Index de performance:**
- `email`, `username` (authentification rapide)
- `role`, `status` (filtrage par rôle/statut)

---

### 2. **Tournaments**

```prisma
model Tournament {
  id              String              @id
  name            String
  game            String              // "League of Legends", "Valorant"
  type            TournamentType      // SINGLE_ELIMINATION, DOUBLE_ELIMINATION, etc.
  status          TournamentStatus    // DRAFT, IN_PROGRESS, COMPLETED

  maxParticipants Int
  entryFee        Decimal
  prizePool       Decimal

  // JSONB Fields for flexibility
  rules           Json?               // { matchFormat: "BO3", maps: [...] }
  prizes          Json?               // Prize distribution config
  customSettings  Json?               // Game-specific settings
}
```

**Points clés:**
- **JSONB `rules`**: Permet de stocker des règles spécifiques par jeu sans modifier le schéma
- **JSONB `prizes`**: Configuration flexible de distribution des prix (%, montants fixes)
- **Index**: `status`, `type`, `game`, `startDate` pour requêtes performantes

---

### 3. **Tournament Phases** (Multi-Stage Tournaments)

```prisma
model TournamentPhase {
  id            String        @id
  tournamentId  String
  name          String        // "Group Stage", "Playoffs"
  type          PhaseType
  order         Int           // Séquence: 1, 2, 3
  config        Json?         // Configuration spécifique à la phase
}
```

**Usage:**
- Permet des tournois multi-phases (ex: Group Stage → Playoffs → Finals)
- Chaque phase peut avoir ses propres règles

---

### 4. **Participants**

```prisma
model Participant {
  id            String              @id
  tournamentId  String
  userId        String
  status        ParticipantStatus   // REGISTERED, CHECKED_IN, ELIMINATED
  seed          Int?                // Position de seed
  finalRank     Int?                // Classement final

  teamName      String?
  teamMembers   Json?               // Support équipes
}
```

**Relations:**
- Un participant peut avoir plusieurs matchs (homeMatches, awayMatches)
- Contrainte unique: `@@unique([tournamentId, userId])` (un user = 1 participation par tournoi)

---

### 5. **Matches**

```prisma
model Match {
  id                String        @id
  tournamentId      String
  phaseId           String?

  round             Int
  matchNumber       Int
  bestOf            Int           // BO1, BO3, BO5

  homeParticipantId String?
  awayParticipantId String?

  homeScore         Int
  awayScore         Int
  winnerId          String?

  matchData         Json?         // Données détaillées (maps, scores par game)
}
```

**JSONB `matchData`:**
```json
{
  "maps": [
    { "name": "Dust2", "homeScore": 16, "awayScore": 14 },
    { "name": "Inferno", "homeScore": 12, "awayScore": 16 }
  ],
  "mvp": "user-id-123"
}
```

---

### 6. **Game Statistics** (Flexible JSONB)

```prisma
model GameStats {
  id            String    @id
  matchId       String
  participantId String
  userId        String

  stats         Json      // Game-specific stats
}
```

**Exemple de `stats` JSONB:**
```json
{
  "kills": 25,
  "deaths": 10,
  "assists": 15,
  "damage": 45000,
  "headshots": 12,
  "champion": "Riven"
}
```

**Avantages:**
- Pas besoin de modifier le schéma pour chaque nouveau jeu
- Requêtes JSON supportées par PostgreSQL: `stats->>'kills'`

---

### 7. **Wallet System**

```prisma
model Wallet {
  id            String          @id
  userId        String          @unique

  balance       Decimal         // Solde disponible
  lockedBalance Decimal         // Fonds bloqués (tournois en cours)

  currency      String          @default("USD")
  status        WalletStatus    // ACTIVE, FROZEN, CLOSED
}
```

**Index de performance:**
- `userId` (lookup rapide)
- `status` (filtrage des wallets actifs)

---

### 8. **Transactions** (Double-Entry)

```prisma
model Transaction {
  id                        String              @id
  walletId                  String
  userId                    String

  type                      TransactionType     // DEPOSIT, WITHDRAWAL, TOURNAMENT_ENTRY, etc.
  entryType                 EntryType           // DEBIT or CREDIT
  amount                    Decimal

  counterpartyTransactionId String?  @unique    // Link to opposite entry
  balanceAfter              Decimal             // Snapshot du solde

  referenceId               String?             // Tournament/Match ID
  referenceType             String?             // "TOURNAMENT", "MATCH"
}
```

**Index critiques:**
- `walletId`, `userId` (requêtes fréquentes)
- `type`, `status` (filtrage)
- `referenceId` (tracking des transactions liées à un tournoi)
- `createdAt` (tri chronologique)

---

### 9. **Job Queue**

```prisma
model Job {
  id            String        @id
  type          JobType       // MATCH_NOTIFICATION, PRIZE_DISTRIBUTION
  status        JobStatus     // WAITING, ACTIVE, COMPLETED

  data          Json          // Job payload
  result        Json?         // Résultat du job

  scheduledFor  DateTime?     // Planification différée
  attempts      Int
  maxAttempts   Int
}
```

**Usage avec Bull:**
- Notifications de matchs
- Distribution automatique des prix
- Calculs d'analytics lourds
- Webhooks

---

## 🏗️ Architecture Modulaire NestJS

### Vue d'ensemble des Modules

```
src/
├── common/
│   └── prisma/          # PrismaModule (Global)
├── modules/
│   ├── auth/            # AuthModule
│   ├── tournament/      # TournamentModule
│   ├── referee/         # RefereeModule
│   ├── billing/         # BillingModule
│   ├── realtime/        # RealtimeModule
│   └── analytics/       # AnalyticsModule
└── app.module.ts
```

---

### 1️⃣ **AuthModule**

**Responsabilité:**
Gère l'authentification JWT, l'enregistrement des utilisateurs, la vérification email, et le contrôle d'accès basé sur les rôles (RBAC).

**Technologies:**
- Passport.js (JWT + Local Strategy)
- bcrypt (hashing des mots de passe)
- Guards NestJS pour protection des routes

**Endpoints:**
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/verify-email
POST /api/v1/auth/forgot-password
```

---

### 2️⃣ **TournamentModule**

**Responsabilité:**
Gère le cycle de vie complet des tournois : création, inscription, génération de brackets, gestion des phases, et orchestration des matchs.

**Services inclus:**
- `TournamentService` - CRUD tournois
- `MatchService` - Gestion des matchs
- `ParticipantService` - Inscriptions/check-in
- `PhaseService` - Phases de tournoi

**Logique métier clé:**
- Génération automatique de brackets (Single/Double Elimination, Swiss, Round Robin)
- Validation des inscriptions (vérification paiement)
- Transition automatique entre phases
- Calcul des seeds

**Endpoints:**
```
POST   /api/v1/tournaments
GET    /api/v1/tournaments (filters: status, game, type)
POST   /api/v1/tournaments/:id/register
POST   /api/v1/tournaments/:id/start
GET    /api/v1/tournaments/:id/bracket
```

---

### 3️⃣ **RefereeModule**

**Responsabilité:**
Gère l'assignation des arbitres aux tournois, leurs permissions pour modifier les scores, et le workflow de résolution des litiges.

**Fonctionnalités:**
- Attribution d'arbitres à des tournois
- Notifications push pour matchs assignés
- Interface de report de résultats (referee-only)
- Système de disputes avec escalade

**Endpoints:**
```
POST   /api/v1/tournaments/:id/referees
POST   /api/v1/matches/:id/report (referee only)
POST   /api/v1/matches/:id/dispute
```

---

### 4️⃣ **BillingModule**

**Responsabilité:**
Orchestre toutes les opérations financières : gestion des wallets, transactions double-entrée, frais d'entrée, distribution des prix, et réconciliation comptable.

**Services inclus:**
- `WalletService` - CRUD wallets, lock/unlock funds
- `TransactionService` - Double-entry transactions
- `BillingService` - Orchestration haut niveau

**Workflows:**
1. **Inscription tournoi:**
   - Lock `entryFee` dans `lockedBalance`
   - Créer transaction DEBIT/CREDIT
2. **Distribution des prix:**
   - Calculer prize pool
   - Créer transactions pour chaque gagnant
   - Unlock fonds des perdants

**Endpoints:**
```
GET  /api/v1/billing/wallet
POST /api/v1/billing/deposit
POST /api/v1/billing/withdraw
GET  /api/v1/billing/transactions
```

---

### 5️⃣ **RealtimeModule**

**Responsabilité:**
Fournit des mises à jour en temps réel via WebSockets pour les scores de matchs, les changements de statut de tournois, et les notifications.

**Technologies:**
- Socket.io (WebSocket)
- Room-based broadcasting (joinTournament, joinMatch)

**Events:**
```typescript
// Client → Server
socket.emit('joinTournament', tournamentId)
socket.emit('joinMatch', matchId)

// Server → Client
socket.on('matchUpdate', (data) => { ... })
socket.on('tournamentUpdate', (data) => { ... })
socket.on('notification', (data) => { ... })
```

---

### 6️⃣ **AnalyticsModule**

**Responsabilité:**
Calcule et expose les métriques de performance des joueurs, les statistiques de tournois, les leaderboards globaux, et les analytics financiers pour les admins.

**Métriques calculées:**
- Win rate par joueur
- Performance score (basé sur GameStats)
- Trends de participation
- Revenue analytics
- Match duration analytics

**Endpoints:**
```
GET /api/v1/analytics/player/:id
GET /api/v1/analytics/tournament/:id
GET /api/v1/analytics/leaderboard
GET /api/v1/analytics/revenue (admin only)
```

---

## 💰 Modèle Fintech - Double-Entry Accounting

### Qu'est-ce que le Double-Entry?

Le **Double-Entry Accounting** (comptabilité en partie double) est un système où **chaque transaction financière crée DEUX entrées** :

1. **DEBIT** (débit) - L'argent qui **quitte** un compte
2. **CREDIT** (crédit) - L'argent qui **entre** dans un compte

**Principe fondamental:**
```
Σ DEBITS = Σ CREDITS
```

Cela garantit que l'argent ne peut ni apparaître ni disparaître magiquement.

---

### Implémentation dans le Schema Prisma

#### Modèle `Transaction`

```prisma
model Transaction {
  id                        String              @id
  walletId                  String
  type                      TransactionType
  entryType                 EntryType           // DEBIT or CREDIT
  amount                    Decimal

  // Double-Entry Link
  counterpartyTransactionId String?  @unique    // ⚡ Clé du système

  balanceAfter              Decimal             // Snapshot pour audit
  referenceId               String?             // Link to Tournament/Match
}
```

---

### Exemple Concret : Inscription à un Tournoi

**Scénario:**
Le joueur **User A** (ID: `user-123`) paie **100 USD** d'entry fee pour un tournoi.

**Processus:**

1. **Transaction 1 (DEBIT) - Argent quitte le wallet du joueur**
   ```json
   {
     "id": "txn-001",
     "walletId": "wallet-user-123",
     "userId": "user-123",
     "type": "TOURNAMENT_ENTRY",
     "entryType": "DEBIT",
     "amount": -100.00,
     "counterpartyTransactionId": "txn-002",
     "balanceAfter": 400.00,
     "referenceId": "tournament-456",
     "referenceType": "TOURNAMENT"
   }
   ```

2. **Transaction 2 (CREDIT) - Argent entre dans le wallet de la plateforme**
   ```json
   {
     "id": "txn-002",
     "walletId": "wallet-platform",
     "userId": "platform",
     "type": "TOURNAMENT_ENTRY",
     "entryType": "CREDIT",
     "amount": 100.00,
     "counterpartyTransactionId": "txn-001",
     "balanceAfter": 5000.00,
     "referenceId": "tournament-456",
     "referenceType": "TOURNAMENT"
   }
   ```

**Résultat:**
- Wallet User A: `500 → 400 USD`
- Wallet Platform: `4900 → 5000 USD`
- Les deux transactions sont liées via `counterpartyTransactionId`

---

### Avantages du Double-Entry

| Avantage | Explication |
|----------|-------------|
| **Audit Trail Complet** | Chaque mouvement d'argent est tracé avec sa source et destination |
| **Intégrité des Données** | Impossible de créer de l'argent "from thin air" |
| **Détection de Fraude** | Facile de détecter les anomalies (sum(DEBIT) ≠ sum(CREDIT)) |
| **Réconciliation Simple** | Validation comptable automatique |
| **Historique Immuable** | Snapshot `balanceAfter` permet de reconstituer l'état à tout moment |

---

### Validation d'Intégrité (Auditing)

```typescript
async validateTransactionIntegrity() {
  const debits = await prisma.transaction.aggregate({
    where: { entryType: 'DEBIT' },
    _sum: { amount: true }
  });

  const credits = await prisma.transaction.aggregate({
    where: { entryType: 'CREDIT' },
    _sum: { amount: true }
  });

  if (debits._sum.amount !== credits._sum.amount) {
    throw new Error('Transaction integrity violated!');
  }
}
```

---

### Gestion du `lockedBalance`

```prisma
model Wallet {
  balance       Decimal  // Fonds disponibles
  lockedBalance Decimal  // Fonds bloqués (tournois en cours)
}
```

**Workflow:**

1. **Inscription tournoi:**
   - `balance -= entryFee`
   - `lockedBalance += entryFee`

2. **Tournoi terminé (gagnant):**
   - `lockedBalance -= entryFee`
   - Créer transaction CREDIT pour le prize

3. **Tournoi annulé:**
   - `lockedBalance -= entryFee`
   - `balance += entryFee` (refund)

---

## 📊 Diagramme de Relations

```
User
 ├─ 1:1 Wallet
 │   └─ 1:N Transaction
 ├─ 1:N Tournament (organizedTournaments)
 ├─ 1:N Participant
 │   ├─ N:1 Tournament
 │   └─ 1:N GameStats
 └─ N:N Tournament (refereeTournaments)

Tournament
 ├─ 1:N TournamentPhase
 │   └─ 1:N Match
 ├─ 1:N Participant
 └─ 1:N Match

Match
 ├─ N:1 Participant (home)
 ├─ N:1 Participant (away)
 └─ 1:N GameStats
```

---

## 🚀 Prochaines Étapes

### Étape 2 : Implémentation (à venir)
1. Implémenter AuthModule (JWT, bcrypt, email verification)
2. Implémenter TournamentModule (bracket generation algorithms)
3. Implémenter BillingModule (double-entry logic)
4. Setup Bull queues pour jobs asynchrones
5. WebSocket implementation pour real-time
6. Tests unitaires + E2E

### Étape 3 : Infrastructure
1. Docker Compose (PostgreSQL, Redis, API)
2. CI/CD Pipeline
3. Monitoring (Prometheus, Grafana)
4. Rate limiting & security hardening

---

## 📝 Notes de Conception

### Pourquoi JSONB pour `rules`, `prizes`, `matchData`, `stats`?

**Problème:**
Chaque jeu e-sport a des règles, stats, et configurations différentes. Créer des colonnes spécifiques serait rigide.

**Solution: JSONB**
- Flexibilité totale par jeu
- Requêtes JSON natives PostgreSQL: `stats->>'kills' > 10`
- Pas de migrations pour nouveaux jeux
- Type-safety avec Zod/JSON Schema si besoin

**Trade-off:**
- ✅ Flexibilité
- ✅ Pas de migrations fréquentes
- ⚠️ Moins de validation au niveau DB (géré en application)

---

### Pourquoi des Phases séparées?

Permet de gérer des tournois complexes comme:
- **LCS Style:** Group Stage (Round Robin) → Playoffs (Single Elim)
- **Worlds:** Play-In → Groups → Knockouts
- Chaque phase peut avoir ses propres règles (bestOf, maps, etc.)

---

## 📚 Références

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Double-Entry Accounting](https://en.wikipedia.org/wiki/Double-entry_bookkeeping)
- [PostgreSQL JSONB Performance](https://www.postgresql.org/docs/current/datatype-json.html)

---

**Auteur:** Senior Backend Architect
**Version:** 1.0
**Date:** 2025-11-29
