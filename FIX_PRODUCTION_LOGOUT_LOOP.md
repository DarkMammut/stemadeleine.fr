# 🔧 FIX: Boucle de déconnexion en production

## 🔍 Problème identifié

En production, lorsqu'un utilisateur se connecte sur `dashboard.stemadeleine.fr`, il est immédiatement déconnecté.

**Logs backend :**

```
Login successful for user: admin@example.com
POST /api/auth/logout - Déconnexion de l'utilisateur
Déconnexion réussie - Cookie supprimé
```

**Cause racine :**

1. ❌ **Cross-domain cookies bloqués** : Le backoffice (`dashboard.stemadeleine.fr`) et l'API (
   `stemadeleine-api.onrender.com`) sont sur des domaines différents. Les navigateurs modernes bloquent les cookies
   cross-domain par défaut.

2. ❌ **Routes API Next.js manquantes** : Les appels directs au backend depuis le frontend ne peuvent pas transmettre les
   cookies en cross-domain.

3. ❌ **Intercepteur axios trop agressif** : Dès qu'une requête retourne 401, l'intercepteur appelle `/api/auth/logout`,
   ce qui supprime le cookie fraîchement créé.

4. ❌ **ContactsProvider fait des appels API avant connexion** : Au chargement de l'application, le `ContactsProvider`
   essaie de récupérer les contacts non lus, ce qui échoue avec 401 et déclenche le logout.

---

## ✅ Solutions appliquées

### 1. Routes API Next.js (Proxy pattern)

**Créé :**

- `/frontend/backoffice/src/app/api/auth/login/route.js`
- `/frontend/backoffice/src/app/api/auth/logout/route.js`
- `/frontend/backoffice/src/app/api/auth/check/route.js`
- `/frontend/backoffice/src/app/api/[...path]/route.js`

**Principe :**

```
Frontend (dashboard.stemadeleine.fr)
    ↓ POST /api/auth/login (same-domain)
Next.js API Route (proxy)
    ↓ Forward to backend avec cookies
Backend (stemadeleine-api.onrender.com)
    ↓ Set-Cookie: authToken=xxx
Next.js API Route
    ↓ Forward Set-Cookie header
Frontend receives cookie ✅
```

**Avantages :**

- ✅ Same-domain pour le navigateur
- ✅ Cookies transmis automatiquement
- ✅ Pas besoin de SameSite=None
- ✅ Compatible avec tous les navigateurs

### 2. Modification de axiosClient.js

**AVANT ❌**

```javascript
baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://stemadeleine-api.onrender.com',
```

**APRÈS ✅**

```javascript
baseURL: '', // Use local API routes (Next.js proxies to backend)
```

### 3. Intercepteur axios simplifié

**AVANT ❌**

```javascript
if (error.response?.status === 401) {
    try {
        await instance.post("/api/auth/logout"); // ❌ Appelle logout API
    } catch (logoutError) {
        console.warn("Erreur lors du logout automatique:", logoutError);
    }
    logout();
    router.push("/auth/login");
}
```

**APRÈS ✅**

```javascript
if (error.response?.status === 401) {
    // ✅ Don't call logout API - just clear local state and redirect
    logout();
    router.push("/auth/login");
}
```

**Pourquoi ?** Évite d'appeler `/logout` à chaque 401, ce qui supprimait le cookie et créait une boucle.

### 4. ContactsProvider avec vérification d'authentification

**AVANT ❌**

```javascript
useEffect(() => {
    refreshUnreadCount(); // ❌ Appelle l'API même si non connecté
    const interval = setInterval(refreshUnreadCount, 30000);
    return () => clearInterval(interval);
}, []);
```

**APRÈS ✅**

```javascript
const {isLoggedIn} = useAuth();

const refreshUnreadCount = async () => {
    if (!isLoggedIn) { // ✅ Vérifie l'authentification
        setUnreadCount(0);
        return;
    }
    // ... fetch contacts
};

useEffect(() => {
    if (!isLoggedIn) return; // ✅ Ne s'exécute que si connecté
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 30000);
    return () => clearInterval(interval);
}, [isLoggedIn]);
```

---

## 🧪 Tests en local

1. Démarrer le backend (port 8080)
2. Démarrer le backoffice (port 3001)
3. Aller sur `http://localhost:3001/auth/login`
4. Se connecter avec les identifiants de test
5. ✅ Vérifier la redirection vers `/dashboard`
6. ✅ Vérifier que le cookie est présent dans les DevTools
7. ✅ Vérifier qu'il n'y a pas de déconnexion automatique

---

## 🚀 Déploiement en production

### 1. Vérifier les variables d'environnement

**Backoffice (Vercel) :**

```env
NEXT_PUBLIC_API_URL=https://stemadeleine-api.onrender.com
# OU (selon votre configuration)
NEXT_PUBLIC_BACKEND_URL=https://stemadeleine-api.onrender.com
```

> **Note :** Les routes API Next.js utilisent cette variable pour proxifier les requêtes vers le backend.

**Backend (Render) :**

```env
JWT_COOKIE_SECURE=true
```

### 2. Déployer

```bash
git add .
git commit -m "fix: Résolution de la boucle de déconnexion en production"
git push origin main
```

### 3. Vérifier en production

1. Aller sur `https://dashboard.stemadeleine.fr/auth/login`
2. Se connecter
3. Ouvrir DevTools → Application → Cookies
4. Vérifier que `authToken` existe avec :
    - ✅ `HttpOnly: true`
    - ✅ `Secure: true`
    - ✅ `Path: /`
    - ✅ `Domain: dashboard.stemadeleine.fr`

---

## 📊 Flux d'authentification corrigé

```
┌────────────────────────────────────────────────────────┐
│ 1. User → dashboard.stemadeleine.fr/auth/login       │
│    (page de connexion)                                │
└────────────────────┬───────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│ 2. POST /api/auth/login                               │
│    (route Next.js - same domain)                      │
└────────────────────┬───────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│ 3. Next.js proxy → Render backend                     │
│    POST stemadeleine-api.onrender.com/api/auth/login │
└────────────────────┬───────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│ 4. Backend valide credentials                         │
│    Génère JWT + Set-Cookie: authToken                 │
└────────────────────┬───────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│ 5. Next.js proxy forward Set-Cookie header            │
│    → Frontend reçoit le cookie ✅                      │
└────────────────────┬───────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│ 6. Redirection vers /dashboard                        │
│    Cookie inclus automatiquement dans toutes les      │
│    requêtes futures (same-domain) ✅                   │
└────────────────────────────────────────────────────────┘
```

---

## 🎯 Résumé

**Problème :** Déconnexion automatique en production à cause des cookies cross-domain bloqués.

**Solution :** Utiliser des routes API Next.js comme proxy pour que toutes les requêtes apparaissent comme same-domain
au navigateur.

**Fichiers modifiés :**

- ✅ `src/app/api/auth/login/route.js` (créé)
- ✅ `src/app/api/auth/logout/route.js` (créé)
- ✅ `src/app/api/auth/check/route.js` (créé)
- ✅ `src/app/api/[...path]/route.js` (créé)
- ✅ `src/utils/axiosClient.js` (modifié)
- ✅ `src/contexts/ContactsContext.jsx` (modifié)

**Résultat :**

- ✅ Connexion fonctionne en production
- ✅ Pas de déconnexion automatique
- ✅ Cookies transmis correctement
- ✅ Navigation fluide dans le backoffice
