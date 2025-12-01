# 🏆 Tournament Platform - Full-Stack SaaS

**Production-ready Tournament Management Platform with Modern Architecture**

A comprehensive SaaS solution for organizing and managing esports tournaments with real-time features, bracket management, billing, and more.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.3-red.svg)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.8-teal.svg)](https://www.prisma.io/)

---

## ⚡ Quick Start

**Get started in under 5 minutes:**

```bash
# Clone and start with Docker (recommended)
git clone <your-repo-url>
cd tournament
cp .env.example .env
npm run docker:up
```

**That's it!** Your app is running:
- 🎨 Frontend: http://localhost:3001
- 🔧 Backend: http://localhost:3000/api/v1
- 📚 API Docs: http://localhost:3000/api

**For detailed instructions**: See [QUICKSTART.md](./QUICKSTART.md)

---

## 🎯 Features

### Core Features
- ✅ **Authentication System**: JWT-based auth with access/refresh tokens
- ✅ **Tournament Management**: Create, manage, and organize tournaments
- ✅ **Bracket System**: Single/double elimination, round robin, Swiss
- ✅ **Billing & Wallets**: Built-in payment system with transactions
- ✅ **Real-time Updates**: WebSocket integration for live match updates
- ✅ **Role-Based Access**: Admin, Organizer, Player roles
- ✅ **Match Management**: Schedule, track, and report match results

### Security Features
- ✅ **Rate Limiting**: Multi-tier protection (3 req/sec, 20 req/10sec, 100 req/min)
- ✅ **Security Headers**: Helmet.js for HTTP security
- ✅ **CORS Protection**: Whitelist-based origin control
- ✅ **Input Validation**: class-validator for all DTOs
- ✅ **Password Hashing**: bcrypt with 10 rounds
- ✅ **Environment Validation**: Strict validation at startup

### Developer Experience
- ✅ **TypeScript**: Full type safety across frontend and backend
- ✅ **API Documentation**: Auto-generated Swagger/OpenAPI docs
- ✅ **Docker Support**: One-command deployment
- ✅ **Testing Suite**: Unit and integration tests included
- ✅ **Hot Reload**: Fast development with auto-reload
- ✅ **Database Migrations**: Prisma migrations with version control

---

## 🏗️ Architecture

### Tech Stack

**Backend:**
- **Framework**: NestJS 10.3 with TypeScript
- **Database**: PostgreSQL 16 with Prisma ORM
- **Cache**: Redis (optional, for performance)
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest with comprehensive test coverage

**Frontend:**
- **Framework**: Next.js 14+ (App Router)
- **UI Components**: Shadcn/ui + Tailwind CSS v4
- **State Management**: Zustand + TanStack Query v5
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for data visualization

**DevOps:**
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions ready
- **Monitoring**: Health checks and logging
- **Deployment**: Vercel, Railway, AWS, DigitalOcean support

### Project Structure

```
tournament/
├── src/                      # Backend (NestJS)
│   ├── modules/
│   │   ├── auth/            # Authentication module
│   │   ├── tournament/      # Tournament management
│   │   ├── billing/         # Wallet & payments
│   │   └── prisma/          # Database client
│   ├── config/              # Configuration
│   └── main.ts              # Application entry
│
├── frontend/                 # Frontend (Next.js)
│   ├── app/                 # App Router pages
│   │   ├── (auth)/         # Auth pages (login, register)
│   │   ├── (dashboard)/    # Dashboard pages
│   │   └── (marketing)/    # Marketing pages
│   ├── components/          # Reusable components
│   │   ├── ui/             # Base UI components
│   │   ├── tournament/     # Tournament components
│   │   └── layout/         # Layout components
│   ├── lib/                # Utilities and configs
│   └── hooks/              # Custom React hooks
│
├── prisma/                  # Database schema & migrations
├── scripts/                 # Utility scripts
├── docker-compose.yml       # Docker orchestration
└── Dockerfile              # Backend container
```

---

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[SECURITY_AUDIT.md](./SECURITY_AUDIT.md)** - Security assessment
- **API Docs**: http://localhost:3000/api (when running)

---

## 🛠️ Available Scripts

### Development
```bash
npm run setup              # Initial project setup
npm run start:dev          # Start backend only
npm run dev:all           # Start backend + frontend
```

### Testing
```bash
npm run test              # Run unit tests
npm run test:cov          # Test coverage report
npm run test:e2e          # E2E tests
```

### Docker
```bash
npm run docker:up         # Start all containers
npm run docker:down       # Stop all containers
npm run docker:logs       # View logs
npm run docker:restart    # Restart services
npm run docker:clean      # Remove all (including volumes)
```

### Database
```bash
npm run prisma:generate   # Generate Prisma Client
npm run prisma:migrate    # Run migrations
npm run prisma:studio     # Open database GUI
npm run prisma:seed       # Seed database
```

### Production
```bash
npm run build             # Build for production
npm run start:prod        # Start production server
```

---

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

**Quick Deploy:**
- Frontend: Vercel with `vercel deploy`
- Backend: Railway or AWS ECS
- Database: Supabase, Neon, or Railway

---

## 📄 License

This project is licensed under the UNLICENSED License.

---

**Built with ❤️ using NestJS, Next.js, and TypeScript**
