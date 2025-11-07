# Composant PublicationInfoCard - Documentation

## Objectif

Composant réutilisable pour afficher les informations et le statut d'une publication (Newsletter, News, etc.) dans une
carte uniformisée.

## Création

Ce composant a été créé pour éviter la duplication de code entre `EditNewsletters` et `EditNews` qui avaient exactement
la même section d'informations.

## Structure

```jsx
<PublicationInfoCard
  title="Informations sur la publication"
  status={data.status}
  createdAt={data.createdAt}
  publishedDate={data.publishedDate}
  updatedAt={data.updatedAt}
  author={data.author}
  entityId={data.id}
  entityIdLabel="ID Publication"
  contentsCount={data.contents.length}
  onPublish={handlePublish}
  canPublish={data.status === "DRAFT"}
  isPublishing={saving}
/>
```

## Props

| Prop            | Type        | Défaut           | Description                                           |
|-----------------|-------------|------------------|-------------------------------------------------------|
| `title`         | string      | `"Informations"` | Titre de la carte                                     |
| `status`        | string      | -                | Statut de la publication (DRAFT, PUBLISHED)           |
| `createdAt`     | string/Date | -                | Date de création                                      |
| `publishedDate` | string/Date | -                | Date de publication (optionnel)                       |
| `updatedAt`     | string/Date | -                | Date de dernière modification                         |
| `author`        | object      | -                | Objet auteur avec `firstname` et `lastname`           |
| `entityId`      | string/UUID | -                | ID de l'entité                                        |
| `entityIdLabel` | string      | `"ID"`           | Label pour l'ID (ex: "ID Newsletter", "ID Actualité") |
| `contentsCount` | number      | `0`              | Nombre de contenus                                    |
| `onPublish`     | function    | -                | Callback appelé lors du clic sur "Publier"            |
| `canPublish`    | boolean     | `false`          | Si true, affiche le bouton "Publier"                  |
| `isPublishing`  | boolean     | `false`          | État de publication (désactive le bouton)             |

## Affichage

### Layout

```
┌─────────────────────────────────────────────────────┐
│ Titre                               [Publier]       │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Statut: [DRAFT]                                    │
│                                                     │
│ ID:              xxx-xxx-xxx     Auteur: John Doe  │
│ Créée le:        01/01/2025      Publiée le: ...   │
│ Modifiée le:     07/11/2025      Contenus: 3       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Changements par rapport à l'ancien code

#### ❌ Avant

- Statut séparé de la grille d'informations par une bordure (`border-t`)
- Statut dans une section à part avec `pt-4`
- Code dupliqué dans EditNewsletters et EditNews

#### ✅ Après

- Statut au-dessus de la grille d'informations
- **Pas de bordure** entre le statut et les informations
- Statut dans le même flux visuel (`space-y-4`)
- Code unique dans `PublicationInfoCard`

## Utilisation

### EditNewsletters.jsx

```jsx
import PublicationInfoCard from "@/components/PublicationInfoCard";

// ...

<PublicationInfoCard
  title="Informations sur la newsletter"
  status={newsletterData.status}
  createdAt={newsletterData.createdAt}
  publishedDate={newsletterData.publishedDate}
  updatedAt={newsletterData.updatedAt}
  author={newsletterData.author}
  entityId={newsletterData?.newsletterId || newsletterData?.id}
  entityIdLabel="ID Newsletter"
  contentsCount={newsletterData?.contents ? newsletterData.contents.length : 0}
  onPublish={handlePublish}
  canPublish={newsletterData.status === "DRAFT"}
  isPublishing={saving}
/>
```

### EditNews.jsx

```jsx
import PublicationInfoCard from "@/components/PublicationInfoCard";

// ...

<PublicationInfoCard
  title="Informations sur l'actualité"
  status={newsData.status}
  createdAt={newsData.createdAt}
  publishedDate={newsData.publishedDate}
  updatedAt={newsData.updatedAt}
  author={newsData.author}
  entityId={newsData?.newsId || newsData?.id}
  entityIdLabel="ID Actualité"
  contentsCount={newsData?.contents ? newsData.contents.length : 0}
  onPublish={handlePublish}
  canPublish={newsData.status === "DRAFT"}
  isPublishing={saving}
/>
```

## Avantages

### 1. Réutilisabilité ✅

- Un seul composant pour toutes les publications
- Facile à ajouter pour de nouveaux types (Events, Projets, etc.)

### 2. Cohérence ✅

- Affichage identique partout
- Modifications centralisées

### 3. Maintenabilité ✅

- Un seul endroit à modifier
- Moins de code dupliqué
- Plus facile à tester

### 4. Flexibilité ✅

- Props personnalisables
- Adapté à différents types de publications
- Extensible facilement

## Personnalisation

### Ajouter un nouveau champ

Si vous voulez ajouter un champ (par exemple "Catégorie"), il suffit de :

1. Ajouter la prop au composant

```jsx
export default function PublicationInfoCard({
                                              // ...existing props
                                              category,
                                            }) {
```

2. Ajouter l'affichage dans la grille

```jsx
{
  category && (
    <div>
      <span className="font-medium text-gray-900">Catégorie:</span>
      <span className="text-gray-500 ml-2">{category}</span>
    </div>
  )
}
```

3. Passer la prop depuis le parent

```jsx
<PublicationInfoCard
  category={data.category}
  // ...other props
/>
```

### Modifier le style

Pour changer le style globalement, modifier directement `PublicationInfoCard.jsx`.

Par exemple, pour changer la grille de 2 à 3 colonnes :

```jsx
<div className="grid grid-cols-3 gap-4 text-sm">
```

## Dépendances

- `StatusTag` - Pour afficher le badge de statut
- `Button` - Pour le bouton "Publier"

## Code réduit

### Avant (dans EditNewsletters)

~80 lignes de JSX dupliquées

### Après (avec PublicationInfoCard)

~15 lignes de JSX + 1 composant réutilisable

**Économie** : ~65 lignes par fichier × 2 fichiers = ~130 lignes de code en moins ! 🎉

## Migration

Si vous avez d'autres composants avec une section similaire :

1. Remplacer les imports

```jsx
// ❌ Retirer
import StatusTag from "@/components/ui/StatusTag";
import Button from "@/components/ui/Button";

// ✅ Ajouter
import PublicationInfoCard from "@/components/PublicationInfoCard";
```

2. Remplacer le JSX par le composant

```jsx
// ❌ Retirer toute la div avec les infos

// ✅ Ajouter
<PublicationInfoCard {...props} />
```

## Tests recommandés

- [ ] Vérifier l'affichage dans EditNewsletters
- [ ] Vérifier l'affichage dans EditNews
- [ ] Tester le bouton "Publier" (DRAFT uniquement)
- [ ] Vérifier que publishedDate est optionnel
- [ ] Vérifier l'affichage sans auteur
- [ ] Vérifier avec 0 contenus

## Conclusion

✅ **Composant créé et intégré avec succès !**

- Code DRY (Don't Repeat Yourself)
- Interface cohérente
- Facile à maintenir et étendre

