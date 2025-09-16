# Système d'édition des modules - Documentation (Basé sur le backend Java)

## Vue d'ensemble

Le système d'édition des modules permet de créer et modifier différents types de modules de contenu avec des interfaces
spécialisées pour chaque type, basé sur l'architecture Java backend avec héritage de modules.

## Architecture Backend

Votre backend utilise un système d'héritage avec la classe `Module` comme classe parente et 8 classes spécialisées :

### Types de modules supportés (basés sur votre backend Java)

1. **News** - Modules d'actualités
    - Variants: LAST3 (par défaut)
    - Propriétés: description, startDate, endDate, media, contents[]

2. **Article** - Modules d'articles
    - Variants: STAGGERED (par défaut)
    - Propriétés: contents[]

3. **Gallery** - Modules de galeries
    - Variants: GRID (par défaut)
    - Propriétés: medias[]

4. **CTA** - Modules Call-to-Action
    - Variants: BUTTON (par défaut)
    - Propriétés: label, url

5. **Form** - Modules de formulaires
    - Propriétés: description (max 1000 chars), media, fields[]

6. **List** - Modules de listes
    - Variants: CARD (par défaut)
    - Propriétés: contents[]

7. **Timeline** - Modules de chronologie
    - Variants: TABS (par défaut)
    - Propriétés: contents[]

8. **Newsletter** - Modules de newsletters
    - Variants: LAST3 (par défaut, réutilise NewsVariants)
    - Propriétés: description, startDate, media, contents[]

## Architecture Frontend

### Structure des fichiers créés

```
/app/pages/[pageId]/sections/[sectionId]/modules/[moduleId]/page.js - Page principale
/scenes/EditModule.jsx - Orchestrateur principal avec mapping des types
/hooks/
  ├── useGetModule.js - Récupération des données module
  ├── useAddModule.js - CRUD modules
  └── useModuleOperations.js - Opérations spécifiques (visibilité, médias, ordre)
/components/modules/ - Composants spécialisés par type
  ├── NewsModuleEditor.jsx - Actualités avec dates et médias
  ├── ArticleModuleEditor.jsx - Articles avec contenus multiples
  ├── GalleryModuleEditor.jsx - Galeries avec médias multiples
  ├── CTAModuleEditor.jsx - Boutons/liens d'action
  ├── FormModuleEditor.jsx - Formulaires avec champs personnalisés
  ├── ListModuleEditor.jsx - Listes avec contenus multiples
  ├── TimelineModuleEditor.jsx - Chronologies avec événements
  └── NewsletterModuleEditor.jsx - Newsletters avec contenus et médias
```

## Mapping automatique des types

Le système utilise le mapping suivant dans `EditModule.jsx` :

```javascript
const MODULE_COMPONENTS = {
    news: NewsModuleEditor,
    article: ArticleModuleEditor,
    gallery: GalleryModuleEditor,
    cta: CTAModuleEditor,
    form: FormModuleEditor,
    list: ListModuleEditor,
    timeline: TimelineModuleEditor,
    newsletter: NewsletterModuleEditor,
};
```

## Propriétés communes (héritées de Module.java)

Tous les modules héritent de :

- `id` (UUID)
- `moduleId` (UUID)
- `version` (Integer)
- `section` (relation ManyToOne)
- `name` (String, required)
- `title` (String, required)
- `type` (String, required)
- `sortOrder` (Integer)
- `isVisible` (Boolean, default: true)
- `status` (PublishingStatus enum, default: DRAFT)
- `author` (User, required)
- `createdAt` / `updatedAt` (timestamps)

## API requise (basée sur votre architecture Java)

- `GET /api/modules/{moduleId}` - Récupérer un module avec ses données spécialisées
- `PUT /api/modules/{moduleId}` - Mettre à jour un module
- `PUT /api/modules/{moduleId}/visibility` - Changer la visibilité
- `PUT /api/modules/{moduleId}/media` - Associer un média (pour News, Form, Newsletter)
- `DELETE /api/modules/{moduleId}` - Supprimer un module

## Fonctionnalités à implémenter

Les composants incluent des placeholders pour :

- **Gestionnaire de contenus multiples** (Article, News, List, Timeline, Newsletter)
- **Gestionnaire de médias multiples** (Gallery)
- **Éditeur de champs de formulaire** (Form)
- **Gestionnaire d'événements chronologiques** (Timeline)

## Navigation

Route : `/pages/[pageId]/sections/[sectionId]/modules/[moduleId]`

## Comment étendre le système

Pour ajouter un nouveau type de module (par exemple "Video") :

1. **Backend** : Créer une classe qui hérite de `Module`
2. **Frontend** : Créer `VideoModuleEditor.jsx`
3. **Mapping** : Ajouter dans `MODULE_COMPONENTS`
4. **Import** : Importer dans `EditModule.jsx`
