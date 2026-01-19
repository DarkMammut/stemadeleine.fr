# ✅ Configuration Complète - Dashboard.stemadeleine.fr

## 🎯 Résumé

Tous les problèmes ont été résolus et la configuration pour les domaines personnalisés est prête !

## 🌐 Architecture des domaines

| Service            | URL Custom Domain           | URL Plateforme                          | Hébergement  |
|--------------------|-----------------------------|-----------------------------------------|--------------|
| **Site principal** | `stemadeleine.fr`           | `stemadeleine-fr.vercel.app`            | **Vercel** ⭐ |
| **Backoffice**     | `dashboard.stemadeleine.fr` | `stemadeleine-fr-backoffice.vercel.app` | **Vercel** ⭐ |
| **API Backend**    | (via rewrites)              | `stemadeleine-api.onrender.com`         | **Render**   |

## ✅ Modifications effectuées

### 1. CORS mis à jour pour dashboard.stemadeleine.fr et Vercel

**Fichier** : `backend/api/src/main/java/com/stemadeleine/api/config/CorsConfig.java`

- ✅ Changé `backoffice.stemadeleine.fr` → `dashboard.stemadeleine.fr`
- ✅ Ajouté `https://stemadeleine-fr-backoffice.vercel.app` (domaine Vercel backoffice)

### 2. Cookie SameSite configuré

**Fichier** : `backend/api/src/main/java/com/stemadeleine/api/controller/AuthController.java`

- ✅ Production : `SameSite=None; Secure` (pour domaines croisés HTTPS)
- ✅ Développement : `SameSite=Lax` (pour localhost)
- ✅ Méthode `addAuthCookie()` créée pour gérer les cookies

### 3. Protection des routes

**Fichier** : `frontend/backoffice/src/middleware.js`

- ✅ Middleware Next.js créé
- ✅ Vérifie le cookie `authToken`
- ✅ Redirige vers `/auth/login` si non authentifié

### 4. Rewrites Next.js (déjà configuré)

**Fichier** : `frontend/backoffice/next.config.mjs`

- ✅ Requêtes `/api/*` réécrites vers le backend
- ✅ Permet la transparence des domaines

## 🔐 Configuration des cookies

### En production (HTTPS)

```
authToken=xxx;
Path=/;
Max-Age=86400;
HttpOnly;
Secure;
SameSite=None
```

### En développement (HTTP)

```
authToken=xxx;
Path=/;
Max-Age=86400;
HttpOnly;
SameSite=Lax
```

## 🚀 Déploiement

```bash
git add .
git commit -m "Fix: Configuration domaines personnalisés + CORS + SameSite cookie"
git push origin main
```

## 📋 Configuration DNS requise

Sur votre registrar de domaine (OVH, Gandi, etc.) :

### Pour le site principal (Vercel)

```
Type: CNAME
Host: @ (ou stemadeleine.fr)
Value: cname.vercel-dns.com
```

### Pour le backoffice (Vercel)

```
Type: CNAME
Host: dashboard
Value: cname.vercel-dns.com
```

### Sur Vercel Dashboard

1. **Pour le site principal** :
    - Project `stemadeleine-fr` → Settings → Domains
    - Add : `stemadeleine.fr`

2. **Pour le backoffice** :
    - Project `stemadeleine-fr-backoffice` → Settings → Domains
    - Add : `dashboard.stemadeleine.fr`

**Note** : Pas besoin de configurer de custom domain sur Render. Seul le backend API est sur Render.

## ✅ Tests à effectuer

### 1. Sans authentification

```
URL: https://dashboard.stemadeleine.fr/dashboard
Résultat attendu: Redirect → /auth/login ✅
```

### 2. Page de login

```
URL: https://dashboard.stemadeleine.fr/auth/login
Résultat attendu: Formulaire de connexion affiché ✅
```

### 3. Connexion

```
Action: Se connecter avec email/password
Résultat attendu: 
  - Redirect → /dashboard ✅
  - Cookie authToken créé ✅
```

### 4. Vérifier le cookie

```
DevTools → Application → Cookies → dashboard.stemadeleine.fr
Vérifier:
  - Name: authToken ✅
  - HttpOnly: true ✅
  - Secure: true ✅
  - SameSite: None ✅
  - Path: / ✅
```

### 5. Déjà connecté

```
URL: https://dashboard.stemadeleine.fr/auth/login (avec cookie)
Résultat attendu: Redirect → /dashboard ✅
```

## 🔍 Vérification CORS

Testez depuis la console du navigateur sur `dashboard.stemadeleine.fr` :

```javascript
fetch('https://stemadeleine-api.onrender.com/api/public/health', {
    method: 'GET',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json'
    }
})
    .then(r => r.json())
    .then(console.log)
    .catch(console.error)
```

Résultat attendu : Pas d'erreur CORS ✅

## 📚 Documentation créée

| Fichier                          | Description                         |
|----------------------------------|-------------------------------------|
| `CUSTOM_DOMAINS_CONFIG.md`       | Configuration complète des domaines |
| `FIX_BACKOFFICE_LOGIN.md`        | Corrections du login et protection  |
| `BACKOFFICE_ROUTE_PROTECTION.md` | Guide du middleware                 |
| `test-middleware.sh`             | Script de vérification              |

## 🎯 Checklist finale

- [x] CORS configuré pour `dashboard.stemadeleine.fr`
- [x] Cookie `SameSite=None` en production
- [x] Cookie `Secure=true` en production
- [x] Middleware de protection des routes
- [x] Rewrites Next.js configurés
- [x] Variables d'environnement Render
- [x] Documentation complète

## 🐛 En cas de problème

### Erreur CORS

1. Vérifiez que le déploiement backend est terminé sur Render
2. Videz le cache du navigateur (Cmd+Shift+R)
3. Vérifiez les logs Render du backend

### Cookie non défini

1. Vérifiez que HTTPS est actif (certificat SSL)
2. Vérifiez que `JWT_COOKIE_SECURE=true` sur Render
3. Vérifiez les rewrites Next.js dans les logs

### Redirect loop

1. Vérifiez que le cookie a bien `Path=/`
2. Vérifiez le middleware dans les logs du backoffice
3. Videz les cookies du navigateur

## 📞 Support

Consultez la documentation :

- `CUSTOM_DOMAINS_CONFIG.md` - Détails sur les domaines
- Logs Render - Pour le debugging en temps réel

---

**Tout est prêt pour la production !** 🎉

Les domaines `stemadeleine.fr` et `dashboard.stemadeleine.fr` fonctionneront parfaitement avec :

- ✅ CORS configuré
- ✅ Cookies sécurisés
- ✅ Protection des routes
- ✅ Authentication complète
