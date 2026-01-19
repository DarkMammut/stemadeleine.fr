# 🔍 Résolution du problème de redirection 307

## 🎯 Problème

> "Quand j'essaie d'aller sur localhost:3001/ (en étant connecté), je suis immédiatement redirigé vers /dashboard et il
> me dit que la page ne fonctionne pas (307)"

## 🔎 Diagnostic

L'erreur 307 (Temporary Redirect) avec "page qui ne fonctionne pas" indique très probablement :

1. Une boucle de redirection
2. Un problème avec Next.js dev mode (Turbopack)
3. Un conflit entre middleware et page

## ✅ Solutions à essayer

### Solution 1 : Redémarrer le serveur dev (le plus simple)

```bash
# Arrêter le serveur (Ctrl+C)
# Supprimer le cache Next.js
rm -rf frontend/backoffice/.next

# Redémarrer
cd frontend/backoffice
npm run dev
```

### Solution 2 : Tester sans Turbopack

Dans `frontend/backoffice/package.json`, changez :

```json
"dev": "next dev -p 3001"
```

(au lieu de `next dev --turbopack -p 3001`)

### Solution 3 : Vérifier que /dashboard fonctionne directement

```bash
# Avec les cookies de session, essayez d'accéder directement :
http://localhost:3001/dashboard
```

Si `/dashboard` fonctionne directement mais pas via la redirection depuis `/`, c'est un problème de middleware.

### Solution 4 : Modifier le middleware pour utiliser `replace` au lieu de `redirect`

Le middleware utilise `NextResponse.redirect()` qui peut causer des problèmes en dev. Essayons une autre approche.

## 🔧 Solution recommandée

Modifiez le middleware pour gérer la redirection côté client au lieu de côté serveur pour la route racine quand
l'utilisateur est connecté.

## 📝 Tests à effectuer

1. **Sans authentification** :
   ```
   localhost:3001/ → Landing page affichée ✅
   ```

2. **Avec authentification** :
   ```
   localhost:3001/ → Devrait rediriger vers /dashboard
   localhost:3001/dashboard → Dashboard affiché directement
   ```

3. **Vérifier les logs console** :
    - Ouvrir DevTools → Console
    - Regarder s'il y a des erreurs de redirection

## 🐛 Problèmes possibles

### 1. Cache Next.js

Le cache `.next` peut contenir une ancienne version du middleware.
**Solution** : `rm -rf .next`

### 2. Turbopack en mode dev

Turbopack peut avoir des bugs avec les middlewares.
**Solution** : Désactiver `--turbopack`

### 3. Boucle de redirection

Le middleware redirige → la page redirige → le middleware redirige...
**Solution** : Vérifier qu'il n'y a pas de redirection dans le composant Dashboard

---

**Première action recommandée** : Redémarrez le serveur dev et supprimez le cache `.next` !
