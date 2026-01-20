# ✅ Configuration finale vérifiée

## 📝 État actuel

### 1. axiosClient.js ✅

```javascript
const instance = axios.create({
    // Use relative URLs to go through Next.js rewrites
    withCredentials: true,
});
```

- ✅ Pas de baseURL
- ✅ withCredentials: true
- ✅ URLs relatives

### 2. next.config.mjs ✅

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

- ✅ Rewrites pour toutes les routes API
- ✅ BACKEND_URL configuré

### 3. API routes ✅

- ✅ Dossier `src/app/api` supprimé
- ✅ Plus d'API routes inutiles

---

## 🔄 Flux attendu

```
1. Login
   ├─> axios.post('/api/auth/login', credentials)
   ├─> Rewrite: /api/auth/login → https://stemadeleine-api.onrender.com/api/auth/login
   ├─> Backend: Set-Cookie: authToken=xxx
   └─> Cookie créé sur dashboard.stemadeleine.fr ✅

2. Requêtes suivantes
   ├─> axios.get('/api/users')
   ├─> Navigateur envoie: Cookie: authToken=xxx
   ├─> Rewrite: /api/users → https://stemadeleine-api.onrender.com/api/users
   └─> Backend reçoit le cookie ✅
```

---

## 🧪 Tests en local

### Test 1 : Vérifier que axios n'a pas de baseURL

```javascript
// Dans axiosClient.js
// ✅ DOIT contenir:
const instance = axios.create({
    withCredentials: true,
});

// ❌ NE DOIT PAS contenir:
// baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
```

### Test 2 : Vérifier les rewrites

```javascript
// Dans next.config.mjs
// ✅ DOIT contenir:
source: '/api/:path*',
    destination
:
`${BACKEND_URL}/api/:path*`,
```

### Test 3 : Vérifier qu'il n'y a plus d'API routes

```bash
ls -la src/app/api/
# Résultat attendu: "No such file or directory" ✅
```

### Test 4 : Redémarrer le serveur dev

```bash
cd frontend/backoffice
npm run dev
```

### Test 5 : Tester le login en local

```
1. http://localhost:3001/auth/login
2. Se connecter avec "dev login"
3. ✅ Cookie créé
4. ✅ Dashboard affiché
5. ✅ Pas de logout automatique
```

---

## 🚀 Déploiement

```bash
git add .
git commit -m "fix: Use relative URLs in axios, remove API routes"
git push origin main
```

---

## 📊 Checklist avant déploiement

- [x] ✅ axiosClient.js sans baseURL
- [x] ✅ next.config.mjs avec rewrites
- [x] ✅ API routes supprimées
- [x] ✅ Aucune erreur de compilation
- [ ] ⏳ Tester en local
- [ ] ⏳ Déployer sur Vercel
- [ ] ⏳ Tester en production

---

## 🎯 Résultat attendu en production

### Login

```
POST https://dashboard.stemadeleine.fr/api/auth/login
→ Rewrite → stemadeleine-api.onrender.com
→ Cookie créé ✅
→ 200 OK
```

### Dashboard

```
GET https://dashboard.stemadeleine.fr/api/users
→ Cookie envoyé ✅
→ Rewrite → stemadeleine-api.onrender.com
→ 200 OK avec données
```

### Navigation

```
Toutes les pages → Cookie envoyé automatiquement ✅
```

---

## 🔍 Si problème persiste

### Vérifier les logs Vercel

1. Vercel Dashboard
2. Deployments → Votre déploiement
3. Function Logs
4. Chercher "api/auth/login"

### Vérifier les cookies

```
DevTools → Application → Cookies → dashboard.stemadeleine.fr
→ authToken doit être présent après login
→ Domain: dashboard.stemadeleine.fr
→ HttpOnly: true
→ Secure: true
```

### Vérifier les requêtes

```
DevTools → Network → Filtrer "api"
→ Toutes les requêtes vers /api/* doivent inclure Cookie
```

---

**Configuration vérifiée et prête pour le déploiement !** ✅
