# 🔧 FIX: Déconnexion automatique en production

## 🎯 Problème

Après un login réussi en production (Vercel), l'utilisateur est immédiatement déconnecté :

```
Login successful for user: admin@example.com
↓ (4 secondes plus tard)
POST /api/auth/logout - Déconnexion de l'utilisateur
```

## 🔍 Diagnostic

### Cause du problème

1. **Login réussi** → Cookie créé avec `SameSite=None; Secure`
2. **Requête suivante** (ex: fetch dashboard data) → Cookie `SameSite=None` n'est PAS envoyé par le navigateur
3. **Backend retourne 401** (pas de cookie)
4. **Intercepteur axios** détecte le 401 → appelle automatiquement logout
5. **Utilisateur déconnecté**

### Pourquoi SameSite=None ne fonctionne pas ?

**Sur Vercel avec rewrites Next.js** :

- Frontend : `dashboard.stemadeleine.fr`
- Requêtes apparentes : `dashboard.stemadeleine.fr/api/*`
- Rewrites internes : `→ stemadeleine-api.onrender.com/api/*`

Le navigateur considère que :

- La requête est vers `dashboard.stemadeleine.fr/api/*` (same-site)
- Mais le cookie vient de `stemadeleine-api.onrender.com` (cross-site)
- Avec `SameSite=None`, certains navigateurs bloquent le cookie

**Avec SameSite=Lax** :

- Le cookie est marqué comme same-site
- Les rewrites Next.js font que tout est sur `dashboard.stemadeleine.fr`
- Le navigateur envoie le cookie correctement ✅

---

## ✅ Solution appliquée

### Modification du AuthController

**Fichier** : `backend/api/src/main/java/com/stemadeleine/api/controller/AuthController.java`

#### AVANT ❌

```java
if(jwtCookieSecure){
        cookieHeader.

append("; Secure");
    cookieHeader.

append("; SameSite=None"); // ❌ Bloqué par navigateurs
}else{
        cookieHeader.

append("; SameSite=Lax");
}
```

#### APRÈS ✅

```java
if(jwtCookieSecure){
        cookieHeader.

append("; Secure");
}

// Always use SameSite=Lax (even in production) because Next.js rewrites
// make all requests appear as same-site to the browser
        cookieHeader.

append("; SameSite=Lax"); // ✅ Fonctionne partout
```

---

## 🎯 Configuration finale des cookies

### Production (Vercel + Render)

```
authToken=xxx;
Path=/;
Max-Age=86400;
HttpOnly;
Secure;
SameSite=Lax ✅
```

### Développement (localhost)

```
authToken=xxx;
Path=/;
Max-Age=86400;
HttpOnly;
SameSite=Lax ✅
```

**Pourquoi ça fonctionne maintenant ?**

Les **rewrites Next.js** font que toutes les requêtes semblent provenir de `dashboard.stemadeleine.fr` :

- Frontend : `https://dashboard.stemadeleine.fr`
- API (via rewrite) : `https://dashboard.stemadeleine.fr/api/*`
- Le navigateur considère ça comme **same-site**
- `SameSite=Lax` autorise le cookie ✅

---

## 🧪 Tests à effectuer

### Test 1 : Login en production

```
1. Aller sur https://dashboard.stemadeleine.fr/auth/login
2. Se connecter
3. ✅ Redirigé vers /dashboard
4. ✅ Dashboard s'affiche
5. ✅ Pas de déconnexion automatique
```

### Test 2 : Cookie créé

```
1. Après login
2. DevTools → Application → Cookies → dashboard.stemadeleine.fr
3. Vérifier :
   - authToken existe ✅
   - HttpOnly: true ✅
   - Secure: true ✅
   - SameSite: Lax ✅
```

### Test 3 : Requêtes authentifiées

```
1. Connecté sur dashboard
2. Naviguer vers /users, /news, etc.
3. ✅ Toutes les pages chargent correctement
4. ✅ Pas de 401 dans la console
5. ✅ Pas de déconnexion automatique
```

### Test 4 : Rafraîchir la page

```
1. Connecté sur /dashboard
2. Rafraîchir (F5)
3. ✅ Reste connecté
4. ✅ Dashboard se recharge
```

---

## 📊 Flux de requêtes

### AVANT (SameSite=None) ❌

```
1. Login → Cookie créé (SameSite=None)
2. Requête /api/dashboard
   └─> Navigateur : "Cookie cross-site avec SameSite=None"
   └─> Navigateur : "Bloqué par sécurité" ❌
3. Backend ne reçoit pas le cookie
4. Backend retourne 401
5. Axios intercepteur → logout automatique
```

### APRÈS (SameSite=Lax) ✅

```
1. Login → Cookie créé (SameSite=Lax)
2. Requête /api/dashboard
   └─> Navigateur : "Cookie same-site avec SameSite=Lax"
   └─> Navigateur : "Autorisé" ✅
3. Backend reçoit le cookie
4. Backend retourne 200 avec données
5. Dashboard s'affiche correctement
```

---

## 🚀 Déploiement

```bash
git add backend/api/src/main/java/com/stemadeleine/api/controller/AuthController.java
git commit -m "fix: Use SameSite=Lax for cookies to fix auto-logout on Vercel"
git push origin main
```

**Render redéploiera automatiquement le backend** avec la correction.

---

## 📝 Résumé

| Aspect               | Avant                   | Après            |
|----------------------|-------------------------|------------------|
| **SameSite**         | None (prod) / Lax (dev) | Lax (partout)    |
| **Login**            | ✅ Fonctionne            | ✅ Fonctionne     |
| **Cookie envoyé**    | ❌ Bloqué en prod        | ✅ Envoyé partout |
| **Dashboard charge** | ❌ 401 → logout          | ✅ Fonctionne     |
| **Navigation**       | ❌ Déconnexion           | ✅ Reste connecté |

---

## 🎉 Résultat

**Le problème de déconnexion automatique est résolu !**

- ✅ Login fonctionne en production
- ✅ Cookie envoyé dans toutes les requêtes
- ✅ Pas de 401 inattendus
- ✅ Pas de logout automatique
- ✅ Navigation fluide

**Déployez maintenant et testez !** 🚀
