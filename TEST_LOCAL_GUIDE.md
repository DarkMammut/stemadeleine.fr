# 🔧 Guide de test local - Après corrections

## ✅ Corrections effectuées

### 1. Transmission des cookies dans les routes API proxy

**Problème :** Les routes API Next.js ne transmettaient pas correctement le cookie `authToken` au backend, ce qui
causait des erreurs 401/500.

**Solution :** Utilisation de l'API `cookies()` de Next.js pour récupérer et transmettre le cookie.

**Fichier modifié :** `/src/app/api/[...path]/route.js`

```javascript
import {cookies} from 'next/headers';

async function proxyRequest(request, method, params) {
    // Get cookies from Next.js
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken');

    // Prepare fetch options
    const fetchOptions = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Add cookie if present
    if (authToken) {
        fetchOptions.headers['Cookie'] = `authToken=${authToken.value}`;
    }

    // ... rest of the code
}
```

### 2. Harmonisation des variables d'environnement

**Problème :** Le code utilisait `NEXT_PUBLIC_API_URL` mais le `.env.local` définissait `NEXT_PUBLIC_BACKEND_URL`.

**Solution :** Support des deux variables avec fallback.

**Toutes les routes API modifiées :**

```javascript
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
    || process.env.NEXT_PUBLIC_API_URL
    || 'https://stemadeleine-api.onrender.com';
```

### 3. Amélioration de la gestion des erreurs

**Ajouté :** Logs pour déboguer et meilleure gestion des réponses non-JSON.

---

## 🧪 Comment tester en local

### 1. Vérifier que le backend est démarré

```bash
# Vérifier si Docker est lancé (si vous utilisez Docker)
docker ps

# Ou vérifier si le backend écoute sur le port 8080
lsof -i:8080
```

**Si pas démarré :**

```bash
cd backend/api
# Avec Docker:
docker-compose up -d
# OU avec Maven directement:
./mvnw spring-boot:run
```

### 2. Arrêter tout processus sur le port 3001

```bash
lsof -ti:3001 | xargs kill -9
```

### 3. Démarrer le backoffice

```bash
cd frontend/backoffice
npm run dev
```

**Attendre que vous voyiez :**

```
▲ Next.js 15.x.x
- Local:        http://localhost:3001
- Ready in 2.5s
```

### 4. Tester la connexion

1. Ouvrir http://localhost:3001
2. Vous devriez voir la landing page
3. Cliquer sur un lien ou aller directement sur http://localhost:3001/auth/login
4. Se connecter avec :
    - **Email :** `admin@example.com`
    - **Password :** `admin`
5. ✅ Vous devriez être redirigé vers `/dashboard`
6. ✅ Le dashboard devrait se charger sans erreur 500
7. ✅ Les widgets (KPIs, donations, campaigns) devraient s'afficher

### 5. Vérifier les logs

**Dans la console du navigateur (DevTools) :**

- Pas d'erreur `Request failed with status code 500`
- Pas d'erreur `Request failed with status code 401`

**Dans le terminal du backoffice :**

```
[API Proxy] GET http://localhost:8080/api/stats/dashboard
[API Proxy] Forwarding cookie: authToken=eyJhbGciOiJIUzI1...
[API Proxy] Response: 200
```

**Dans les logs du backend :**

- Pas de `401 Unauthorized`
- Des requêtes réussies : `200 OK`

---

## 🐛 Si vous avez toujours des erreurs

### Erreur: "Request failed with status code 500"

**Cause possible :** Le backend ne répond pas ou retourne une erreur.

**Solution :**

1. Vérifier les logs du backend
2. Tester directement l'endpoint avec curl :
   ```bash
   # D'abord se connecter et récupérer le cookie
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"admin"}' \
     -c cookies.txt
   
   # Puis tester l'endpoint
   curl http://localhost:8080/api/stats/dashboard -b cookies.txt
   ```

### Erreur: "Failed to parse response"

**Cause possible :** Le backend retourne une réponse invalide.

**Solution :** Vérifier les logs du proxy dans le terminal du backoffice.

### Erreur: "401 Unauthorized"

**Cause possible :** Le cookie n'est pas transmis correctement.

**Solution :**

1. Ouvrir DevTools → Application → Cookies
2. Vérifier que le cookie `authToken` existe
3. Vérifier les logs du proxy : `[API Proxy] Forwarding cookie: authToken=...`
4. Si le log dit "No authToken cookie found", le problème vient de la connexion

---

## 📝 Checklist de test complet

- [ ] Backend démarré (port 8080)
- [ ] Backoffice démarré (port 3001)
- [ ] Landing page accessible (http://localhost:3001)
- [ ] Page login accessible (http://localhost:3001/auth/login)
- [ ] Connexion réussie avec admin@example.com / admin
- [ ] Redirection vers /dashboard après login
- [ ] Dashboard s'affiche sans erreur
- [ ] Pas d'erreur 500 dans la console
- [ ] Pas d'erreur 401 dans la console
- [ ] Cookie `authToken` présent dans DevTools
- [ ] Navigation vers /users fonctionne
- [ ] Navigation vers /contacts fonctionne
- [ ] Déconnexion fonctionne
- [ ] Après déconnexion, redirection vers /auth/login

---

## 🚀 Prêt pour le déploiement ?

Si tous les tests passent en local, vous pouvez déployer :

```bash
git add .
git commit -m "fix: Transmission des cookies dans les routes API proxy + harmonisation variables d'environnement"
git push origin main
```

**N'oubliez pas de configurer les variables d'environnement sur Vercel :**

- `NEXT_PUBLIC_API_URL` = `https://stemadeleine-api.onrender.com`

ou

- `NEXT_PUBLIC_BACKEND_URL` = `https://stemadeleine-api.onrender.com`
