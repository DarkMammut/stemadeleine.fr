# 🎨 Gestion du Favicon Dynamique

## Vue d'ensemble

Le système de favicon dynamique permet de changer le favicon du site et du backoffice depuis l'interface d'
administration, sans avoir à modifier le code ou redéployer l'application.

## Architecture

```
┌─────────────────┐
│   Backoffice    │  ← Upload du favicon via MediaManager
│  (Port 3001)    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Backend API    │  ← Stockage dans la DB (organizations.favicon_media_id)
│  (Port 8080)    │
└────────┬────────┘
         │
         ├──────────────────┐
         ↓                  ↓
┌─────────────────┐  ┌─────────────────┐
│   Backoffice    │  │  Site public    │
│ DynamicFavicon  │  │ DynamicFavicon  │
└─────────────────┘  └─────────────────┘
```

## Composants

### Backend (Déjà configuré ✅)

- **Migration** : `V9__add_favicon_to_organizations.sql`
- **Modèle** : `Organization.java` avec champ `favicon`
- **API** :
    - `PUT /api/organizations/{id}/favicon` - Upload favicon
    - `DELETE /api/organizations/{id}/favicon` - Supprimer favicon
    - `GET /api/public/organization/settings` - Récupérer les settings (incluant faviconMedia)
    - `GET /api/public/media/{id}` - Récupérer le fichier favicon

### Frontend Backoffice

#### 1. Interface d'upload

**Fichier** : `frontend/backoffice/src/scenes/Site.jsx`

Le MediaManager permet d'uploader/supprimer le favicon :

```javascript
<MediaManager
    title="Favicon du site"
    endpoint={`/api/organizations/${orgId}/favicon`}
    deleteEndpoint={`/api/organizations/${orgId}/favicon`}
    maxMedia={1}
    currentMedias={orgData.favicon ? [orgData.favicon] : []}
    onMediaChange={loadOrgData}
/>
```

#### 2. Composant de chargement dynamique

**Fichier** : `frontend/backoffice/src/components/DynamicFavicon.jsx`

Composant React qui :

1. Récupère les settings de l'API au chargement de la page
2. Si un favicon est défini, remplace le `<link rel="icon">` dans le DOM
3. Ajoute un timestamp pour forcer le rafraîchissement du cache

### Frontend Site Public

**Fichier** : `frontend/stemadeleine/src/components/DynamicFavicon.tsx`

Même fonctionnalité que le backoffice, adapté pour TypeScript.

## Flux de fonctionnement

### Upload d'un nouveau favicon

1. Admin va sur http://localhost:3001/settings
2. Dans "Favicon du site", clique sur "Ajouter un média"
3. Upload une image (ICO, PNG, SVG recommandés)
4. Le MediaManager envoie l'image au backend via `PUT /api/organizations/{id}/favicon`
5. Le backend :
    - Sauvegarde le fichier via MediaService
    - Met à jour `organization.favicon_media_id` dans la DB
    - Retourne l'objet Media complet
6. Le MediaManager rafraîchit l'affichage

### Chargement du favicon sur un site

1. La page se charge avec le layout
2. Le composant `<DynamicFavicon />` s'exécute côté client
3. Il appelle `GET /api/public/organization/settings`
4. Si `faviconMedia` est présent :
    - Supprime les `<link rel="icon">` existants
    - Crée un nouveau lien vers `/api/public/media/{faviconMedia}?t={timestamp}`
    - L'ajoute au `<head>` du document
5. Le navigateur charge et affiche le nouveau favicon

### Cache busting

Le timestamp (`?t={timestamp}`) force le navigateur à recharger l'image même si elle est en cache. Cela évite d'avoir à
vider manuellement le cache à chaque changement.

## Installation et test

### Prérequis

1. **Backend démarré**
   ```bash
   cd backend/api
   ./mvnw spring-boot:run
   ```

2. **Variables d'environnement**

   **Backoffice** (`.env.local`) :
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
   ```

   **Stemadeleine** (`.env.local`) :
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

### Test rapide

1. **Lancer le script de diagnostic**
   ```bash
   chmod +x test-favicon.sh
   ./test-favicon.sh
   ```

2. **Démarrer le backoffice**
   ```bash
   cd frontend/backoffice
   npm install
   npm run dev
   ```

3. **Uploader un favicon**
    - Ouvrir http://localhost:3001/settings
    - Uploader une image dans "Favicon du site"
    - Observer le changement dans l'onglet du navigateur

4. **Vérifier sur le site public**
   ```bash
   cd frontend/stemadeleine
   npm install
   npm run dev
   ```
    - Ouvrir http://localhost:3000
    - Le favicon devrait être le même

### Forcer le rafraîchissement

Si le favicon ne change pas immédiatement :

- **Chrome/Edge** : `Ctrl+Shift+R` (Mac : `Cmd+Shift+R`)
- **Firefox** : `Ctrl+Shift+R` (Mac : `Cmd+Shift+R`)
- **Safari** : `Cmd+Option+R`

## Formats recommandés

### ICO (Classique)

- Taille : 16x16, 32x32, 48x48 (multi-résolution)
- Avantage : Compatible avec tous les navigateurs
- Inconvénient : Qualité limitée

### PNG (Moderne)

- Taille : 32x32 ou 64x64
- Avantage : Meilleure qualité, transparence
- Inconvénient : Pas de multi-résolution

### SVG (Futur)

- Taille : Vectoriel
- Avantage : Scalable, léger
- Inconvénient : Support navigateur limité

## Troubleshooting

### ❌ Le favicon ne change pas

**Causes possibles :**

1. Backend non démarré → Vérifier avec `./test-favicon.sh`
2. Cache navigateur → Forcer le rafraîchissement (`Ctrl+Shift+R`)
3. Variables d'environnement incorrectes → Vérifier `.env.local`
4. Favicon non uploadé → Vérifier dans Settings

**Diagnostic :**

```bash
# Vérifier que l'API retourne le favicon
curl http://localhost:8080/api/public/organization/settings | jq '.faviconMedia'

# Vérifier que le média est accessible
curl -I http://localhost:8080/api/public/media/{faviconMedia}
```

### ❌ Erreur CORS

**Solution :**
Vérifier la configuration CORS du backend. Elle devrait autoriser les origines des frontends :

```java
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
```

### ❌ Image ne s'affiche pas

**Causes possibles :**

1. Format non supporté → Utiliser ICO, PNG ou SVG
2. Fichier corrompu → Réuploader
3. Permissions → Vérifier que le média est public

### ❌ Console JavaScript montre une erreur

**Solution :**
Ouvrir la console du navigateur (`F12`) et chercher :

- Erreurs réseau (404, 500)
- Erreurs CORS
- Messages de `DynamicFavicon`

## Fichiers importants

```
├── backend/api/
│   ├── src/main/resources/db/migration/
│   │   └── V9__add_favicon_to_organizations.sql
│   ├── src/main/java/com/stemadeleine/api/
│   │   ├── model/Organization.java
│   │   ├── service/OrganizationService.java
│   │   └── controller/OrganizationController.java
│
├── frontend/backoffice/
│   ├── .env.local
│   ├── src/app/layout.js
│   ├── src/components/DynamicFavicon.jsx
│   └── src/scenes/Site.jsx
│
├── frontend/stemadeleine/
│   ├── .env.local
│   ├── src/app/layout.tsx
│   └── src/components/DynamicFavicon.tsx
│
└── test-favicon.sh
```

## Documentation complémentaire

- **FIX_META_FAVICON_BANNER.md** - Modifications initiales backend/UI
- **FIX_DYNAMIC_FAVICON.md** - Détails de l'implémentation du chargement dynamique
- **API.md** - Documentation complète de l'API

## Notes de développement

- Les favicons statiques (`/src/app/favicon.ico`) sont conservés comme fallback
- Le chargement se fait côté client pour éviter d'impacter le SSR
- Un cache de 1h est appliqué sur les médias (header `Cache-Control`)
- Le timestamp force un nouveau téléchargement lors des changements

## Prochaines améliorations possibles

- [ ] Support du favicon SVG avec thème clair/sombre
- [ ] Génération automatique de différentes tailles (16x16, 32x32, etc.)
- [ ] Prévisualisation du favicon avant upload
- [ ] Validation du format et de la taille côté frontend
- [ ] Apple touch icon et autres formats mobile
