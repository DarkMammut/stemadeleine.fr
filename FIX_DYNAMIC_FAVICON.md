# Fix Favicon Dynamique - Mise à jour

## Date : 5 février 2026

## Problème

Le favicon configuré dans le backoffice ne se mettait pas à jour sur les sites (backoffice et stemadeleine). Le backend
était prêt mais la logique côté frontend pour charger dynamiquement le favicon manquait.

## Solution implémentée

### 1. Composant DynamicFavicon (Client-side)

Création de deux composants identiques pour gérer le favicon dynamique côté client :

- **`frontend/backoffice/src/components/DynamicFavicon.jsx`**
- **`frontend/stemadeleine/src/components/DynamicFavicon.tsx`**

Ces composants :

1. Récupèrent les paramètres de l'organisation depuis l'API publique
2. Si un `faviconMedia` est défini, remplacent le favicon statique par le média dynamique
3. Ajoutent un timestamp pour forcer le rafraîchissement du cache du navigateur
4. Utilisent un fallback vers le favicon statique si l'API échoue

### 2. Intégration dans les layouts

#### Backoffice (`frontend/backoffice/src/app/layout.js`)

```javascript
import DynamicFavicon from "@/components/DynamicFavicon";

export default function RootLayout({children}) {
    return (
        <html lang="en">
        <body>
        <DynamicFavicon />
        <AuthProvider>
            <ContactsProvider>{children}</ContactsProvider>
        </AuthProvider>
        </body>
        </html>
    );
}
```

#### Stemadeleine (`frontend/stemadeleine/src/app/layout.tsx`)

```typescript
import DynamicFavicon from '@/components/DynamicFavicon';

export default async function RootLayout({children}) {
    // ...
    return (
        <html lang="en" style={htmlStyle}>
        <body>
        <DynamicFavicon />
        <ThemeProvider>{children}</ThemeProvider>
        </body>
        </html>
    );
}
```

## Comment ça marche

1. **Au chargement de la page** : Le composant `DynamicFavicon` s'exécute côté client
2. **Appel API** : Il récupère les settings depuis `/api/public/organization/settings`
3. **Mise à jour DOM** : Si un favicon est défini, il supprime les anciens liens `<link rel="icon">` et en crée un
   nouveau pointant vers `/api/public/media/{faviconMedia}`
4. **Cache busting** : Un timestamp est ajouté à l'URL pour forcer le navigateur à recharger l'image

## Comment tester

### 1. Vérifier que le backend est démarré

```bash
cd backend/api
./mvnw spring-boot:run
```

### 2. Démarrer le backoffice

```bash
cd frontend/backoffice
npm install
npm run dev
```

### 3. Uploader un nouveau favicon

- Aller sur http://localhost:3001/settings
- Dans la section "Favicon du site", uploader une image
- Le favicon devrait se mettre à jour immédiatement dans l'onglet du navigateur

### 4. Vérifier sur le site public

```bash
cd frontend/stemadeleine
npm install
npm run dev
```

- Aller sur http://localhost:3000
- Le favicon devrait être le même que celui uploadé dans le backoffice

### 5. Forcer le rafraîchissement du cache

Si le favicon ne change pas :

- **Chrome/Edge** : Ctrl+Shift+R (Cmd+Shift+R sur Mac)
- **Firefox** : Ctrl+Shift+R (Cmd+Shift+R sur Mac)
- **Safari** : Cmd+Option+R
- Ou vider le cache complet du navigateur

## API utilisée

- **GET** `/api/public/organization/settings` - Récupère les paramètres incluant `faviconMedia`
- **GET** `/api/public/media/{id}` - Récupère le fichier média du favicon
- **PUT** `/api/organizations/{id}/favicon` - Upload un nouveau favicon (depuis le backoffice)
- **DELETE** `/api/organizations/{id}/favicon` - Supprime le favicon (depuis le backoffice)

## Avantages de cette approche

✅ **Simple** : Pas de route API complexe, utilise les endpoints existants
✅ **Performant** : Chargement asynchrone côté client, n'impacte pas le SSR
✅ **Robuste** : Fallback automatique vers le favicon statique en cas d'erreur
✅ **Cache-friendly** : Timestamp pour forcer le rafraîchissement sans polluer le cache
✅ **Réutilisable** : Même composant pour les deux frontends

## Fichiers modifiés/créés

### Nouveaux fichiers (2)

1. `frontend/backoffice/src/components/DynamicFavicon.jsx`
2. `frontend/stemadeleine/src/components/DynamicFavicon.tsx`

### Fichiers modifiés (2)

1. `frontend/backoffice/src/app/layout.js`
2. `frontend/stemadeleine/src/app/layout.tsx`

## Notes importantes

- Les fichiers `favicon.ico` statiques restent en place comme fallback
- Le changement de favicon se fait côté client via JavaScript
- Le composant utilise `useEffect` pour s'exécuter après le premier render
- La variable d'environnement `NEXT_PUBLIC_BACKEND_URL` est utilisée pour construire les URLs d'API

## Troubleshooting

### Le favicon ne change pas

1. Vérifier que le backend est démarré et accessible
2. Vérifier que le favicon a bien été uploadé dans le backoffice
3. Ouvrir la console du navigateur et vérifier les erreurs
4. Vérifier que l'API retourne bien un `faviconMedia` :
    - Ouvrir http://localhost:8080/api/public/organization/settings
5. Forcer le rafraîchissement complet (Ctrl+Shift+R)

### Erreur de CORS

Si vous voyez une erreur CORS dans la console :

- Vérifier que `NEXT_PUBLIC_BACKEND_URL` pointe vers la bonne URL
- Vérifier la configuration CORS du backend

### Le favicon ne persiste pas

- Le favicon est stocké dans la base de données via `favicon_media_id`
- Si vous supprimez le média, le favicon sera perdu
- Créez un backup avant de supprimer des médias
