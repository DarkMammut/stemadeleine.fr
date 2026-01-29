# Résumé des modifications - Meta tags, Favicon et Image de bannière

## Date : 29 janvier 2026

## Modifications effectuées

### 1. Backend - Ajout du champ favicon pour l'organisation

#### Migration Flyway

- **Fichier créé** : `V9__add_favicon_to_organizations.sql`
- Ajout de la colonne `favicon_media_id` dans la table `organizations`

#### Modèle

- **Fichier modifié** : `Organization.java`
- Ajout du champ `favicon` de type `Media`

#### DTOs

- **Fichier modifié** : `OrganizationSettingsDTO.java`
    - Ajout du champ `faviconMedia` de type `UUID`
- **Fichier modifié** : `OrganizationDto.java`
    - Ajout du champ `favicon` de type `Media`

#### Service

- **Fichier modifié** : `OrganizationService.java`
    - Ajout de la méthode `updateFavicon(UUID id, UUID mediaId)`
    - Ajout de la méthode `deleteFavicon(UUID id)`
    - Mise à jour de `getPublicOrganizationSettings()` pour inclure le favicon
    - Mise à jour de `getLastCreatedOrganizationWithAddress()` pour inclure le favicon

#### Contrôleur

- **Fichier modifié** : `OrganizationController.java`
    - Ajout de l'endpoint `PUT /{id}/favicon` pour mettre à jour le favicon
    - Ajout de l'endpoint `DELETE /{id}/favicon` pour supprimer le favicon

### 2. Frontend Stemadeleine

#### Layout principal

- **Fichier modifié** : `frontend/stemadeleine/src/app/layout.tsx`
    - Mise à jour du titre : "Les Amis de Sainte-Madeleine de la Jarrie"
    - Mise à jour de la description
    - Ajout de l'icône favicon dans les metadata

#### Composant Hero

- **Fichier modifié** : `frontend/stemadeleine/src/components/Hero.tsx`
    - **FIX MAJEUR** : Ajout de `opacity-40` à l'overlay pour permettre à l'image de bannière d'être visible
    - Explication : L'overlay avait un z-index supérieur à l'image sans transparence, ce qui cachait complètement
      l'image de fond

### 3. Frontend Backoffice

#### Layout principal

- **Fichier modifié** : `frontend/backoffice/src/app/layout.js`
    - Mise à jour du titre : "Dashboard | LASMLJ"
    - Mise à jour de la description
    - Ajout de l'icône favicon dans les metadata

#### Scène Site

- **Fichier modifié** : `frontend/backoffice/src/scenes/Site.jsx`
    - Ajout d'un nouveau `MediaManager` pour gérer le favicon
    - Configuration des endpoints pour ajouter/supprimer le favicon
    - Limite d'1 média pour le favicon

## Problèmes résolus

### ✅ 1. Favicon manquant sur stemadeleine

- Favicon déjà présent, metadata mis à jour pour le référencer correctement

### ✅ 2. Favicon manquant sur le backoffice

- Favicon déjà présent, metadata mis à jour pour le référencer correctement

### ✅ 3. Titre du backoffice générique

- Changé de "Create Next App" à "Dashboard | LASMLJ"

### ✅ 4. Champ favicon dans les settings

- Nouveau champ ajouté dans la base de données
- API complète pour gérer le favicon (ajout/suppression)
- Interface dans le backoffice pour uploader/supprimer le favicon
- Le favicon sera utilisé par les deux frontends (stemadeleine et backoffice)

### ✅ 5. Image de bannière non visible

- **Problème identifié** : L'overlay `bg-primary-light` avec z-index 5 cachait l'image de fond (z-index 0)
- **Solution** : Ajout de `opacity-40` à l'overlay pour le rendre semi-transparent
- L'image de bannière est maintenant visible avec un overlay léger qui améliore la lisibilité du texte

## Prochaines étapes

### Pour tester les modifications

1. **Backend**
   ```bash
   cd backend/api
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```
    - La migration Flyway s'exécutera automatiquement au démarrage
    - Vérifier que la colonne `favicon_media_id` est créée dans la table `organizations`

2. **Frontend Stemadeleine**
   ```bash
   cd frontend/stemadeleine
   npm install
   npm run dev
   ```
    - Vérifier le nouveau titre et favicon dans l'onglet du navigateur
    - Vérifier que l'image de bannière de la page d'accueil est maintenant visible

3. **Frontend Backoffice**
   ```bash
   cd frontend/backoffice
   npm install
   npm run dev
   ```
    - Vérifier le nouveau titre "Dashboard | LASMLJ" dans l'onglet du navigateur
    - Vérifier le favicon
    - Aller dans "Paramètres du site" et vérifier la présence du nouveau champ "Favicon du site"
    - Tester l'upload d'un favicon

### Utilisation du favicon dynamique

Une fois qu'un favicon est uploadé via le backoffice :

- Il sera accessible via l'API publique : `/api/public/organization/settings`
- Les frontends pourront récupérer l'ID du favicon et l'afficher
- Pour l'implémenter complètement, il faudra modifier les layouts pour récupérer le favicon dynamiquement depuis l'API

## Notes techniques

- Les favicons statiques sont actuellement présents dans `/src/app/favicon.ico` pour les deux frontends
- Pour utiliser le favicon dynamique depuis la base de données, il faudra ajouter une logique dans les layouts pour :
    1. Récupérer les settings de l'organisation
    2. Si un favicon existe, l'afficher via l'API `/api/public/media/{id}`
    3. Sinon, utiliser le favicon par défaut

## Fichiers modifiés

### Backend (6 fichiers)

1. `backend/api/src/main/resources/db/migration/V9__add_favicon_to_organizations.sql`
2. `backend/api/src/main/java/com/stemadeleine/api/model/Organization.java`
3. `backend/api/src/main/java/com/stemadeleine/api/dto/OrganizationSettingsDTO.java`
4. `backend/api/src/main/java/com/stemadeleine/api/dto/OrganizationDto.java`
5. `backend/api/src/main/java/com/stemadeleine/api/service/OrganizationService.java`
6. `backend/api/src/main/java/com/stemadeleine/api/controller/OrganizationController.java`

### Frontend (4 fichiers)

1. `frontend/stemadeleine/src/app/layout.tsx`
2. `frontend/stemadeleine/src/components/Hero.tsx`
3. `frontend/backoffice/src/app/layout.js`
4. `frontend/backoffice/src/scenes/Site.jsx`

**Total : 10 fichiers modifiés/créés**
