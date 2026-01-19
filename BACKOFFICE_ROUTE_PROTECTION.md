# 🔒 Protection des Routes - Backoffice

## Problèmes résolus

### 1. Erreur 404 sur la page de login en production

**Problème** : Vous aviez des références à `/login` au lieu de `/auth/login`
**Solution** : Toutes les routes ont été corrigées pour pointer vers `/auth/login`

### 2. Accès aux pages protégées sans authentification

**Problème** : Aucun middleware Next.js ne protégeait les routes
**Solution** : Création d'un middleware pour gérer l'authentification et les redirections

## Fichiers modifiés

### 1. `/frontend/backoffice/src/middleware.js` (NOUVEAU)

Ce middleware protège toutes les routes du backoffice :

- ✅ Redirige automatiquement vers `/auth/login` si non authentifié
- ✅ Redirige vers `/dashboard` si déjà authentifié et qu'on accède à `/auth/login`
- ✅ Redirige la page d'accueil `/` vers `/dashboard` ou `/auth/login` selon l'état d'authentification
- ✅ Vérifie le cookie `authToken` côté serveur (sécurisé)

### 2. `/frontend/backoffice/src/app/page.js`

Correction des routes :

- ❌ Avant : `router.push("/login")`
- ✅ Après : `router.push("/auth/login")`

### 3. `/render.yaml`

Ajout des variables d'environnement :

```yaml
# Pour le backoffice
envVars:
  - key: BACKEND_URL
    value: https://stemadeleine-api.onrender.com

# Pour le backend
envVars:
  - key: JWT_COOKIE_SECURE
    value: true
```

### 4. `/backend/api/src/main/java/com/stemadeleine/api/controller/AuthController.java`

Configuration du cookie sécurisé basée sur l'environnement :

- Ajout de `@Value("${jwt.cookie.secure:false}")` pour injecter la configuration
- Utilisation de `jwtCookieSecure` au lieu de valeur hardcodée dans login et logout
- En production : cookie sécurisé activé (HTTPS uniquement)
- En local : cookie non sécurisé (HTTP accepté)

### 5. `/backend/api/src/main/resources/application.properties`

Ajout de la propriété :

```properties
jwt.cookie.secure=${JWT_COOKIE_SECURE:false}
```

## Fonctionnement

### Routes publiques

- `/auth/login` - Page de connexion
- `/auth/register` - Page d'inscription (si vous la créez)

### Routes protégées

- `/dashboard` - Tableau de bord
- `/contacts` - Gestion des contacts
- `/news` - Gestion des actualités
- `/newsletters` - Gestion des newsletters
- `/payments` - Gestion des paiements
- `/users` - Gestion des utilisateurs
- `/settings` - Paramètres
- etc.

### Flux d'authentification

```
┌─────────────────────────────────────────────────────────────┐
│  Utilisateur non authentifié accède à une page protégée     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │  Middleware vérifie le cookie         │
        │  authToken dans la requête            │
        └───────────────┬───────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          │                           │
    Cookie absent                Cookie présent
          │                           │
          ▼                           ▼
┌───────────────────────┐   ┌──────────────────┐
│ Redirection vers      │   │ Accès autorisé   │
│ /auth/login           │   │ à la page        │
└───────────────────────┘   └──────────────────┘
```

## Test en local

1. Démarrez le backend :

```bash
cd backend/api
./mvnw spring-boot:run
```

2. Démarrez le backoffice :

```bash
cd frontend/backoffice
npm run dev
```

3. Testez les scénarios :
    - Accédez à `http://localhost:3001/` → devrait rediriger vers `/auth/login`
    - Accédez à `http://localhost:3001/dashboard` → devrait rediriger vers `/auth/login`
    - Connectez-vous → devrait rediriger vers `/dashboard`
    - Accédez à `http://localhost:3001/auth/login` une fois connecté → devrait rediriger vers `/dashboard`

## Déploiement

Pour déployer les changements :

```bash
git add .
git commit -m "Fix: Protection des routes backoffice + correction route login"
git push origin main
```

Render détectera automatiquement les changements et redéploiera :

- ✅ Le backoffice avec le nouveau middleware
- ✅ La nouvelle variable d'environnement BACKEND_URL

## Notes importantes

✅ **Cookie sécurisé** : Le backend utilise maintenant `JWT_COOKIE_SECURE=true` en production pour activer les cookies
HTTPS uniquement.

⚠️ **CORS** : Vérifiez que le backend autorise les requêtes depuis le domaine du backoffice.

⚠️ **Session persistence** : Le middleware vérifie uniquement l'existence du cookie. Si vous voulez une vérification
plus robuste, vous pouvez ajouter un appel API pour valider le token.

## Résumé des changements

### Frontend (Backoffice)

- ✅ Middleware créé pour protéger toutes les routes
- ✅ Correction des routes `/login` → `/auth/login`
- ✅ Variable `BACKEND_URL` ajoutée pour les rewrites

### Backend (API)

- ✅ Cookie sécurisé configurable via `JWT_COOKIE_SECURE`
- ✅ Configuration appliquée au login et logout
- ✅ Production : cookies HTTPS uniquement (secure=true)
- ✅ Développement : cookies HTTP acceptés (secure=false)
