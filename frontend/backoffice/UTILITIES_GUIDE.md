# Guide d'utilisation du composant Utilities avec boutons spécialisés

## Vue d'ensemble

Le composant `Utilities` a été amélioré pour utiliser automatiquement les boutons spécialisés en fonction du `variant`
spécifié. Plus besoin d'importer séparément `RefreshButton`, `PublishButton`, etc. !

## Boutons spécialisés disponibles

### 1. RefreshButton (variant="refresh")

Bouton d'actualisation avec icône qui tourne pendant le chargement.

```jsx
<Utilities
  actions={[
    {
      variant: "refresh",
      label: "Actualiser HelloAsso",
      callback: handleImportHelloAsso,
      hoverExpand: true, // Optionnel: label apparaît au survol
    },
  ]}
/>
```

**Fonctionnalités :**

- ✨ Icône de flèche qui tourne pendant le chargement
- ✅ Affiche un flag "Actualisé" après succès (2 secondes)
- 🎯 Support du mode `hoverExpand`

### 2. PublishButton (variant="publish")

Bouton de publication avec feedback de succès.

```jsx
<Utilities
  actions={[
    {
      variant: "publish",
      label: "Publier",
      callback: handlePublish,
    },
  ]}
/>
```

**Fonctionnalités :**

- 📤 Icône CloudArrowUpIcon
- ✅ Affiche un flag "À jour" après succès
- 🔄 Revient à l'état initial après 3 secondes

### 3. DownloadButton (variant="download")

Bouton de téléchargement avec feedback.

```jsx
<Utilities
  actions={[
    {
      variant: "download",
      label: "Télécharger",
      callback: handleDownload,
      hoverExpand: true,
    },
  ]}
/>
```

**Fonctionnalités :**

- 💾 Icône ArrowDownTrayIcon
- ✅ Affiche "Téléchargé" après succès
- 🎯 Support du mode `hoverExpand`

### 4. DeleteButton (variant="delete")

Bouton de suppression avec confirmation intégrée.

```jsx
<Utilities
  actions={[
    {
      variant: "delete",
      label: "Supprimer",
      callback: handleDelete,
    },
  ]}
/>
```

**Fonctionnalités :**

- 🗑️ Icône TrashIcon
- ⚠️ Modal de confirmation automatique
- ⚡ Gestion du loading state

### 5. SendButton (variant="send")

Bouton d'envoi (email, message, etc.).

```jsx
<Utilities
  actions={[
    {
      variant: "send",
      label: "Envoyer",
      callback: handleSend,
    },
  ]}
/>
```

**Fonctionnalités :**

- 📧 Icône PaperAirplaneIcon
- ✅ Affiche "Envoyé" après succès
- 🔄 Feedback visuel de succès

### 6. Bouton générique (aucun variant spécial)

Pour tous les autres cas, utilisez un bouton classique avec icône personnalisée.

```jsx
<Utilities
  actions={[
    {
      icon: PlusIcon,
      label: "Nouveau",
      callback: handleCreate,
      variant: "primary", // ou "secondary", "danger", etc.
    },
  ]}
/>
```

## Exemples d'utilisation

### Exemple complet : Page Payments

```jsx
<Utilities
  actions={[
    {
      icon: PlusIcon,
      label: "Nouveau Paiement",
      callback: handleCreatePayment,
    },
    {
      variant: "refresh",
      label: "Actualiser HelloAsso",
      callback: handleImportHelloAsso,
      hoverExpand: true,
    },
  ]}
/>
```

### Exemple : Page Users

```jsx
<Utilities
  actions={[
    {
      icon: PlusIcon,
      label: "Nouvel Utilisateur",
      callback: handleCreateUser,
    },
    {
      variant: "refresh",
      label: "Actualiser HelloAsso",
      callback: handleImportHelloAsso,
      hoverExpand: true,
    },
    {
      icon: FunnelIcon,
      label: showAdherentsOnly ? "Afficher tous" : "Afficher adhérents",
      callback: handleToggleAdherents,
      variant: "filter",
    },
  ]}
/>
```

### Exemple : Campaigns

```jsx
<Utilities
  actions={[
    {
      variant: "refresh",
      label: "Actualiser HelloAsso",
      callback: handleImportHelloAsso,
    },
  ]}
/>
```

## Props des actions

### Props communes à tous les boutons

| Prop       | Type     | Description                                    | Défaut      |
|------------|----------|------------------------------------------------|-------------|
| `variant`  | string   | Type de bouton spécialisé ou variant classique | `"primary"` |
| `label`    | string   | Texte du bouton                                | Requis      |
| `callback` | function | Fonction appelée au clic                       | Requis      |
| `disabled` | boolean  | Désactive le bouton                            | `false`     |
| `size`     | string   | Taille: "sm", "md", "lg"                       | `"sm"`      |

### Props spécifiques aux boutons spécialisés

| Prop          | Boutons concernés | Description                            |
|---------------|-------------------|----------------------------------------|
| `hoverExpand` | refresh, download | Le label apparaît au survol uniquement |

### Props pour boutons génériques uniquement

| Prop   | Type      | Description                |
|--------|-----------|----------------------------|
| `icon` | Component | Icône Heroicons à afficher |

## Avantages de cette approche

### ✅ Simplicité

- Un seul composant `Utilities` pour tous les boutons
- Pas besoin d'importer chaque type de bouton séparément
- Code plus concis et lisible

### 🎨 Cohérence visuelle

- Tous les boutons du même type ont le même comportement
- Animations et feedbacks uniformes
- UX cohérente dans toute l'application

### 🔧 Maintenabilité

- Changements centralisés dans `Utilities`
- Facile d'ajouter de nouveaux types de boutons
- Réutilisation maximale du code

### 🚀 Performance

- Chargement lazy des composants spécialisés
- Pas de re-renders inutiles
- Code optimisé

## Migration depuis l'ancienne version

### Avant

```jsx
import RefreshButton from "@/components/ui/RefreshButton";

<div className="flex items-center justify-between">
  <Utilities actions={[...]} />
  <RefreshButton
    onRefresh={handleRefresh}
    refreshLabel="Actualiser"
  />
</div>
```

### Après

```jsx
<Utilities
  actions={[
    // ... autres actions
    {
      variant: "refresh",
      label: "Actualiser",
      callback: handleRefresh,
    },
  ]}
/>
```

## Notes importantes

1. **Ordre des boutons** : Les boutons apparaissent dans l'ordre du tableau `actions`
2. **Gestion d'état** : Chaque bouton spécialisé gère son propre état (loading, success)
3. **Callbacks async** : Tous les callbacks peuvent être asynchrones
4. **Erreurs** : Les erreurs sont loggées dans la console automatiquement

## Boutons disponibles par variant

| Variant      | Composant utilisé | Icône                  | Couleur       |
|--------------|-------------------|------------------------|---------------|
| `"refresh"`  | RefreshButton     | ArrowPathIcon (tourne) | Secondary     |
| `"publish"`  | PublishButton     | CloudArrowUpIcon       | Primary       |
| `"download"` | DownloadButton    | ArrowDownTrayIcon      | Secondary     |
| `"delete"`   | DeleteButton      | TrashIcon              | Danger        |
| `"send"`     | SendButton        | PaperAirplaneIcon      | Primary       |
| Autre        | Button            | Custom                 | Selon variant |

