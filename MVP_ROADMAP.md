# 🎯 Roadmap MVP - Version Alpha (1 Mois)

## 📋 Vue d'ensemble

Objectif : Livrer une **version alpha fonctionnelle** en 1 mois avec les fonctionnalités essentielles pour valider le concept.

**Définition "Alpha" :**
- ✅ Les utilisateurs peuvent créer un tournoi
- ✅ Les joueurs peuvent s'inscrire et payer l'entry fee
- ✅ Le système génère automatiquement un calendrier optimisé
- ✅ Les matchs sont suivis en temps réel (WebSocket)
- ✅ Les gagnants reçoivent automatiquement leurs gains

**Hors Scope Alpha :**
- ❌ Dashboard admin complet
- ❌ Système de disputes complexe
- ❌ Multi-devises
- ❌ Mobile app native
- ❌ Analytics avancés

---

## 🔥 3 PRIORITÉS ABSOLUES

### ⭐ Priorité 1 : Authentication & User Management (Semaine 1)

**Pourquoi c'est critique :**
Sans auth robuste, impossible de sécuriser les paiements et les tournois.

#### Livrables

**1.1 - Authentication JWT Complète**
```typescript
✅ POST /api/v1/auth/register
   - Email + Password validation (min 8 chars, 1 uppercase, 1 number)
   - Hashing bcrypt (cost: 10)
   - Créer wallet automatiquement
   - Envoyer email de vérification

✅ POST /api/v1/auth/login
   - Validation credentials
   - Générer JWT (expiration: 7 jours)
   - Refresh token strategy

✅ POST /api/v1/auth/verify-email
   - Token de vérification (expires: 24h)
   - Mettre à jour user.emailVerified = true

✅ POST /api/v1/auth/forgot-password
   - Email avec lien de reset
   - Token sécurisé (6 digits, expires: 15min)
```

**1.2 - Guards & Middlewares**
```typescript
✅ JwtAuthGuard (protège toutes les routes)
✅ RolesGuard (ADMIN, ORGANIZER, PLAYER, REFEREE)
✅ EmailVerifiedGuard (bloque si email non vérifié)
```

**1.3 - User Profile Management**
```typescript
✅ GET /api/v1/users/me - Mon profil
✅ PATCH /api/v1/users/me - Modifier profil (username, avatar, country)
✅ GET /api/v1/users/:id - Voir profil public
```

**Estimation :** 5-6 jours
**Critères de Succès :**
- Tests E2E pour register/login/verify
- JWT expiration gérée (refresh token)
- Minimum 80% code coverage

---

### ⭐ Priorité 2 : Tournament Lifecycle Complet (Semaine 2-3)

**Pourquoi c'est critique :**
C'est le cœur de la plateforme. Sans ça, il n'y a pas de produit.

#### Livrables

**2.1 - Création & Configuration Tournoi**
```typescript
✅ POST /api/v1/tournaments
   Body: {
     name: string,
     game: "CS:GO" | "Valorant" | "League of Legends",
     type: "SINGLE_ELIMINATION" | "DOUBLE_ELIMINATION",
     maxParticipants: 8 | 16 | 32,
     entryFee: number,
     prizePool: number,
     startDate: Date,
     rules: { matchFormat: "BO3", maps: [...] }
   }

✅ PATCH /api/v1/tournaments/:id
   - Modification autorisée si status = DRAFT

✅ GET /api/v1/tournaments (pagination, filters)
   - Filtres: game, status, visibility
   - Tri: startDate, prizePool, participants

✅ GET /api/v1/tournaments/:id
   - Détails complets + bracket + participants
```

**2.2 - Inscription & Paiement**
```typescript
✅ POST /api/v1/tournaments/:id/register
   - Vérifier wallet balance >= entryFee
   - Lock funds dans wallet.lockedBalance
   - Créer Participant (status: REGISTERED)
   - Double-entry transaction (DEBIT user, CREDIT platform)

✅ POST /api/v1/tournaments/:id/check-in
   - Participant.status → CHECKED_IN
   - Fenêtre de check-in: 30 min avant startDate

✅ DELETE /api/v1/tournaments/:id/withdraw
   - Seulement si status = REGISTRATION_OPEN
   - Refund automatique (unlock funds)
```

**2.3 - Génération de Bracket Automatique**
```typescript
✅ POST /api/v1/tournaments/:id/start
   - Vérifier: minParticipants atteint (ex: 8/8)
   - Générer bracket selon type:
     → SINGLE_ELIMINATION: Simple arbre
     → DOUBLE_ELIMINATION: Winner's + Loser's bracket
   - Status → IN_PROGRESS

✅ Bracket Generation Service
   - generateSingleEliminationBracket(participants)
   - generateDoubleEliminationBracket(participants)
   - Assignation automatique des seeds
```

**2.4 - Smart Planning (Scheduling)**
```typescript
✅ Intégrer SchedulerService
   - Input: matches[], venues[], constraints
   - Output: scheduledMatches[] avec horaires optimisés
   - Sauvegarder scheduledAt dans chaque Match

✅ Venues Management
   - Créer modèle Venue (ou utiliser metadata)
   - Définir disponibilité par défaut (9h-22h)
```

**2.5 - Gestion des Matchs**
```typescript
✅ State Machine Integration
   - PENDING → READY → ONGOING → COMPLETED

✅ POST /api/v1/matches/:id/start (Referee only)
   - Transition vers ONGOING
   - Déclencher BullMQ monitoring

✅ PATCH /api/v1/matches/:id/score (Referee only)
   - Update homeScore, awayScore
   - Broadcast via WebSocket

✅ POST /api/v1/matches/:id/complete (Referee only)
   - Définir winnerId
   - Transition vers COMPLETED
   - Mettre à jour Participant.wins/losses
   - Progression automatique du bracket
```

**2.6 - Distribution des Prix**
```typescript
✅ Automatic Prize Distribution
   - Quand Tournament.status → COMPLETED
   - Calculer distribution selon prizes config
   - Créer transactions CREDIT pour gagnants
   - Unlock funds des perdants
   - Send notification emails

✅ POST /api/v1/tournaments/:id/complete
   - Vérifier: tous les matchs COMPLETED
   - Calculer finalRank pour chaque participant
   - Trigger prize distribution job
```

**Estimation :** 12-14 jours
**Critères de Succès :**
- Workflow complet: Create → Register → Start → Play → Complete
- Bracket auto-généré correctement
- Prizes distribués automatiquement
- Tests E2E pour chaque étape

---

### ⭐ Priorité 3 : Realtime Updates & Basic Dashboard (Semaine 4)

**Pourquoi c'est critique :**
L'expérience utilisateur en temps réel est un différenciateur clé.

#### Livrables

**3.1 - WebSocket Integration**
```typescript
✅ TournamentGateway déjà créé (Phase 3) ✅
   - Intégrer dans MatchService
   - Broadcast events sur chaque action

✅ Events Prioritaires:
   - score_update (lors de PATCH /matches/:id/score)
   - match_start (lors de POST /matches/:id/start)
   - match_end (lors de POST /matches/:id/complete)
   - tournament_update (lors de changements status)

✅ Client-Side Integration (Frontend)
   - Connexion Socket.io
   - Join tournament room automatiquement
   - Update UI en temps réel
```

**3.2 - Frontend Dashboard Minimal**

**Pages Essentielles :**

1. **Page d'Accueil**
   - Liste des tournois (REGISTRATION_OPEN, IN_PROGRESS)
   - Filtres: jeu, date
   - Card: nom, game, prizePool, participants count

2. **Page Tournoi**
   - Détails: name, description, rules, prizes
   - Bracket visuel (arbre interactif)
   - Liste des participants
   - Bouton "S'inscrire" (si REGISTRATION_OPEN)

3. **Page Match Live**
   - Score en temps réel (WebSocket)
   - Participants info
   - Timer (durée match)
   - Game stats (si disponibles)

4. **Profile Utilisateur**
   - Stats: wins, losses, win rate
   - Tournois participés
   - Wallet balance
   - Transaction history

5. **Page Admin (Basique)**
   - Liste des tournois (tous statuts)
   - Actions: Start, Complete, Cancel
   - Liste des utilisateurs
   - Actions: Ban, Promote to REFEREE

**Tech Stack Frontend :**
```
React + TypeScript
Socket.io-client
TanStack Query (React Query) pour API calls
Zustand pour state management
Tailwind CSS pour UI
Recharts pour graphiques (leaderboards)
```

**3.3 - Notifications de Base**
```typescript
✅ Email Notifications (via job queue)
   - Tournament registration confirmed
   - Match starting soon (15min avant)
   - Match result
   - Prize received

✅ In-App Notifications (optionnel alpha)
   - Stored in DB (model Notification)
   - Badge counter
```

**Estimation :** 8-10 jours
**Critères de Succès :**
- Score mis à jour en temps réel (<500ms latency)
- Frontend responsive (mobile-friendly)
- Bracket interactif et lisible
- Minimum 3 jeux supportés (CS:GO, Valorant, LoL)

---

## 📅 Planning Détaillé (4 Semaines)

### Semaine 1 : Authentication & Foundation
| Jour | Tâches | Status |
|------|--------|--------|
| **J1-2** | Setup JWT + bcrypt, Register/Login endpoints | 🔵 |
| **J3** | Email verification system | 🔵 |
| **J4** | Password reset flow | 🔵 |
| **J5** | Guards (JWT, Roles, EmailVerified) | 🔵 |
| **J6-7** | User profile endpoints + tests E2E | 🔵 |

### Semaine 2 : Tournament Core Logic
| Jour | Tâches | Status |
|------|--------|--------|
| **J1-2** | Tournament CRUD + validation | 🔵 |
| **J3** | Registration + wallet lock/unlock | 🔵 |
| **J4** | Bracket generation (Single Elim) | 🔵 |
| **J5** | Smart Planning integration | 🔵 |
| **J6-7** | Tests + bugfixes | 🔵 |

### Semaine 3 : Match Management & Prizes
| Jour | Tâches | Status |
|------|--------|--------|
| **J1-2** | State Machine integration dans MatchService | 🔵 |
| **J3** | Score update + progression bracket | 🔵 |
| **J4** | Prize distribution automatique | 🔵 |
| **J5** | BullMQ monitoring integration | 🔵 |
| **J6-7** | Tests workflow complet | 🔵 |

### Semaine 4 : Realtime & Frontend
| Jour | Tâches | Status |
|------|--------|--------|
| **J1-2** | WebSocket integration dans services | 🔵 |
| **J3-4** | Frontend: Home + Tournament page | 🔵 |
| **J5** | Frontend: Live match + Profile | 🔵 |
| **J6** | Email notifications setup | 🔵 |
| **J7** | Tests E2E complets + déploiement staging | 🔵 |

---

## 🛠️ Stack Technique Définitive

### Backend
```
✅ NestJS (TypeScript)
✅ PostgreSQL 14+
✅ Prisma ORM
✅ Redis (cache + Bull queues + Socket.io adapter)
✅ Socket.io (WebSocket)
✅ JWT (authentication)
✅ Bcrypt (passwords)
✅ Nodemailer (emails)
```

### Frontend (Alpha)
```
✅ React 18 + TypeScript
✅ Vite (build tool)
✅ TanStack Query (data fetching)
✅ Socket.io-client
✅ Tailwind CSS
✅ Zustand (state)
✅ React Router v6
```

### Infrastructure (Alpha)
```
✅ Docker Compose (local dev)
✅ PostgreSQL container
✅ Redis container
✅ API container (NestJS)
✅ Frontend container (Nginx)
```

---

## 🚀 Déploiement Alpha

### Option 1 : VPS Simple (Recommandé Alpha)
```
Provider: DigitalOcean / Hetzner
Instance: 4 vCPU, 8GB RAM ($40/mois)

Services:
- NestJS API (PM2)
- PostgreSQL (local)
- Redis (local)
- Nginx (reverse proxy + frontend)
```

### Option 2 : Serverless (Si budget limité)
```
API: Railway / Render ($15/mois)
DB: Supabase free tier
Redis: Upstash free tier
Frontend: Vercel free tier
```

### Setup Production Minimal
```bash
# docker-compose.prod.yml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: tournament_prod
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}

  api:
    build: .
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_HOST: redis
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
      - redis

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./frontend/dist:/usr/share/nginx/html
```

---

## 📊 Métriques de Succès Alpha

### KPIs Techniques
| Métrique | Target Alpha |
|----------|--------------|
| **Uptime** | 95%+ |
| **API Response Time** | <200ms (p95) |
| **WebSocket Latency** | <500ms |
| **Database Query Time** | <100ms (p95) |
| **Bug Count** | <5 critiques |

### KPIs Business
| Métrique | Target Alpha |
|----------|--------------|
| **Tournois créés** | 10+ |
| **Utilisateurs inscrits** | 50+ |
| **Matchs joués** | 100+ |
| **Taux de complétion tournois** | 80%+ |
| **NPS (Net Promoter Score)** | 6+ |

---

## 🎯 User Stories Prioritaires

### Must-Have (Alpha)
```
✅ US1: En tant qu'organisateur, je veux créer un tournoi CS:GO en 2 minutes
✅ US2: En tant que joueur, je veux m'inscrire et payer l'entry fee en 1 clic
✅ US3: En tant que spectateur, je veux voir le bracket et les scores en temps réel
✅ US4: En tant que joueur, je veux recevoir automatiquement mes gains
✅ US5: En tant qu'arbitre, je veux mettre à jour les scores facilement
```

### Nice-to-Have (Post-Alpha)
```
⏳ US6: En tant qu'admin, je veux voir des analytics détaillés
⏳ US7: En tant que joueur, je veux disputer un résultat
⏳ US8: En tant qu'utilisateur, je veux m'authentifier via Google/Discord
⏳ US9: En tant qu'organisateur, je veux personnaliser les règles de prix
⏳ US10: En tant que joueur, je veux participer en équipe
```

---

## 🔒 Sécurité Minimale (Alpha)

### Checklist
```
✅ Passwords hashed (bcrypt cost: 10)
✅ JWT signed avec secret fort (256-bit)
✅ HTTPS obligatoire (Let's Encrypt)
✅ Rate limiting (Throttler: 10 req/min par IP)
✅ Input validation (class-validator)
✅ SQL injection prevention (Prisma parameterized queries)
✅ XSS prevention (React auto-escaping)
✅ CORS configuré (whitelist domains)
✅ Helmet.js (security headers)
✅ .env secrets non-commités (.gitignore)
```

### Post-Alpha (Renforcement)
```
⏳ 2FA (Two-Factor Authentication)
⏳ Audit logs (toutes les actions sensibles)
⏳ Rate limiting par user (pas juste IP)
⏳ CAPTCHA sur register/login
⏳ Webhook signature verification
⏳ Database encryption at rest
⏳ PCI-DSS compliance (si payment gateway)
```

---

## 📝 Documentation Alpha

### Must-Have
```
✅ README.md - Quick start
✅ ARCHITECTURE.md - System design ✅
✅ BUSINESS_LOGIC.md - Core logic ✅
✅ SCALABILITY.md - Realtime & JSONB ✅
✅ API Documentation (Swagger auto-generated)
```

### Nice-to-Have
```
⏳ Deployment guide
⏳ Troubleshooting guide
⏳ API examples (Postman collection)
⏳ Frontend component library (Storybook)
```

---

## 🎉 Définition de "Done" pour Alpha

### Backend
- [x] Architecture Phase 1 ✅
- [x] Business Logic Phase 2 ✅
- [x] Scalability Phase 3 ✅
- [ ] Authentication implémentée + testée
- [ ] Tournament lifecycle complet (Create → Complete)
- [ ] WebSocket broadcasting fonctionnel
- [ ] Prize distribution automatique
- [ ] Tests E2E coverage >70%
- [ ] Déployé sur staging

### Frontend
- [ ] 5 pages essentielles responsive
- [ ] WebSocket integration temps réel
- [ ] Bracket interactif
- [ ] Wallet + transactions visible
- [ ] Tests E2E critiques (register, join tournament)

### DevOps
- [ ] Docker Compose production-ready
- [ ] CI/CD basique (GitHub Actions)
- [ ] Monitoring basique (logs structurés)
- [ ] Backup DB automatique (daily)

---

## 💡 Assumptions & Risks

### Assumptions
1. Un seul développeur full-stack (backend focus)
2. Frontend simple (pas de design system complexe)
3. Un seul jeu supporté initialement (CS:GO)
4. Paiements via wallet interne (pas de Stripe pour alpha)
5. Pas de mobile app (web responsive uniquement)

### Risks & Mitigations

| Risk | Impact | Probabilité | Mitigation |
|------|--------|-------------|------------|
| **Bracket generation bugs** | 🔴 High | Medium | Tests unitaires exhaustifs + manual testing |
| **WebSocket instabilité** | 🟠 Medium | Medium | Fallback polling si WS fail, monitoring |
| **Prize distribution errors** | 🔴 High | Low | Double-entry validation + dry-run mode |
| **Scope creep** | 🟠 Medium | High | Strict MVP scope, reject feature requests |
| **Performance issues** | 🟡 Low | Low | Load testing à 100 users, optimiser si needed |

---

## 🏁 Post-Alpha (V1.0 Beta)

### Phase 4 : Polish & Features (Mois 2)
```
✅ Multi-jeux (Valorant, LoL, Dota 2)
✅ Système de disputes complet
✅ Dashboard admin avancé
✅ Analytics détaillés (charts, trends)
✅ Email templates professionnels
✅ Mobile app (React Native)
```

### Phase 5 : Growth & Scale (Mois 3-6)
```
✅ Payment gateway (Stripe, PayPal)
✅ Multi-devises (USD, EUR, etc.)
✅ Sponsorship system
✅ Streaming integration (Twitch)
✅ AI bracket prediction
✅ Horizontal scaling (multi-regions)
```

---

**Version :** 1.0 (MVP Roadmap)
**Date :** 2025-11-29
**Timeline :** 4 semaines (1 mois)
**Auteur :** Senior Product Manager & Tech Lead

---

## 🎯 TL;DR - Les 3 Priorités en 1 Phrase

1. **Auth robuste** → Sans ça, pas de sécurité ni de paiements
2. **Tournament lifecycle complet** → C'est le cœur du produit
3. **Realtime updates** → Différenciateur clé pour l'UX

**Focus :** Faire ces 3 choses TRÈS BIEN plutôt que 10 choses à moitié.
