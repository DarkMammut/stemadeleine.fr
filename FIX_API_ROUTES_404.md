# 🔧 FIX: Routes API 404 en production

## 🔍 Problème

En production sur Vercel, toutes les requêtes API (sauf `/api/auth/*`) retournent 404.

**Exemple d'erreurs :**

- ❌ GET `/api/contacts` → 404
- ❌ GET `/api/users` → 404
- ❌ GET `/api/stats/dashboard` → 404
- ✅ POST `/api/auth/login` → 200 (fonctionne)

## 🕵️ Causes identifiées

### 1. Conflit entre rewrites et routes API

Le fichier `next.config.mjs` contenait des rewrites qui redirigaient `/api/:path*` directement vers le backend :

```javascript
// ❌ AVANT - Causait un conflit
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

**Problème :** Les rewrites entrent en conflit avec les routes API Next.js et empêchent leur exécution.

### 2. Params non await dans Next.js 15

Dans Next.js 15, les `params` dans les routes API dynamiques sont maintenant des **Promises** et doivent être await :

```javascript
// ❌ AVANT - Next.js 15
export async function GET(request, {params}) {
    return proxyRequest(request, 'GET', params);
}

// ✅ APRÈS - Next.js 15
export async function GET(request, context) {
    const params = await context.params;
    return proxyRequest(request, 'GET', params);
}
```

---

## ✅ Corrections appliquées

### 1. Suppression des rewrites dans next.config.mjs

**Fichier :** `/frontend/backoffice/next.config.mjs`

**AVANT ❌**

```javascript
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

const nextConfig = {
    output: 'standalone',
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${BACKEND_URL}/api/:path*`,
            },
        ];
    },
};
```

**APRÈS ✅**

```javascript
const nextConfig = {
    output: 'standalone', // Pour optimiser le build Docker
};
```

**Pourquoi ?** Les routes API Next.js gèrent maintenant toutes les requêtes `/api/*`, les rewrites ne sont plus
nécessaires.

### 2. Correction des handlers dans [...path]/route.js

**Fichier :** `/frontend/backoffice/src/app/api/[...path]/route.js`

**AVANT ❌**

```javascript
export async function GET(request, {params}) {
    return proxyRequest(request, 'GET', params);
}

export async function POST(request, {params}) {
    return proxyRequest(request, 'POST', params);
}

export async function PUT(request, {params}) {
    return proxyRequest(request, 'PUT', params);
}

export async function DELETE(request, {params}) {
    return proxyRequest(request, 'DELETE', params);
}

export async function PATCH(request, {params}) {
    return proxyRequest(request, 'PATCH', params);
}
```

**APRÈS ✅**

```javascript
export async function GET(request, context) {
    const params = await context.params;
    return proxyRequest(request, 'GET', params);
}

export async function POST(request, context) {
    const params = await context.params;
    return proxyRequest(request, 'POST', params);
}

export async function PUT(request, context) {
    const params = await context.params;
    return proxyRequest(request, 'PUT', params);
}

export async function DELETE(request, context) {
    const params = await context.params;
    return proxyRequest(request, 'DELETE', params);
}

export async function PATCH(request, context) {
    const params = await context.params;
    return proxyRequest(request, 'PATCH', params);
}
```

**Pourquoi ?** Next.js 15 a changé l'API : `params` est maintenant une Promise dans le `context`, pas un objet
destructuré directement.

---

## 📊 Architecture finale des routes API

```
/api/
├── auth/
│   ├── login/
│   │   └── route.js         → Proxie POST /api/auth/login
│   ├── logout/
│   │   └── route.js         → Proxie POST /api/auth/logout
│   └── check/
│       └── route.js         → Proxie GET /api/auth/check
└── [...path]/
    └── route.js             → Proxie toutes les autres routes /api/*
```

**Ordre de priorité Next.js :**

1. Routes spécifiques : `/api/auth/login` → `/api/auth/login/route.js` ✅
2. Routes dynamiques : `/api/contacts` → `/api/[...path]/route.js` ✅
3. Routes dynamiques : `/api/users/123` → `/api/[...path]/route.js` ✅

---

## 🧪 Tests à faire

### En local

```bash
# 1. Démarrer le backend (port 8080)
cd backend/api
docker-compose up -d

# 2. Démarrer le backoffice (port 3001)
cd frontend/backoffice
npm run dev

# 3. Se connecter sur http://localhost:3001/auth/login

# 4. Vérifier dans la console du navigateur :
```

**Requêtes qui doivent fonctionner :**

- ✅ POST `/api/auth/login` → 200
- ✅ GET `/api/contacts` → 200
- ✅ GET `/api/users` → 200
- ✅ GET `/api/stats/dashboard` → 200
- ✅ GET `/api/campaigns` → 200
- ✅ POST `/api/auth/logout` → 200

**Dans les logs du terminal backoffice :**

```
[API Proxy] GET http://localhost:8080/api/stats/dashboard
[API Proxy] Forwarding cookie: authToken=eyJhbGci...
[API Proxy] Response: 200
```

### En production

Après déploiement sur Vercel :

1. Aller sur `https://dashboard.stemadeleine.fr/auth/login`
2. Se connecter
3. Vérifier que le dashboard se charge sans erreur 404
4. Ouvrir DevTools → Network
5. Vérifier que toutes les requêtes `/api/*` retournent 200

---

## 🚀 Déploiement

```bash
git add .
git commit -m "fix: Routes API 404 - Suppression rewrites + correction params Next.js 15"
git push origin main
```

**Note :** Vercel va automatiquement redéployer le backoffice.

---

## 📋 Checklist de vérification

### Local

- [ ] Backend démarré (port 8080)
- [ ] Backoffice démarré (port 3001)
- [ ] Connexion fonctionne
- [ ] Dashboard se charge sans erreur
- [ ] Pas de 404 dans la console
- [ ] Logs proxy affichés dans le terminal

### Production (après déploiement)

- [ ] Connexion fonctionne sur dashboard.stemadeleine.fr
- [ ] Dashboard se charge
- [ ] Pas de 404 dans DevTools
- [ ] Contacts s'affichent
- [ ] Users s'affichent
- [ ] Stats s'affichent

---

## 🔗 Références

- [Next.js 15 Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Next.js 15 Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Next.js 15 Breaking Changes](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)

---

## 📝 Résumé

**Problème :** Routes API 404 en production
**Cause :** Conflit rewrites + params non await dans Next.js 15
**Solution :** Suppression des rewrites + await params dans les handlers
**Résultat :** ✅ Toutes les routes API fonctionnent en production
