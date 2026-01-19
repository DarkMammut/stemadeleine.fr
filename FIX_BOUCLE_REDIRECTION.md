# 🚨 FIX URGENT - Boucle de redirection infinie

## 🎯 Problème

**ERR_TOO_MANY_REDIRECTS** - Boucle infinie entre pages avec 307 redirects multiples.

## ✅ SOLUTION IMMÉDIATE (à faire dans l'ordre)

### Étape 1 : Nettoyer le cache

```bash
cd /Users/seb/Documents/SteMadeleine/stemadeleine.fr
./clean-cache.sh
```

### Étape 2 : Supprimer TOUS les cookies

1. Ouvrir DevTools (F12)
2. Application → Cookies → http://localhost:3001
3. **SUPPRIMER TOUS LES COOKIES** (clic droit → Clear)
4. Ou utiliser navigation privée

### Étape 3 : Redémarrer le serveur

```bash
cd frontend/backoffice

# Arrêter le serveur (Ctrl+C)

# Redémarrer
npm run dev
```

### Étape 4 : Tester en navigation privée

```
1. Ouvrir fenêtre de navigation privée
2. Aller sur http://localhost:3001/
3. Résultat attendu : Landing page affichée

4. Se connecter avec "dev login"
5. Résultat attendu : Redirect vers /dashboard
6. Dashboard affiché

7. Vérifier la console (F12)
8. Regarder les logs du middleware
```

---

## 🔍 Diagnostic avec les logs

Le middleware affiche maintenant des logs dans la console du terminal :

```
🔍 Middleware: { pathname: '/', isAuthenticated: false }
✅ Allow: / (not authenticated, show landing)

🔍 Middleware: { pathname: '/auth/login', isAuthenticated: false }
✅ Allow: /auth/login (not authenticated)

🔍 Middleware: { pathname: '/dashboard', isAuthenticated: true }
✅ Allow: /dashboard (authenticated)
```

### Si vous voyez une boucle

```
🔍 Middleware: { pathname: '/dashboard', isAuthenticated: true }
✅ Allow: /dashboard (authenticated)

🔍 Middleware: { pathname: '/dashboard', isAuthenticated: true }
✅ Allow: /dashboard (authenticated)

🔍 Middleware: { pathname: '/dashboard', isAuthenticated: true }
✅ Allow: /dashboard (authenticated)
... (répété à l'infini)
```

**→ Le problème est dans le composant Dashboard ou Layout qui redirige**

---

## 🔧 Modifications appliquées

### 1. Suppression du useEffect dans page.js

Le useEffect qui vérifiait le cookie côté client causait un conflit avec le middleware.

**SUPPRIMÉ** :

```javascript
useEffect(() => {
    const isAuthenticated = document.cookie.includes('authToken=');
    if (isAuthenticated) {
        router.replace("/dashboard"); // ❌ Causait conflit
    }
}, [router]);
```

### 2. Middleware simplifié et avec logs

- ✅ Logique plus claire
- ✅ Logs de debug
- ✅ Pas de vérification sur `/` dans publicRoutes

---

## 🧪 Tests à effectuer

### Test 1 : Non connecté sur landing page

```bash
# Navigation privée
http://localhost:3001/

# Console terminal devrait montrer :
# 🔍 Middleware: { pathname: '/', isAuthenticated: false }
# ✅ Allow: / (not authenticated, show landing)

# Résultat : Landing page affichée ✅
```

### Test 2 : Non connecté sur page protégée

```bash
# Navigation privée
http://localhost:3001/dashboard

# Console terminal devrait montrer :
# 🔍 Middleware: { pathname: '/dashboard', isAuthenticated: false }
# 🔒 Redirect: /dashboard → /auth/login (not authenticated)

# Résultat : Redirect vers /auth/login ✅
```

### Test 3 : Connexion

```bash
# Sur /auth/login
# Se connecter avec "dev login"

# Console terminal devrait montrer :
# 🔍 Middleware: { pathname: '/auth/login', isAuthenticated: false }
# ✅ Allow: /auth/login

# Après login success :
# 🔍 Middleware: { pathname: '/dashboard', isAuthenticated: true }
# ✅ Allow: /dashboard (authenticated)

# Résultat : Dashboard affiché ✅
```

### Test 4 : Connecté sur landing page

```bash
# Déjà connecté
http://localhost:3001/

# Console terminal devrait montrer :
# 🔍 Middleware: { pathname: '/', isAuthenticated: true }
# ↗️  Redirect: / → /dashboard (authenticated)

# Puis :
# 🔍 Middleware: { pathname: '/dashboard', isAuthenticated: true }
# ✅ Allow: /dashboard (authenticated)

# Résultat : Dashboard affiché ✅
```

---

## ⚠️ Si le problème persiste

### Vérifier qu'il n'y a PAS de redirection dans :

1. **Layout.jsx** - Ne doit PAS avoir de useEffect avec router.push
2. **Header.jsx** - Ne doit PAS avoir de redirection automatique
3. **Sidebar.jsx** - Ne doit PAS avoir de redirection automatique
4. **Dashboard.jsx** - Ne doit PAS avoir de useEffect avec router.push

### Comment vérifier :

```bash
cd frontend/backoffice/src

# Chercher les redirections suspectes
grep -r "router.push\|router.replace" components/ui/
grep -r "useEffect.*router" components/ui/
```

---

## 🎯 Comportement attendu final

| URL           | État         | Résultat               |
|---------------|--------------|------------------------|
| `/`           | Non connecté | Landing page ✅         |
| `/`           | Connecté     | Redirect /dashboard ✅  |
| `/auth/login` | Non connecté | Formulaire login ✅     |
| `/auth/login` | Connecté     | Redirect /dashboard ✅  |
| `/dashboard`  | Non connecté | Redirect /auth/login ✅ |
| `/dashboard`  | Connecté     | Dashboard ✅            |
| `/users`      | Non connecté | Redirect /auth/login ✅ |
| `/users`      | Connecté     | Page users ✅           |

---

## 📞 Si rien ne fonctionne

1. **Partagez les logs** de la console terminal
2. **Partagez les cookies** dans DevTools → Application → Cookies
3. **Vérifiez le fichier** `frontend/backoffice/src/components/ui/Layout.jsx`

---

## ✅ Une fois résolu

Supprimez les logs de debug du middleware (les lignes avec `console.log`).

---

**COMMENCEZ PAR LÀ :** `./clean-cache.sh` + supprimer cookies + redémarrer serveur !
