# 🪟 Guide Windows - Tournament Platform

Guide spécifique pour Windows PowerShell/CMD.

---

## ⚡ Démarrage Rapide (Windows)

### Option 1: Docker (Recommandé - Le plus simple)

```powershell
# 1. Copier l'environnement
Copy-Item .env.example .env

# 2. Éditer .env avec vos secrets JWT
# Générer des secrets:
# Utilisez un générateur en ligne ou Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 3. Démarrer avec Docker
npm run docker:up

# ✅ Votre app tourne !
# Frontend: http://localhost:3001
# Backend: http://localhost:3000/api/v1
# API Docs: http://localhost:3000/api
```

### Option 2: Development Local (Sans Docker)

```powershell
# 1. Setup initial
npm run setup:windows

# 2. Configurer PostgreSQL local
# Télécharger: https://www.postgresql.org/download/windows/
# Créer une database: tournament_dev

# 3. Mettre à jour .env avec vos credentials PostgreSQL
# DATABASE_URL="postgresql://postgres:password@localhost:5432/tournament_dev"

# 4. Générer Prisma Client
npx prisma generate

# 5. Lancer les migrations
npx prisma migrate dev

# 6. Démarrer le backend (Terminal 1)
npm run dev:backend

# 7. Démarrer le frontend (Terminal 2 - nouveau PowerShell)
npm run dev:frontend
```

---

## 🐳 Commandes Docker (Windows)

Toutes ces commandes fonctionnent directement dans PowerShell:

```powershell
# Démarrer tous les services
npm run docker:up

# Arrêter tous les services
npm run docker:down

# Voir les logs en temps réel
npm run docker:logs

# Redémarrer les services
npm run docker:restart

# Nettoyer complètement (⚠️ supprime les volumes!)
npm run docker:clean
```

**Alternative directe avec docker-compose:**

```powershell
docker-compose up -d          # Démarrer
docker-compose down           # Arrêter
docker-compose logs -f        # Logs
docker-compose ps             # Status
```

---

## 📦 Installation des Prérequis (Windows)

### 1. Node.js

**Télécharger et installer:**
- Site: https://nodejs.org/
- Version recommandée: LTS (v20+)
- Installer avec npm inclus

**Vérifier l'installation:**
```powershell
node --version    # Doit afficher v20+
npm --version     # Doit afficher v9+
```

### 2. Docker Desktop (Pour option Docker)

**Télécharger et installer:**
- Site: https://www.docker.com/products/docker-desktop
- Version: Latest stable
- Nécessite WSL2 sur Windows 10/11

**Vérifier l'installation:**
```powershell
docker --version
docker-compose --version
```

### 3. PostgreSQL (Pour option locale sans Docker)

**Option A: Installer PostgreSQL**
- Site: https://www.postgresql.org/download/windows/
- Ou: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
- Version: 14+

**Option B: Utiliser Docker (Recommandé)**
```powershell
# PostgreSQL via Docker
docker run --name tournament-postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=tournament_dev `
  -p 5432:5432 `
  -d postgres:16-alpine
```

---

## 🔧 Commandes NPM (Windows)

### Development

```powershell
# Setup complet
npm run setup:windows

# Démarrer backend uniquement
npm run dev:backend

# Démarrer frontend uniquement (dans un nouveau terminal)
npm run dev:frontend

# Ou les deux manuellement:
# Terminal 1:
npm run start:dev

# Terminal 2:
cd frontend
npm run dev
```

### Database

```powershell
# Générer Prisma Client
npx prisma generate

# Créer/appliquer migrations
npx prisma migrate dev

# Ouvrir l'interface Prisma Studio
npx prisma studio

# Reset la database (⚠️ perte de données!)
npx prisma migrate reset
```

### Tests

```powershell
# Lancer les tests
npm run test

# Tests avec coverage
npm run test:cov

# Tests en mode watch
npm run test:watch
```

### Build

```powershell
# Build backend
npm run build

# Build frontend
cd frontend
npm run build
cd ..

# Lancer en production
npm run start:prod
```

---

## 🔐 Générer des Secrets JWT (Windows)

### Méthode 1: Avec Node.js

```powershell
# Générer un secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Générer deux secrets (JWT_SECRET et JWT_REFRESH_SECRET)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
```

### Méthode 2: En ligne

Utilisez un générateur comme:
- https://generate-secret.vercel.app/32
- https://randomkeygen.com/

**Copiez les secrets dans votre fichier .env:**
```env
JWT_SECRET="votre-secret-genere-ici"
JWT_REFRESH_SECRET="votre-autre-secret-genere-ici"
```

---

## 📁 Éditer les Fichiers (Windows)

### Éditeurs recommandés:

1. **Visual Studio Code** (Recommandé)
   - Télécharger: https://code.visualstudio.com/
   - Commande: `code .` (ouvre le projet)

2. **Notepad++**
   - Télécharger: https://notepad-plus-plus.org/

3. **Notepad** (Windows intégré)
   - Commande: `notepad .env`

### Éditer .env rapidement:

```powershell
# Ouvrir avec VS Code
code .env

# Ou avec Notepad
notepad .env
```

---

## 🐛 Troubleshooting Windows

### Erreur: "Scripts désactivés sur ce système"

**Problème:** PowerShell bloque l'exécution des scripts

**Solution:**
```powershell
# Autoriser l'exécution (en tant qu'admin)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Ou exécuter directement:
powershell -ExecutionPolicy Bypass -File .\scripts\setup.ps1
```

### Erreur: "Port déjà utilisé"

**Problème:** Les ports 3000 ou 3001 sont déjà utilisés

**Solution:**
```powershell
# Trouver le processus
netstat -ano | findstr :3000

# Tuer le processus (remplacer PID par le numéro affiché)
taskkill /PID <PID> /F

# Ou changer le port dans .env
PORT=3002
```

### Erreur: "Docker n'est pas reconnu"

**Problème:** Docker n'est pas installé ou pas dans le PATH

**Solutions:**
1. Installer Docker Desktop: https://www.docker.com/products/docker-desktop
2. Redémarrer PowerShell après installation
3. Vérifier que Docker Desktop est démarré

### Erreur: "npx n'est pas reconnu"

**Problème:** Node.js/npm mal installé

**Solution:**
1. Réinstaller Node.js depuis https://nodejs.org/
2. Redémarrer PowerShell
3. Vérifier: `node --version` et `npm --version`

### Problème: Connexion à PostgreSQL échoue

**Solutions:**
```powershell
# Vérifier que PostgreSQL est démarré
Get-Service -Name postgresql*

# Ou utiliser Docker:
docker ps  # Vérifier que postgres tourne

# Tester la connexion
psql -U postgres -h localhost -p 5432
```

### Erreur: "Cannot find module"

**Solution:**
```powershell
# Supprimer node_modules et réinstaller
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Pour le frontend aussi
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
cd ..
```

---

## 🔥 Raccourcis Utiles (Windows)

### PowerShell Terminal

```powershell
# Créer plusieurs terminaux dans VS Code
# Ctrl + Shift + `  (backtick)

# Ou utiliser Windows Terminal
# Télécharger depuis Microsoft Store
```

### Variables d'environnement

```powershell
# Voir une variable
$env:NODE_ENV

# Définir une variable (temporaire)
$env:NODE_ENV = "development"

# Définir pour la session
[System.Environment]::SetEnvironmentVariable('NODE_ENV', 'development', 'User')
```

---

## 📊 Commandes de Monitoring

### Vérifier les processus

```powershell
# Backend Node.js
Get-Process -Name node

# Docker containers
docker ps

# Logs Docker en temps réel
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Vérifier les ports

```powershell
# Voir tous les ports utilisés
netstat -ano

# Voir un port spécifique
netstat -ano | findstr :3000
```

---

## 🎯 Workflow Recommandé (Windows)

### Avec Docker (Plus simple):

```powershell
# 1. Une seule fois
Copy-Item .env.example .env
# Éditer .env avec vos secrets

# 2. À chaque démarrage
npm run docker:up

# 3. Pour voir les logs
npm run docker:logs

# 4. Pour arrêter
npm run docker:down
```

### Sans Docker (Plus flexible):

```powershell
# Terminal 1 - Backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Database (si besoin)
npx prisma studio
```

---

## 📚 Ressources Additionnelles

- **PowerShell Guide**: https://docs.microsoft.com/en-us/powershell/
- **Docker Desktop**: https://docs.docker.com/desktop/windows/
- **VS Code**: https://code.visualstudio.com/docs
- **Node.js Windows**: https://nodejs.org/en/download/

---

## 💡 Astuces Windows

1. **Utiliser Windows Terminal** au lieu de PowerShell classique
2. **Installer Git Bash** pour exécuter les scripts .sh directement
3. **Activer WSL2** pour une meilleure compatibilité Docker
4. **Utiliser VS Code** avec l'extension Remote-WSL

---

**Besoin d'aide?** Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour plus de détails.
