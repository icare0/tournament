# 🚀 Tournament Platform - Deployment Guide

Complete guide for deploying the Tournament SaaS platform to production.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Local Development](#local-development)
4. [Docker Deployment](#docker-deployment)
5. [Production Deployment](#production-deployment)
6. [Environment Variables](#environment-variables)
7. [Database Setup](#database-setup)
8. [Security Checklist](#security-checklist)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## ⚡ Quick Start

### Option 1: Development Mode (Recommended for local development)

```bash
# 1. Initial setup
npm run setup

# 2. Update .env with your configuration
cp .env.example .env
# Edit .env with your database credentials

# 3. Start development servers (backend + frontend)
npm run dev:all
```

Access:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api/v1
- **API Docs**: http://localhost:3000/api

### Option 2: Docker (Production-like environment)

```bash
# 1. Update .env with your configuration
cp .env.example .env

# 2. Start all services with Docker
npm run docker:up
```

Access:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api/v1
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

---

## 🔧 Prerequisites

### Required

- **Node.js**: v20 or higher
- **npm**: v9 or higher
- **PostgreSQL**: v14 or higher
- **Git**: Latest version

### Optional (for Docker deployment)

- **Docker**: v24 or higher
- **Docker Compose**: v2.20 or higher

### Verify Installation

```bash
node --version    # Should be v20+
npm --version     # Should be v9+
docker --version  # If using Docker
```

---

## 💻 Local Development

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd tournament

# Run initial setup
npm run setup
```

### Step 2: Database Configuration

#### Option A: Local PostgreSQL

1. Install PostgreSQL on your system
2. Create a database:
   ```bash
   psql -U postgres
   CREATE DATABASE tournament_dev;
   \q
   ```

3. Update `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tournament_dev?schema=public"
   ```

#### Option B: Cloud PostgreSQL (Recommended for production)

Use services like:
- **Supabase**: Free tier with great features
- **Neon**: Serverless PostgreSQL
- **Railway**: Simple deployment
- **DigitalOcean**: Managed databases

Update `.env` with your cloud database URL:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
```

### Step 3: Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### Step 4: Generate JWT Secrets

**CRITICAL: Never use default secrets in production!**

```bash
# Generate secure JWT secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
```

Update `.env`:
```env
JWT_SECRET="your-generated-secret-here"
JWT_REFRESH_SECRET="your-other-generated-secret-here"
```

### Step 5: Start Development

#### Start Backend Only
```bash
npm run start:dev
```

#### Start Frontend Only
```bash
cd frontend
npm run dev
```

#### Start Both (Recommended)
```bash
npm run dev:all
```

---

## 🐳 Docker Deployment

### Step 1: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Update .env with production values
nano .env  # or use your preferred editor
```

### Step 2: Build and Start

```bash
# Start all services (postgres, redis, backend, frontend)
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down

# Restart services
npm run docker:restart

# Clean everything (removes volumes!)
npm run docker:clean
```

### Step 3: Run Migrations

The backend container automatically runs migrations on startup. But you can also run manually:

```bash
docker exec -it tournament-backend npx prisma migrate deploy
```

### Step 4: Access Services

- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- API Docs: http://localhost:3000/api
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

## 🌐 Production Deployment

### Deployment Platforms

Recommended platforms for production deployment:

#### 1. **Vercel** (Frontend) + **Railway** (Backend + Database)

**Frontend (Vercel):**
```bash
cd frontend
npx vercel deploy --prod
```

Environment variables in Vercel:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app
```

**Backend (Railway):**
1. Create new Railway project
2. Add PostgreSQL service
3. Add Redis service
4. Deploy backend with railway CLI or GitHub integration
5. Set environment variables in Railway dashboard

#### 2. **AWS** (Full Stack)

**Backend (EC2 or ECS):**
- Deploy Docker container to EC2/ECS
- Use RDS for PostgreSQL
- Use ElastiCache for Redis
- Configure security groups

**Frontend (S3 + CloudFront):**
```bash
cd frontend
npm run build
aws s3 sync out/ s3://your-bucket-name
```

#### 3. **DigitalOcean App Platform**

1. Connect your GitHub repository
2. Configure build commands:
   - Backend: `npm run build`
   - Frontend: `cd frontend && npm run build`
3. Set environment variables
4. Deploy

### Production Checklist

Before deploying to production:

- [ ] Update all environment variables
- [ ] Generate secure JWT secrets
- [ ] Configure production database (with backups!)
- [ ] Set up Redis instance
- [ ] Configure CORS origins for your frontend domain
- [ ] Enable HTTPS (SSL certificates)
- [ ] Set NODE_ENV=production
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure automatic backups
- [ ] Set up CI/CD pipeline
- [ ] Test all critical endpoints
- [ ] Load test your application

---

## 🔐 Environment Variables

### Required Variables

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"

# JWT Authentication (REQUIRED - MUST be changed from defaults!)
JWT_SECRET="generate-with-openssl-rand-base64-32"
JWT_REFRESH_SECRET="generate-with-openssl-rand-base64-32"
JWT_EXPIRATION="7d"

# CORS (REQUIRED)
ALLOWED_ORIGINS="https://yourfrontend.com,https://www.yourfrontend.com"

# Frontend URL (REQUIRED)
FRONTEND_URL="https://yourfrontend.com"
```

### Optional Variables

```env
# Application
NODE_ENV="production"
PORT=3000

# Redis (Optional - for caching and queues)
REDIS_HOST="your-redis-host"
REDIS_PORT=6379

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

### Frontend Environment Variables

Create `.env.local` in frontend directory:

```env
NEXT_PUBLIC_API_URL="https://your-backend-api.com/api/v1"
NEXT_PUBLIC_WS_URL="wss://your-backend-api.com"
```

---

## 🗄️ Database Setup

### Initial Setup

```bash
# Generate Prisma Client
npx prisma generate

# Create and run migrations
npx prisma migrate deploy  # Production
# OR
npx prisma migrate dev     # Development
```

### Database Backups

#### Automated Backups (Recommended)

Most cloud providers offer automated backups:
- **Supabase**: Point-in-time recovery
- **Railway**: Daily backups
- **AWS RDS**: Automated snapshots

#### Manual Backup

```bash
# Backup
pg_dump -h localhost -U postgres -d tournament_dev > backup.sql

# Restore
psql -h localhost -U postgres -d tournament_dev < backup.sql
```

### Database Seeding (Optional)

Create seed data for testing:

```bash
npm run prisma:seed
```

---

## 🔒 Security Checklist

### Critical Security Measures

- [x] Helmet.js enabled (HTTP security headers)
- [x] CORS configured with origin whitelist
- [x] Rate limiting enabled (3 tiers)
- [x] Input validation with class-validator
- [x] Environment variable validation
- [x] JWT authentication implemented
- [x] Password hashing with bcrypt (10 rounds)

### Additional Recommendations

- [ ] Enable HTTPS in production (SSL certificates)
- [ ] Implement email verification flow
- [ ] Add password strength requirements
- [ ] Implement input sanitization for XSS
- [ ] Add request logging with Winston/Pino
- [ ] Set up security monitoring
- [ ] Enable database connection encryption
- [ ] Implement API key rotation
- [ ] Add 2FA for admin accounts
- [ ] Regular security audits

### Password Requirements (To Implement)

Recommended password policy:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

---

## 📊 Monitoring & Maintenance

### Health Checks

Backend health endpoint:
```
GET /api/v1/health
```

Docker health checks are configured in:
- Backend: Every 30s
- PostgreSQL: Every 10s
- Redis: Every 10s

### Logging

View logs:

```bash
# Docker logs
npm run docker:logs

# Backend logs (development)
tail -f backend.log

# Frontend logs (development)
cd frontend && npm run dev
```

### Performance Monitoring

Recommended tools:
- **Application**: New Relic, DataDog
- **Database**: pgAdmin, Prisma Studio
- **Frontend**: Vercel Analytics, Google Analytics
- **Errors**: Sentry

### Database Maintenance

```bash
# Optimize database
npx prisma db push

# View database in GUI
npx prisma studio

# Generate migration from schema changes
npx prisma migrate dev --name your_migration_name
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Error**: `Can't reach database server at localhost:5432`

**Solution**:
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in .env
- Check firewall settings
- Ensure database exists

#### 2. JWT Authentication Errors

**Error**: `Unauthorized access`

**Solution**:
- Verify JWT_SECRET is set correctly
- Check token expiration
- Ensure Authorization header: `Bearer <token>`
- Clear old tokens and re-login

#### 3. CORS Errors

**Error**: `Access-Control-Allow-Origin header is missing`

**Solution**:
- Add frontend URL to ALLOWED_ORIGINS in .env
- Restart backend after changing .env
- Verify frontend is making requests with credentials: `credentials: 'include'`

#### 4. Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

#### 5. Docker Build Fails

**Error**: `failed to solve with frontend dockerfile.v0`

**Solution**:
```bash
# Clean Docker cache
docker system prune -a

# Rebuild with no cache
docker-compose build --no-cache
```

#### 6. Frontend Can't Connect to Backend

**Solution**:
- Check NEXT_PUBLIC_API_URL in frontend/.env.local
- Verify backend is running on correct port
- Check browser console for exact error
- Verify CORS configuration

### Getting Help

If you encounter issues:

1. Check logs: `npm run docker:logs`
2. Verify environment variables
3. Check database connectivity
4. Review SECURITY_AUDIT.md for known issues
5. Create GitHub issue with:
   - Error message
   - Steps to reproduce
   - Environment (OS, Node version, etc.)

---

## 📚 Additional Resources

### Documentation

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Documentation](https://docs.docker.com/)

### Scripts Reference

```bash
# Setup & Installation
npm run setup              # Initial project setup

# Development
npm run start:dev          # Start backend only
npm run dev:all           # Start backend + frontend

# Testing
npm run test              # Run unit tests
npm run test:cov          # Run tests with coverage
npm run test:e2e          # Run E2E tests

# Docker
npm run docker:up         # Start all containers
npm run docker:down       # Stop all containers
npm run docker:logs       # View logs
npm run docker:restart    # Restart containers
npm run docker:clean      # Remove all containers & volumes

# Database
npm run prisma:generate   # Generate Prisma Client
npm run prisma:migrate    # Run migrations
npm run prisma:studio     # Open database GUI
npm run prisma:seed       # Seed database

# Production
npm run build             # Build for production
npm run start:prod        # Start production server
```

---

## 🎯 Next Steps

After successful deployment:

1. **Test Everything**: Run through all user flows
2. **Monitor**: Set up monitoring and alerts
3. **Backup**: Verify automated backups are working
4. **Scale**: Configure auto-scaling based on load
5. **Optimize**: Run performance tests and optimize
6. **Security**: Schedule regular security audits
7. **Update**: Keep dependencies up to date

---

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Contact: support@yourdomain.com
- Documentation: docs.yourdomain.com

---

**Built with ❤️ using NestJS, Next.js, and Prisma**
