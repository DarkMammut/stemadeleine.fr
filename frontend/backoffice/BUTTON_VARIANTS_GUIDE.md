# Guide Visuel des Variantes de Boutons

## Vue d'ensemble

Ce document présente toutes les variantes de boutons disponibles dans l'application avec leurs cas d'usage recommandés.

## Variantes disponibles

### 🟣 Primary (Indigo)

**Couleur:** `bg-indigo-600` → `hover:bg-indigo-500`  
**Usage:** Actions principales, soumissions de formulaires  
**Exemples:**

- Enregistrer
- Créer
- Ajouter
- Soumettre

```jsx
<Button variant="primary" size="md">
  Enregistrer
</Button>

<IconButton
  icon={PlusIcon}
  label="Ajouter"
  variant="primary"
/>
```

---

### ⚪ Secondary (Gris)

**Couleur:** `bg-gray-200` → `hover:bg-gray-300`  
**Usage:** Actions secondaires, modifications  
**Exemples:**

- Modifier
- Éditer
- Voir détails

```jsx
<Button variant="secondary" size="md">
  Modifier
</Button>

<IconButton
  icon={PencilIcon}
  label="Modifier"
  variant="secondary"
/>
```

---

### 🔴 Danger (Rouge)

**Couleur:** `bg-red-600` → `hover:bg-red-500`  
**Usage:** Actions destructives  
**Exemples:**

- Supprimer
- Effacer
- Désactiver définitivement

```jsx
<Button variant="danger" size="md">
  Supprimer
</Button>

<IconButton
  icon={TrashIcon}
  label="Supprimer"
  variant="danger"
/>
```

---

### ⬜ Outline (Blanc avec bordure)

**Couleur:** `bg-white` avec `ring-gray-300` → `hover:bg-gray-50`  
**Usage:** Boutons d'annulation, actions secondaires non colorées  
**Exemples:**

- Annuler
- Fermer
- Retour

```jsx
<Button variant="outline" size="md">
  Annuler
</Button>
```

**Utilisé dans:**

- Formulaires (MyForm)
- Modales (DeleteModal)

---

### 👻 Ghost (Transparent)

**Couleur:** `bg-transparent` → `hover:bg-gray-100`  
**Usage:** Actions subtiles, liens-boutons  
**Exemples:**

- Liens d'action discrets
- Boutons dans des zones déjà colorées

```jsx
<Button variant="ghost" size="sm">
  Voir plus
</Button>
```

---

### 🟢 Refresh (Vert)

**Couleur:** `bg-green-600` → `hover:bg-green-500`  
**Usage:** Actualisation de données, synchronisation  
**Exemples:**

- Actualiser
- Rafraîchir
- Synchroniser
- Actualiser HelloAsso

```jsx
<Button variant="refresh" size="md">
  Actualiser
</Button>

// Avec icône dans Utilities
{
  icon: ArrowPathIcon,
    label
:
  "Actualiser HelloAsso",
    callback
:
  handleImport,
    variant
:
  "refresh",
}
```

**Utilisé dans:**

- `Contacts.jsx` - Bouton "Actualiser"
- `Users.jsx` - Bouton "Actualiser HelloAsso"
- `Payments.jsx` - Bouton "Actualiser HelloAsso"

---

### 🔵 Filter (Bleu)

**Couleur:** `bg-blue-600` → `hover:bg-blue-500`  
**Usage:** Filtrage de données, affichage conditionnel  
**Exemples:**

- Filtrer
- Afficher tous/certains
- Trier

```jsx
<Button variant="filter" size="md">
  Filtrer
</Button>

// Avec icône dans Utilities
{
  icon: FunnelIcon,
    label
:
  "Filtre: Tous",
    callback
:
  handleFilter,
    variant
:
  "filter",
}
```

**Utilisé dans:**

- `Contacts.jsx` - Bouton "Filtre: Tous/Non lus/Lus"
- `Users.jsx` - Bouton "Afficher adhérents/Afficher tous"

---

## Matrice de décision

| Si vous voulez...       | Utilisez   | Variante    |
|-------------------------|------------|-------------|
| Soumettre un formulaire | Button     | `primary`   |
| Modifier quelque chose  | IconButton | `secondary` |
| Supprimer quelque chose | IconButton | `danger`    |
| Annuler une action      | Button     | `outline`   |
| Actualiser des données  | Button     | `refresh`   |
| Filtrer des résultats   | Button     | `filter`    |
| Action discrète         | Button     | `ghost`     |

---

## Combinaisons avec les tailles

### Small (sm)

- Utilisé dans les arbres draggables (DraggableTree)
- Utilisé dans les barres d'outils compactes
- `px-2.5 py-1.5 text-sm`

### Medium (md) - **Recommandé**

- Utilisé dans les formulaires
- Utilisé dans les utilitaires (Utilities)
- Utilisé dans les modales
- `px-3 py-2 text-sm`

### Large (lg)

- Actions très importantes
- Pages d'accueil ou landing
- `px-4 py-2.5 text-base`

---

## Exemples par contexte

### Dans un formulaire (MyForm)

```jsx
<Button variant="outline" size="md">Annuler</Button>
<Button variant="primary" size="md">Enregistrer</Button>
```

### Dans une modale de confirmation (DeleteModal)

```jsx
<Button variant="outline" size="md">Annuler</Button>
<Button variant="danger" size="md">Supprimer</Button>
```

### Dans une carte de détails

```jsx
<IconButton icon={PencilIcon} label="Modifier" variant="secondary" />
<IconButton icon={TrashIcon} label="Supprimer" variant="danger" />
```

### Dans une barre d'outils (Utilities)

```jsx
<Utilities
  actions={[
    {
      icon: PlusIcon,
      label: "Ajouter",
      callback: handleAdd,
      variant: "primary",
    },
    {
      icon: ArrowPathIcon,
      label: "Actualiser",
      callback: handleRefresh,
      variant: "refresh",
    },
    {
      icon: FunnelIcon,
      label: "Filtrer",
      callback: handleFilter,
      variant: "filter",
    },
  ]}
/>
```

### Dans un arbre draggable (DraggableTree)

```jsx
<IconButton icon={PencilIcon} label="Modifier" variant="secondary" size="sm" />
<IconButton icon={TrashIcon} label="Supprimer" variant="danger" size="sm" />
```

---

## Accessibilité

Toutes les variantes incluent :

- ✅ Support du focus clavier
- ✅ États visuels clairs (hover, focus, disabled)
- ✅ Indicateur de chargement (`loading` prop)
- ✅ Désactivation visuelle (`disabled` prop)
- ✅ Transitions fluides

---

## Bonnes pratiques

### ✅ À FAIRE

- Utiliser `primary` pour l'action principale d'une page/section
- Utiliser `danger` uniquement pour les actions destructives
- Utiliser `refresh` pour toutes les actualisations de données
- Utiliser `filter` pour tous les filtres
- Être cohérent dans toute l'application

### ❌ À ÉVITER

- Plusieurs boutons `primary` dans la même zone
- Utiliser `danger` pour des actions non destructives
- Mélanger les styles (certains boutons avec composant, d'autres en HTML brut)
- Tailles incohérentes dans le même contexte

---

## Icônes recommandées (Heroicons 24/outline)

| Action     | Icône           | Variante      |
|------------|-----------------|---------------|
| Ajouter    | `PlusIcon`      | primary       |
| Modifier   | `PencilIcon`    | secondary     |
| Supprimer  | `TrashIcon`     | danger        |
| Actualiser | `ArrowPathIcon` | refresh       |
| Filtrer    | `FunnelIcon`    | filter        |
| Fermer     | `XMarkIcon`     | ghost/outline |
| Valider    | `CheckIcon`     | primary       |
| Annuler    | `XMarkIcon`     | outline       |

---

## Conclusion

Ce guide visuel vous aide à choisir la bonne variante de bouton pour chaque situation. La cohérence dans l'utilisation
des variantes améliore grandement l'expérience utilisateur en créant des patterns visuels prévisibles.

