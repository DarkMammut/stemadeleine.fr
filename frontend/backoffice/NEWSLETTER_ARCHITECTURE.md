# Architecture Newsletter - Documentation

## Vue d'ensemble

Le système de newsletter est composé de deux entités distinctes dans le backend :

### 1. **Newsletter (Module)**

- **Endpoint Backend**: `/api/newsletters`
- **Hook Frontend**: `useModuleOperations` (hook générique pour tous les modules)
- **Composant**: `NewsletterModuleEditor.jsx`
- **Description**: Représente le module Newsletter qui peut être ajouté à une page pour afficher des newsletters
- **Variantes**:
    - `LAST3` - Affiche les 3 dernières newsletters
    - `ARCHIVE` - Affiche l'archive complète
    - `SUBSCRIPTION` - Formulaire d'inscription

### 2. **NewsletterPublication (Publications)**

- **Endpoint Backend**: `/api/newsletter-publication`
- **Hook Frontend**: `useNewsletterPublicationOperations`
- **Pages**:
    - `Newsletters.jsx` - Liste des publications
    - `EditNewsletters.jsx` - Édition d'une publication
- **Description**: Représente les publications individuelles de newsletters (les newsletters elles-mêmes)

## Hooks Disponibles

### `useNewsletterPublicationOperations`

Gérer les publications de newsletters (créer, modifier, publier des newsletters).

**Fonctions disponibles**:

- `getAllNewsletterPublications()` - Récupérer toutes les publications
- `getNewsletterPublicationById(id)` - Récupérer une publication par ID
- `getNewsletterPublicationByNewsletterId(newsletterId)` - Récupérer par ID du module
- `getPublishedNewsletters()` - Récupérer les publications publiques
- `createNewsletterPublication(data)` - Créer une nouvelle publication
- `updateNewsletterPublication(id, data)` - Mettre à jour une publication
- `updateNewsletterPublicationVisibility(id, isVisible)` - Changer la visibilité
- `setNewsletterPublicationMedia(id, mediaId)` - Définir le média principal
- `removeNewsletterPublicationMedia(id)` - Supprimer le média
- `publishNewsletterPublication(id)` - Publier la newsletter
- `deleteNewsletterPublication(id)` - Supprimer (soft delete)
- `createNewsletterContent(newsletterId, title)` - Créer un contenu

### `useModuleOperations`

Hook générique pour gérer tous les modules (y compris le module Newsletter).

**Utilisation pour les modules Newsletter**:

```javascript
const { updateModule, updateModuleVisibility, setModuleMedia } = useModuleOperations();
```

### ⚠️ `useNewsletterOperations` (DEPRECATED)

Ancien hook qui pointait vers `/api/newsletters` mais était utilisé pour les publications.
Ce hook n'est plus utilisé et peut être supprimé. Il a été remplacé par :

- `useNewsletterPublicationOperations` pour les publications
- `useModuleOperations` pour le module

## Structure des Données

### NewsletterPublication

```javascript
{
  id: UUID,
  newsletterId: UUID,
  name: String,
  title: String,
  description: String,
  isVisible: Boolean,
  status: 'DRAFT' | 'PUBLISHED',
  publishedDate: Date,
  media: Media,
  contents: Content[],
  author: User,
  createdAt: Date,
  updatedAt: Date
}
```

### Newsletter (Module)

```javascript
{
  id: UUID,
  name: String,
  title: String,
  description: String,
  variant: 'LAST3' | 'ARCHIVE' | 'SUBSCRIPTION',
  startDate: Date,
  isVisible: Boolean,
  media: Media
}
```

## Flux de Travail

### Créer et Publier une Newsletter

1. **Créer une publication** (`Newsletters.jsx`)
    - Utiliser `createNewsletterPublication()`
    - Définir le nom, titre et description

2. **Éditer la publication** (`EditNewsletters.jsx`)
    - Ajouter un média principal
    - Créer des contenus avec `NewsletterContentManager`
    - Modifier la visibilité

3. **Publier**
    - Cliquer sur "Publier la newsletter"
    - Utilise `publishNewsletterPublication()`
    - Change le status de DRAFT à PUBLISHED

4. **Afficher sur le site**
    - Ajouter un module Newsletter à une page
    - Configurer la variante (LAST3, ARCHIVE, etc.)
    - Les publications visibles et publiées s'affichent automatiquement

## Composants Liés

- `NewsletterCard.jsx` - Carte d'affichage d'une publication dans la liste
- `NewsletterContentManager.jsx` - Gestionnaire de contenus d'une publication
- `NewsletterModuleEditor.jsx` - Éditeur du module Newsletter
- `DeleteModal.jsx` - Modal de confirmation de suppression

## API Endpoints

### Publications

- `GET /api/newsletter-publication` - Liste toutes les publications
- `GET /api/newsletter-publication/{id}` - Récupère une publication
- `GET /api/newsletter-publication/newsletter/{newsletterId}` - Par module
- `GET /api/newsletter-publication/public` - Publications publiques
- `POST /api/newsletter-publication` - Créer
- `PUT /api/newsletter-publication/{id}` - Mettre à jour
- `PUT /api/newsletter-publication/{id}/visibility` - Visibilité
- `PUT /api/newsletter-publication/{id}/media` - Définir média
- `DELETE /api/newsletter-publication/{id}/media` - Supprimer média
- `PUT /api/newsletter-publication/{id}/publish` - Publier
- `DELETE /api/newsletter-publication/{id}` - Supprimer
- `POST /api/newsletter-publication/{newsletterId}/contents` - Créer contenu

### Module

- Utilise les endpoints génériques des modules : `/api/modules/*`

## Migration des Anciennes Références

Si vous voyez des références à `useNewsletterOperations` dans le code :

1. Pour les **publications**, remplacer par `useNewsletterPublicationOperations`
2. Pour le **module**, utiliser `useModuleOperations`

### Exemple de migration :

```javascript
// ❌ Ancien code
import { useNewsletterOperations } from "@/hooks/useNewsletterOperations";

const { getAllNewsletters, updateNewsletter } = useNewsletterOperations();

// ✅ Nouveau code
import { useNewsletterPublicationOperations } from "@/hooks/useNewsletterPublicationOperations";

const { getAllNewsletterPublications, updateNewsletterPublication } = useNewsletterPublicationOperations();
```

