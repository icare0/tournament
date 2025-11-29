# 🏆 Tournament SaaS Platform

API-First platform for e-sport tournament management with integrated billing system.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6

### Installation

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Edit .env with your database credentials

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start development server
npm run start:dev
```

The API will be available at `http://localhost:3000/api/v1`
Swagger documentation: `http://localhost:3000/api/docs`

## 📚 Documentation

- **[Architecture Documentation](./ARCHITECTURE.md)** - Complete system architecture
- **[API Documentation](http://localhost:3000/api/docs)** - Swagger/OpenAPI docs (after starting server)

## 🏗️ Project Structure

```
tournament/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── common/
│   │   └── prisma/            # Prisma service (global)
│   ├── modules/
│   │   ├── auth/              # Authentication & Authorization
│   │   ├── tournament/        # Tournament management
│   │   ├── referee/           # Referee system
│   │   ├── billing/           # Wallet & Transactions (Double-Entry)
│   │   ├── realtime/          # WebSocket (Socket.io)
│   │   └── analytics/         # Stats & Leaderboards
│   ├── app.module.ts
│   └── main.ts
└── package.json
```

## 🛠️ Tech Stack

- **Backend:** NestJS (TypeScript)
- **Database:** PostgreSQL with JSONB
- **ORM:** Prisma
- **Cache/Queue:** Redis + Bull
- **Real-time:** Socket.io
- **Auth:** JWT + Passport
- **Docs:** Swagger/OpenAPI

## 📦 Available Scripts

```bash
npm run start:dev          # Start development server
npm run build              # Build for production
npm run start:prod         # Start production server
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run database migrations
npm run prisma:studio      # Open Prisma Studio (DB GUI)
npm run test               # Run tests
npm run lint               # Lint code
```

## 🎯 Key Features

### ✅ Implemented (Architecture)
- Complete Prisma schema with 9 core models
- Modular NestJS architecture (6 modules)
- Double-Entry accounting system for wallets
- Support for multiple tournament types (Single/Double Elim, Round Robin, Swiss)
- JSONB fields for flexible game-specific data
- Job queue infrastructure (Bull)

### 🚧 To Be Implemented (Phase 2)
- Authentication logic (JWT, bcrypt)
- Tournament bracket generation algorithms
- Double-entry transaction logic
- WebSocket real-time updates
- Analytics calculations
- Unit & E2E tests

## 🔐 Authentication

JWT-based authentication with role-based access control (RBAC).

**Roles:**
- `ADMIN` - Full platform access
- `ORGANIZER` - Create and manage tournaments
- `PLAYER` - Join tournaments, view stats
- `REFEREE` - Manage assigned tournaments, report results
- `SPECTATOR` - Read-only access

## 💰 Billing System

The platform uses **Double-Entry Accounting** for financial integrity:

- Every transaction creates two entries (DEBIT + CREDIT)
- Wallet balance snapshots for auditing
- Locked balance for tournaments in progress
- Automatic prize distribution

See [ARCHITECTURE.md](./ARCHITECTURE.md#modèle-fintech) for detailed explanation.

## 🎮 Supported Tournament Types

1. **Single Elimination** - Classic knockout bracket
2. **Double Elimination** - Winner's + Loser's bracket
3. **Round Robin** - Everyone plays everyone
4. **Swiss System** - Pairing based on current standings
5. **Battle Royale** - Last man standing (custom logic)
6. **Custom** - Flexible configuration

## 📊 Database Schema Highlights

- **9 Core Models:** User, Tournament, Match, Participant, Wallet, Transaction, GameStats, TournamentPhase, Job
- **JSONB Fields:** Flexible storage for game-specific rules, stats, and configurations
- **Performance Indexes:** Optimized for common queries
- **Unique Constraints:** Prevent duplicate participations

## 🔄 Real-time Updates

WebSocket events via Socket.io:
- Match score updates
- Tournament status changes
- User notifications
- Live leaderboards

## 📈 Analytics

Track and analyze:
- Player performance (win rate, K/D, etc.)
- Tournament statistics
- Financial metrics
- Game-specific leaderboards

## 🤝 Contributing

This is the initial architecture phase. Implementation details coming in Phase 2.

## 📄 License

UNLICENSED - Private project

---

**Architecture Version:** 1.0
**Created:** 2025-11-29
**Stack:** NestJS + PostgreSQL + Prisma + Redis
