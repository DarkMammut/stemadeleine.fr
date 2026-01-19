# 🌐 Configuration Domaines Personnalisés - Stemadeleine.fr

## 📋 Architecture des domaines

```
┌─────────────────────────────────────────────────────────────┐
│                    stemadeleine.fr                           │
│              (Site principal - Frontend)                     │
│                                                              │
│  URL Render: stemadeleine-frontend.onrender.com             │
│  Custom Domain: stemadeleine.fr                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│               dashboard.stemadeleine.fr                      │
│                   (Backoffice Admin)                         │
│                                                              │
│  URL Render: stemadeleine-backoffice.onrender.com           │
│  Custom Domain: dashboard.stemadeleine.fr                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            stemadeleine-api.onrender.com                     │
│                    (API Backend)                             │
│                                                              │
│  Pas de custom domain nécessaire                            │
│  Accessible via rewrites Next.js                            │
└─────────────────────────────────────────────────────────────┘
```

## ✅ Configuration effectuée

### 1. CORS Backend mis à jour

**Fichier** : `backend/api/src/main/java/com/stemadeleine/api/config/CorsConfig.java`

```java
"https://stemadeleine.fr",        // Site principal
        "https://www.stemadeleine.fr",    // Avec www
        "https://dashboard.stemadeleine.fr" // Backoffice ✅ NOUVEAU
```

### 2. Cookie SameSite configuré

**Fichier** : `backend/api/src/main/java/com/stemadeleine/api/controller/AuthController.java`

- ✅ Production : `SameSite=None; Secure` (pour domaines croisés HTTPS)
- ✅ Développement : `SameSite=Lax` (pour localhost HTTP)

### 3. Rewrites Next.js (déjà configuré)

**Fichier** : `frontend/backoffice/next.config.mjs`

```javascript
async
rewrites()
{
    return [
        {
            source: '/api/:path*',
            destination: `${BACKEND_URL}/api/:path*`,
        },
    ];
}
```

✅ Cela permet au backoffice de faire des requêtes à `/api/*` qui sont réécrites vers le backend

## 🔐 Sécurité des cookies

### En production (dashboard.stemadeleine.fr)

Le cookie `authToken` est configuré avec :

- ✅ `HttpOnly` : Protège contre XSS (pas d'accès JavaScript)
- ✅ `Secure` : Uniquement HTTPS
- ✅ `SameSite=None` : Permet les requêtes cross-origin via rewrites
- ✅ `Path=/` : Disponible sur toutes les routes
- ✅ `Max-Age=86400` : Expire après 24h

### En développement (localhost:3001)

Le cookie `authToken` est configuré avec :

- ✅ `HttpOnly`
- ⚠️ `Secure=false` : Permet HTTP en local
- ✅ `SameSite=Lax` : Sécurisé pour le développement
- ✅ `Path=/`
- ✅ `Max-Age=86400`

## 📡 Flux d'authentification

### Avec rewrites Next.js (recommandé)

```
┌──────────────────────────────────────────────────────────┐
│  1. User → dashboard.stemadeleine.fr/auth/login          │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  2. POST /api/auth/login (rewritten by Next.js)         │
│     → https://stemadeleine-api.onrender.com/api/auth/login
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  3. Backend répond avec Set-Cookie                       │
│     authToken=xxx; HttpOnly; Secure; SameSite=None       │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  4. Cookie stocké sur dashboard.stemadeleine.fr          │
│     ✅ Fonctionne car requête vue comme "same-origin"    │
└──────────────────────────────────────────────────────────┘
```

## 🚀 Configuration DNS requise

### Sur votre registrar de domaine (OVH, Gandi, etc.)

#### 1. Site principal

```
Type: CNAME
Host: stemadeleine.fr (ou @)
Value: stemadeleine-frontend.onrender.com
TTL: 3600
```

#### 2. Backoffice

```
Type: CNAME
Host: dashboard
Value: stemadeleine-backoffice.onrender.com
TTL: 3600
```

### Sur Render Dashboard

#### Pour le frontend (stemadeleine-frontend)

1. Settings → Custom Domain
2. Add Custom Domain → `stemadeleine.fr`
3. Attendre la vérification DNS

#### Pour le backoffice (stemadeleine-backoffice)

1. Settings → Custom Domain
2. Add Custom Domain → `dashboard.stemadeleine.fr`
3. Attendre la vérification DNS

## ✅ Vérifications

### 1. CORS est correct

```bash
curl -H "Origin: https://dashboard.stemadeleine.fr" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS https://stemadeleine-api.onrender.com/api/auth/login -v
```

Devrait retourner :

```
Access-Control-Allow-Origin: https://dashboard.stemadeleine.fr
Access-Control-Allow-Credentials: true
```

### 2. Cookie fonctionne

1. Allez sur `https://dashboard.stemadeleine.fr/auth/login`
2. Connectez-vous
3. Ouvrez DevTools → Application → Cookies
4. Vérifiez que `authToken` existe avec :
    - ✅ `HttpOnly`
    - ✅ `Secure`
    - ✅ `SameSite=None`
    - ✅ `Domain=dashboard.stemadeleine.fr`

### 3. Middleware protège les routes

1. Sans être connecté, allez sur `https://dashboard.stemadeleine.fr/dashboard`
2. Devrait rediriger vers `/auth/login` ✅

## 🐛 Problèmes potentiels

### Erreur CORS

**Symptôme** : `Access to fetch has been blocked by CORS policy`

**Solution** :

1. Vérifiez que `dashboard.stemadeleine.fr` est dans CorsConfig.java ✅
2. Redéployez le backend sur Render
3. Videz le cache du navigateur

### Cookie non défini

**Symptôme** : Login réussit mais pas de cookie

**Causes possibles** :

- HTTPS non activé → Vérifiez SSL sur Render
- SameSite bloqué → Vérifiez que `Secure=true` en prod
- Domaine incorrect → Vérifiez les rewrites Next.js

**Solution** : Les rewrites Next.js résolvent ce problème automatiquement

### Redirect loop infini

**Symptôme** : Boucle entre login et dashboard

**Solution** :

- Vérifiez que le middleware lit correctement le cookie
- Vérifiez les logs Render du backoffice
- Vérifiez que le cookie a le bon `Path=/`

## 📚 Fichiers modifiés

### Backend

- ✅ `backend/api/src/main/java/com/stemadeleine/api/config/CorsConfig.java`
- ✅ `backend/api/src/main/java/com/stemadeleine/api/controller/AuthController.java`
- ✅ `backend/api/src/main/resources/application.properties`

### Frontend Backoffice

- ✅ `frontend/backoffice/src/middleware.js`
- ✅ `frontend/backoffice/next.config.mjs`

### Configuration

- ✅ `render.yaml`

## 🎯 Résumé

| Configuration                       | Status |
|-------------------------------------|--------|
| CORS pour dashboard.stemadeleine.fr | ✅      |
| Cookie SameSite=None en prod        | ✅      |
| Cookie Secure=true en prod          | ✅      |
| Rewrites Next.js configurés         | ✅      |
| Middleware de protection            | ✅      |
| Variables d'environnement Render    | ✅      |

**Tout est prêt pour la production avec vos domaines personnalisés !** 🎉

## 🚀 Déploiement

```bash
git add .
git commit -m "Fix: Configuration domaines personnalisés + CORS dashboard.stemadeleine.fr"
git push origin main
```

Render va automatiquement redéployer le backend avec :

- ✅ CORS mis à jour
- ✅ Cookie SameSite configuré
- ✅ Support des domaines personnalisés
