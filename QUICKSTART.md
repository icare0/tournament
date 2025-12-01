# ⚡ Quick Start Guide

Get the Tournament Platform running in **under 5 minutes**.

---

## 🚀 Fastest Way to Start

### Option 1: Docker (Recommended - Everything included)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd tournament

# 2. Copy environment file
cp .env.example .env

# 3. Start everything with Docker
npm run docker:up
```

**That's it!** Access your app:
- Frontend: http://localhost:3001
- Backend: http://localhost:3000/api/v1
- API Docs: http://localhost:3000/api

---

### Option 2: Local Development

**Prerequisites**: Node.js 20+, PostgreSQL

```bash
# 1. Clone and setup
git clone <your-repo-url>
cd tournament
npm run setup

# 2. Configure database
# Update .env with your PostgreSQL connection
nano .env  # or your preferred editor

# 3. Start development servers
npm run dev:all
```

**Access**:
- Frontend: http://localhost:3001
- Backend: http://localhost:3000/api/v1

---

## 🎮 First Steps

### 1. Create an Account

1. Go to http://localhost:3001
2. Click "Sign Up"
3. Fill in your details
4. You're ready!

### 2. Create Your First Tournament

1. Navigate to "Tournaments" → "Create Tournament"
2. Fill in tournament details
3. Set up bracket and prizes
4. Launch your tournament!

### 3. Manage Your Wallet

1. Go to "Wallet" in the navigation
2. Deposit funds (test mode)
3. View transaction history
4. Manage your balance

---

## 📖 Need More Help?

- **Full Deployment Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Security Audit**: See [SECURITY_AUDIT.md](./SECURITY_AUDIT.md)
- **API Documentation**: http://localhost:3000/api (when running)

---

## 🛠️ Available Commands

```bash
# Development
npm run setup              # Initial setup
npm run dev:all           # Start everything

# Docker
npm run docker:up         # Start with Docker
npm run docker:down       # Stop Docker
npm run docker:logs       # View logs

# Database
npm run prisma:studio     # Open database GUI
npm run prisma:migrate    # Run migrations

# Testing
npm run test              # Run tests
npm run test:cov          # Test coverage
```

---

## ⚠️ Important Notes

1. **Change JWT Secrets**: Generate new secrets for production:
   ```bash
   openssl rand -base64 32
   ```

2. **Update .env**: Never commit your .env file to Git

3. **Database**: Default uses PostgreSQL on port 5432

4. **Ports Used**:
   - Frontend: 3001
   - Backend: 3000
   - PostgreSQL: 5432
   - Redis: 6379

---

## 🆘 Troubleshooting

**Port already in use?**
```bash
# Change ports in .env
PORT=3002  # Backend
# Frontend: npm run dev -- -p 3003
```

**Can't connect to database?**
```bash
# Check PostgreSQL is running
pg_isready

# Or use Docker (includes PostgreSQL)
npm run docker:up
```

**Need to reset everything?**
```bash
# Clean Docker
npm run docker:clean

# Reset database
npx prisma migrate reset
```

---

## 📞 Get Help

- Review logs: `npm run docker:logs`
- Check [DEPLOYMENT.md](./DEPLOYMENT.md)
- Open an issue on GitHub

---

**Happy Tournament Hosting! 🎉**
