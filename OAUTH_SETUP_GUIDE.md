# 🔐 Guide Complet OAuth - Google & Discord

## ✅ Ce qui a été implémenté

### Backend (NestJS)
- ✅ Dépendances installées (`passport-google-oauth20`, `passport-discord`)
- ✅ Schéma Prisma mis à jour (champs OAuth ajoutés)
- ✅ Strategies OAuth créées (`google.strategy.ts`, `discord.strategy.ts`)
- ✅ Service d'authentification étendu (`loginOrRegisterOAuth`)
- ✅ Routes OAuth ajoutées au controller
- ✅ Module auth configuré avec les strategies

### Frontend (Next.js)
- ✅ Boutons OAuth dans login/register
- ✅ Page de callback créée (`/auth/callback`)
- ✅ Gestion des tokens OAuth

---

## 🚀 Étapes pour finaliser OAuth

### 1. Lancer la migration Prisma

La migration Prisma doit être appliquée pour ajouter les champs OAuth à la base de données.

```bash
# Dans le dossier racine du projet
npx prisma generate
npx prisma migrate dev --name add_oauth_support
```

**Changements de schéma :**
- `passwordHash` est maintenant **optionnel** (nullable)
- Nouveaux champs : `oauthProvider`, `oauthProviderId`
- Index unique sur `[oauthProvider, oauthProviderId]`

---

### 2. Configurer Google OAuth

#### A. Créer un projet Google Cloud

1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un nouveau projet ou sélectionner un existant
3. Activer l'API **Google+ API** ou **Google People API**

#### B. Configurer l'écran de consentement OAuth

1. Dans le menu latéral : **APIs & Services** → **OAuth consent screen**
2. Sélectionner **External** (ou Internal si G Suite)
3. Remplir les informations :
   - **App name** : Bloom Tournament
   - **User support email** : votre email
   - **Developer contact** : votre email
4. Ajouter les scopes :
   - `userinfo.email`
   - `userinfo.profile`
5. Sauvegarder

#### C. Créer les credentials OAuth 2.0

1. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
2. Type d'application : **Web application**
3. Nom : `Bloom OAuth Client`
4. **Authorized JavaScript origins** :
   ```
   http://localhost:3001
   http://localhost:3000
   ```
5. **Authorized redirect URIs** :
   ```
   http://localhost:3001/auth/google/callback
   ```
   En production, ajouter aussi :
   ```
   https://votredomaine.com/auth/google/callback
   ```
6. Cliquer **Create**
7. **COPIER** le `Client ID` et `Client Secret`

#### D. Ajouter dans le .env

```env
GOOGLE_CLIENT_ID=votre_client_id_ici
GOOGLE_CLIENT_SECRET=votre_client_secret_ici
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
```

---

### 3. Configurer Discord OAuth

#### A. Créer une application Discord

1. Aller sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Cliquer **New Application**
3. Nom de l'application : `Bloom Tournament`
4. Accepter les termes et créer

#### B. Configurer OAuth2

1. Dans le menu latéral : **OAuth2** → **General**
2. Copier le **CLIENT ID**
3. Copier le **CLIENT SECRET** (cliquer sur "Reset Secret" si nécessaire)
4. Dans **Redirects**, ajouter :
   ```
   http://localhost:3001/auth/discord/callback
   ```
   En production :
   ```
   https://votredomaine.com/auth/discord/callback
   ```
5. **Sauvegarder les changements**

#### C. Configurer les scopes OAuth2

1. Dans **OAuth2** → **URL Generator**
2. Sélectionner les scopes :
   - `identify`
   - `email`
3. Copier l'URL générée (pour tests manuels si besoin)

#### D. Ajouter dans le .env

```env
DISCORD_CLIENT_ID=votre_client_id_discord_ici
DISCORD_CLIENT_SECRET=votre_client_secret_discord_ici
DISCORD_CALLBACK_URL=http://localhost:3001/auth/discord/callback
```

---

### 4. Vérifier les variables d'environnement

Votre fichier `.env` (backend) doit contenir :

```env
# Database
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."

# Frontend
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Discord OAuth
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
DISCORD_CALLBACK_URL=http://localhost:3001/auth/discord/callback
```

---

### 5. Tester l'authentification OAuth

#### A. Démarrer les services

```bash
# Terminal 1 - Backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### B. Tester Google OAuth

1. Aller sur `http://localhost:3000/login`
2. Cliquer sur **Continuer avec Google**
3. Sélectionner un compte Google
4. Accepter les permissions
5. Vous devriez être redirigé vers `/dashboard`
6. Vérifier dans la DB que le user a été créé avec :
   - `oauthProvider: 'google'`
   - `oauthProviderId: '...'`
   - `passwordHash: null`

#### C. Tester Discord OAuth

1. Aller sur `http://localhost:3000/login`
2. Cliquer sur **Continuer avec Discord**
3. Autoriser l'application
4. Vérifier la redirection et la création du user

---

## 🔍 Vérification de la compatibilité

### Gestion des cas edge

L'implémentation gère automatiquement :

#### 1. **Nouveau user OAuth**
- Crée un nouveau user avec `oauthProvider` et `oauthProviderId`
- Génère un username unique (email.split('@')[0] + random si collision)
- Crée automatiquement un wallet
- `emailVerified = true` (email déjà vérifié par le provider)
- `passwordHash = null`

#### 2. **User existant avec même email**
- Si un user a déjà ce email (inscription classique) :
  - **Lie** le compte OAuth au compte existant
  - Met à jour `oauthProvider` et `oauthProviderId`
  - Met à jour avatar/nom si manquants
  - Permet login par email/password **OU** OAuth

#### 3. **User OAuth existant**
- Si déjà connecté une fois avec ce provider :
  - Login direct
  - Met à jour `lastLoginAt`

#### 4. **Username unique**
- Si collision de username, ajoute un nombre aléatoire
- Exemple : `john` → `john_4582`

---

## ⚠️ Points de vigilance

### 1. CORS
Vérifier que le backend autorise le frontend :
```typescript
// main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

### 2. Cookies vs LocalStorage
Actuellement les tokens sont stockés dans `localStorage`.
Pour plus de sécurité, envisager d'utiliser des **httpOnly cookies**.

### 3. Refresh tokens
L'implémentation renvoie aussi le `refreshToken`.
Le frontend devrait implémenter la logique de rafraîchissement automatique.

### 4. Production URLs
En production, mettre à jour :
- `.env` : URLs de callback en HTTPS
- Google Cloud Console : Ajouter les URLs de production
- Discord Developer Portal : Ajouter les URLs de production

---

## 🐛 Debugging

### Erreur "Invalid redirect URI"
- Vérifier que l'URL de callback est **exactement** la même dans :
  - `.env` (GOOGLE_CALLBACK_URL / DISCORD_CALLBACK_URL)
  - Google Cloud Console / Discord Developer Portal
  - Pas de trailing slash !

### Erreur "User not found" après OAuth
- Vérifier que la migration Prisma a été appliquée
- Vérifier que `passwordHash` est bien nullable
- Checker les logs backend pour voir les erreurs Prisma

### Les tokens ne sont pas stockés
- Vérifier que `/auth/callback` reçoit bien `?token=...&refresh=...`
- Checker la console du navigateur pour les erreurs
- Vérifier que `localStorage` est accessible

### "Cannot read property 'email' of undefined"
- Vérifier que les strategies retournent bien un objet user
- Checker que les scopes OAuth incluent `email`

---

## 📊 Structure des données

### User avec OAuth
```json
{
  "id": "uuid",
  "email": "user@gmail.com",
  "username": "user_1234",
  "passwordHash": null,
  "firstName": "John",
  "lastName": "Doe",
  "avatar": "https://...",
  "oauthProvider": "google",
  "oauthProviderId": "103847562910384756",
  "emailVerified": true,
  "role": "PLAYER",
  "status": "ACTIVE"
}
```

### User hybride (email + OAuth)
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "john",
  "passwordHash": "$2b$10$...",
  "oauthProvider": "google",
  "oauthProviderId": "103847562910384756",
  // Peut login par email/password OU Google
}
```

---

## 🎯 Checklist finale

Avant de déployer en production :

- [ ] Migration Prisma appliquée
- [ ] Variables d'environnement configurées
- [ ] Google Cloud Console configuré (prod URLs)
- [ ] Discord Developer Portal configuré (prod URLs)
- [ ] Tests OAuth Google réussis
- [ ] Tests OAuth Discord réussis
- [ ] Test création nouveau user
- [ ] Test liaison compte existant
- [ ] Test login user existant OAuth
- [ ] Vérification création wallet automatique
- [ ] Tokens correctement stockés
- [ ] Redirection vers dashboard fonctionne
- [ ] Gestion des erreurs (callback avec error)
- [ ] CORS configuré correctement
- [ ] URLs de production dans .env

---

## 📝 Commandes utiles

```bash
# Vérifier la DB après OAuth
npx prisma studio

# Voir les users créés
SELECT email, username, "oauthProvider", "emailVerified" FROM users;

# Compter les users OAuth vs classiques
SELECT
  COUNT(*) FILTER (WHERE "oauthProvider" IS NOT NULL) as oauth_users,
  COUNT(*) FILTER (WHERE "passwordHash" IS NOT NULL) as classic_users,
  COUNT(*) as total
FROM users;

# Nettoyer les tokens expirés (si implémenté)
DELETE FROM tokens WHERE "expiresAt" < NOW();
```

---

## 🚀 Prochaines améliorations (optionnel)

- [ ] Ajouter GitHub OAuth
- [ ] Ajouter Twitter OAuth
- [ ] Implémenter la liaison de comptes multiples
- [ ] Page de gestion des connexions OAuth dans settings
- [ ] Possibilité de délier un compte OAuth
- [ ] Email de notification lors de la première connexion OAuth
- [ ] 2FA pour les comptes hybrides
- [ ] Audit log des connexions OAuth

---

**Bon setup ! 🎊**
