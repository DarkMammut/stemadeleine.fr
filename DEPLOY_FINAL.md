# 🚀 Guide de déploiement - Corrections finales

## 📝 Corrections effectuées

### 1. Routes API 404 en production

- ✅ Suppression des rewrites dans `next.config.mjs`
- ✅ Correction des handlers `[...path]` pour Next.js 15 (await params)

### 2. Boucle de déconnexion

- ✅ Routes API Next.js créées pour proxy vers backend
- ✅ Transmission correcte des cookies via `cookies()` de Next.js
- ✅ Intercepteur axios simplifié (pas de logout sur 401)
- ✅ ContactsContext ne fait pas d'appels si non connecté

### 3. Variables d'environnement

- ✅ Support de `NEXT_PUBLIC_BACKEND_URL` et `NEXT_PUBLIC_API_URL`

---

## 🧪 Tests en local (OBLIGATOIRE avant déploiement)

### 1. Démarrer les services

```bash
# Backend
cd backend/api
docker-compose up -d

# Backoffice
cd frontend/backoffice
npm run dev
```

### 2. Test automatique

```bash
# À la racine du projet
./test-api-routes.sh
```

**Résultat attendu :**

```
✓ Backend démarré
✓ Backoffice démarré
✓ POST /api/auth/login → 200 OK
✓ GET /api/stats/dashboard → 200 OK
✓ GET /api/contacts → 200 OK
✓ GET /api/users → 200 OK
✓ GET /api/campaigns → 200 OK
✓ POST /api/auth/logout → 200 OK
```

### 3. Test manuel dans le navigateur

1. Aller sur http://localhost:3001
2. Cliquer sur "Se connecter" ou aller directement sur `/auth/login`
3. Se connecter avec `admin@example.com` / `admin`
4. Vérifier que :
    - ✅ Redirection vers `/dashboard`
    - ✅ Dashboard se charge (KPIs, donations, campaigns)
    - ✅ Pas d'erreur 404 dans la console
    - ✅ Pas d'erreur 500 dans la console
    - ✅ Navigation vers `/contacts` fonctionne
    - ✅ Navigation vers `/users` fonctionne
    - ✅ Déconnexion fonctionne

---

## 🚀 Déploiement sur Vercel

### 1. Vérifier les fichiers modifiés

```bash
git status
```

**Fichiers modifiés :**

- `frontend/backoffice/next.config.mjs`
- `frontend/backoffice/src/app/api/[...path]/route.js`
- `frontend/backoffice/src/utils/axiosClient.js`
- `frontend/backoffice/src/contexts/ContactsContext.jsx`

**Fichiers créés :**

- `frontend/backoffice/src/app/api/auth/login/route.js`
- `frontend/backoffice/src/app/api/auth/logout/route.js`
- `frontend/backoffice/src/app/api/auth/check/route.js`
- `frontend/backoffice/src/app/api/[...path]/route.js`

### 2. Commit et push

```bash
git add .
git commit -m "fix: Routes API proxy + correction params Next.js 15 + suppression rewrites"
git push origin main
```

### 3. Vérifier les variables d'environnement sur Vercel

**Dashboard Vercel → stemadeleine-fr-backoffice → Settings → Environment Variables**

Vérifier que vous avez :

```
NEXT_PUBLIC_API_URL = https://stemadeleine-api.onrender.com
```

ou

```
NEXT_PUBLIC_BACKEND_URL = https://stemadeleine-api.onrender.com
```

> **Note :** Si vous modifiez les variables, cliquez sur "Redeploy" pour appliquer les changements.

### 4. Attendre le déploiement

Vercel va :

1. Détecter le push sur `main`
2. Lancer le build du backoffice
3. Déployer sur `dashboard.stemadeleine.fr`

**Durée :** ~2-3 minutes

---

## ✅ Vérification en production

### 1. Test de connexion

1. Aller sur https://dashboard.stemadeleine.fr
2. Cliquer sur "Se connecter"
3. Se connecter avec vos identifiants
4. ✅ Vérifier redirection vers `/dashboard`

### 2. Test du dashboard

1. Ouvrir DevTools (F12) → Onglet **Network**
2. Vérifier les requêtes :
    - ✅ POST `/api/auth/login` → 200
    - ✅ GET `/api/stats/dashboard` → 200
    - ✅ GET `/api/campaigns` → 200
    - ✅ GET `/api/stats/donations?year=2026` → 200

**Si 404 :**

- Vérifier que les fichiers ont bien été déployés
- Vérifier les logs Vercel
- Forcer un redéploiement

**Si 401 :**

- Vérifier que le cookie est présent (DevTools → Application → Cookies)
- Vérifier que `authToken` existe

**Si 500 :**

- Vérifier que le backend Render est démarré
- Vérifier la variable `NEXT_PUBLIC_API_URL` sur Vercel
- Vérifier les logs du backend Render

### 3. Test de navigation

1. Cliquer sur "Contacts" dans la sidebar
2. ✅ La liste des contacts s'affiche
3. Cliquer sur "Utilisateurs"
4. ✅ La liste des utilisateurs s'affiche
5. Cliquer sur "Actualités"
6. ✅ La liste des actualités s'affiche

### 4. Test de déconnexion

1. Cliquer sur "Déconnexion"
2. ✅ Redirection vers `/auth/login`
3. ✅ Impossible d'accéder à `/dashboard` (redirection automatique)

---

## 🔍 Débogage en production

### Logs Vercel

https://vercel.com/your-team/stemadeleine-fr-backoffice/logs

**Rechercher :**

- `[API Proxy]` pour voir les requêtes proxifiées
- Erreurs 404, 500, 401

### Logs Backend Render

https://dashboard.render.com/your-backend/logs

**Rechercher :**

- Requêtes entrantes `/api/auth/login`, `/api/contacts`, etc.
- Erreurs SQL, JWT, etc.

### Test direct du backend

```bash
# Test depuis votre machine
curl https://stemadeleine-api.onrender.com/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin"}'
```

**Résultat attendu :** 200 OK avec Set-Cookie

---

## 📊 Architecture finale

```
┌─────────────────────────────────────────────────────────────┐
│  User → dashboard.stemadeleine.fr                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Next.js Frontend (Vercel)                                  │
│  ├─ Pages: /dashboard, /contacts, /users                    │
│  └─ API Routes: /api/*                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Next.js API Routes (Proxy)                                 │
│  ├─ /api/auth/login → POST backend/api/auth/login           │
│  ├─ /api/auth/logout → POST backend/api/auth/logout         │
│  ├─ /api/contacts → GET backend/api/contacts                │
│  └─ /api/[...path] → * backend/api/*                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Spring Boot Backend (Render)                               │
│  https://stemadeleine-api.onrender.com                      │
│  ├─ Authentification (JWT + Cookies)                        │
│  ├─ API REST                                                │
│  └─ Base de données Supabase                                │
└─────────────────────────────────────────────────────────────┘
```

**Flux d'authentification :**

1. User → POST `/api/auth/login` (dashboard.stemadeleine.fr)
2. Next.js Route API → POST backend (stemadeleine-api.onrender.com)
3. Backend → Génère JWT + Set-Cookie
4. Next.js Route API → Forward Set-Cookie header
5. Browser → Reçoit cookie `authToken`
6. Toutes les requêtes suivantes incluent automatiquement le cookie ✅

---

## 🎉 Checklist finale

### Avant déploiement

- [ ] Tests locaux passent (./test-api-routes.sh)
- [ ] Interface fonctionne en local (http://localhost:3001)
- [ ] Pas d'erreur dans la console
- [ ] Connexion/déconnexion fonctionnent

### Après déploiement

- [ ] Build Vercel réussi (vert)
- [ ] https://dashboard.stemadeleine.fr accessible
- [ ] Connexion fonctionne
- [ ] Dashboard se charge sans erreur
- [ ] Pas de 404 dans DevTools Network
- [ ] Navigation fonctionne (contacts, users, etc.)
- [ ] Déconnexion fonctionne

---

## 📞 En cas de problème

1. **Vérifier les logs Vercel** pour voir les erreurs de build ou runtime
2. **Vérifier les logs Render** pour voir si le backend reçoit les requêtes
3. **Forcer un redéploiement** sur Vercel si le cache pose problème
4. **Vérifier les variables d'environnement** sur Vercel et Render

---

**Vous êtes prêt à déployer ! 🚀**
