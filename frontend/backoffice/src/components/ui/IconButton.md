# IconButton - Documentation

## Description

Le composant `IconButton` est un bouton réutilisable qui combine une icône avec un label optionnel. Il supporte
plusieurs variantes de style, tailles, et un mode "hover-expand" où le label apparaît au survol.

## Import

```javascript
import IconButton from '@/components/ui/IconButton';
import { PencilIcon } from '@heroicons/react/24/outline';
```

## Props

| Prop          | Type                   | Défaut        | Description                            |
|---------------|------------------------|---------------|----------------------------------------|
| `icon`        | `Component`            | -             | Composant d'icône Heroicons (requis)   |
| `label`       | `string`               | -             | Texte du bouton (optionnel)            |
| `variant`     | `string`               | `'secondary'` | Variante de style du bouton            |
| `size`        | `'sm' \| 'md' \| 'lg'` | `'md'`        | Taille du bouton                       |
| `hoverExpand` | `boolean`              | `false`       | Le label apparaît au survol uniquement |
| `onClick`     | `function`             | -             | Gestionnaire de clic                   |
| `disabled`    | `boolean`              | `false`       | Désactive le bouton                    |
| `className`   | `string`               | -             | Classes CSS supplémentaires            |

### Variantes disponibles

Les mêmes que le composant `Button` :

- `primary` - Bouton principal (indigo)
- `secondary` - Bouton secondaire (gris)
- `danger` - Action destructive (rouge)
- `ghost` - Transparent avec hover
- `link` - Style de lien (bleu)
- `outline` - Bordure avec fond blanc
- `refresh` - Rafraîchissement (vert)
- `filter` - Filtre (bleu)

## Modes d'Utilisation

### 1. Bouton avec Icône et Label

Le mode standard affiche l'icône et le label côte à côte.

```javascript
import { PencilIcon } from '@heroicons/react/24/outline';

<IconButton
  icon={PencilIcon}
  label="Modifier"
  variant="primary"
  size="md"
  onClick={handleEdit}
/>
```

### 2. Icon-Only (Sans Label)

Quand aucun label n'est fourni, seule l'icône est affichée avec un padding réduit.

```javascript
import { TrashIcon } from '@heroicons/react/24/outline';

<IconButton
  icon={TrashIcon}
  variant="danger"
  size="sm"
  onClick={handleDelete}
/>
```

### 3. Hover-Expand

En mode `hoverExpand`, le label est masqué par défaut et apparaît au survol.

```javascript
import { PlusIcon } from '@heroicons/react/24/outline';

<IconButton
  icon={PlusIcon}
  label="Ajouter un élément"
  variant="primary"
  hoverExpand
  onClick={handleAdd}
/>
```

## Exemples

### Barre d'Actions

```javascript
import IconButton from '@/components/ui/IconButton';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

function ActionBar({ item }) {
  return (
    <div className="flex gap-2">
      <IconButton
        icon={EyeIcon}
        label="Voir"
        variant="secondary"
        hoverExpand
        onClick={() => viewItem(item)}
      />
      <IconButton
        icon={PencilIcon}
        label="Modifier"
        variant="primary"
        hoverExpand
        onClick={() => editItem(item)}
      />
      <IconButton
        icon={DocumentDuplicateIcon}
        label="Dupliquer"
        variant="secondary"
        hoverExpand
        onClick={() => duplicateItem(item)}
      />
      <IconButton
        icon={TrashIcon}
        label="Supprimer"
        variant="danger"
        hoverExpand
        onClick={() => deleteItem(item)}
      />
    </div>
  );
}
```

### Toolbar avec Tailles Différentes

```javascript
// Petits boutons pour une toolbar compacte
<div className="flex gap-1">
  <IconButton icon={BoldIcon} size="sm" variant="ghost"/>
  <IconButton icon={ItalicIcon} size="sm" variant="ghost"/>
  <IconButton icon={UnderlineIcon} size="sm" variant="ghost"/>
</div>

// Boutons moyens pour actions principales
<div className="flex gap-2">
  <IconButton icon={SaveIcon} label="Enregistrer" size="md" variant="primary"/>
  <IconButton icon={XMarkIcon} label="Annuler" size="md" variant="secondary"/>
</div>

// Grands boutons pour actions importantes
<IconButton
  icon={CloudArrowUpIcon}
  label="Publier"
  size="lg"
  variant="primary"
/>
```

### Liste d'Éléments avec Actions

```javascript
function ItemList({ items }) {
  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
          <div>
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.description}</p>
          </div>

          <div className="flex gap-2">
            <IconButton
              icon={PencilIcon}
              label="Modifier"
              variant="secondary"
              size="sm"
              hoverExpand
              onClick={() => handleEdit(item.id)}
            />
            <IconButton
              icon={TrashIcon}
              variant="danger"
              size="sm"
              onClick={() => handleDelete(item.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Boutons de Navigation

```javascript
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="flex items-center gap-4">
      <IconButton
        icon={ArrowLeftIcon}
        label="Précédent"
        variant="outline"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      />

      <span className="text-sm text-gray-600">
        Page {page} sur {totalPages}
      </span>

      <IconButton
        icon={ArrowRightIcon}
        label="Suivant"
        variant="outline"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      />
    </div>
  );
}
```

## Icônes Recommandées

Utilisez les icônes de [Heroicons](https://heroicons.com/) :

```javascript
// Actions communes
import {
  PencilIcon,        // Modifier
  TrashIcon,         // Supprimer
  PlusIcon,          // Ajouter
  XMarkIcon,         // Fermer/Annuler
  CheckIcon,         // Valider
  ArrowPathIcon,     // Rafraîchir
  MagnifyingGlassIcon, // Rechercher
  FunnelIcon,        // Filtrer
  EyeIcon,           // Voir
  EyeSlashIcon,      // Masquer
  DocumentDuplicateIcon, // Dupliquer
  ArrowDownTrayIcon, // Télécharger
  ArrowUpTrayIcon,   // Uploader
  ShareIcon,         // Partager
  Cog6ToothIcon,     // Paramètres
  InformationCircleIcon, // Information
} from '@heroicons/react/24/outline';
```

## Accessibilité

Le composant gère automatiquement :

- Les attributs ARIA appropriés (hérite de `Button`)
- Le support du clavier
- Les états disabled
- Le focus visible

Pour améliorer l'accessibilité des boutons icon-only, ajoutez un `aria-label` :

```javascript
<IconButton
  icon={TrashIcon}
  variant="danger"
  onClick={handleDelete}
  aria-label="Supprimer l'élément"
/>
```

## Styling Personnalisé

Vous pouvez ajouter des classes Tailwind supplémentaires :

```javascript
<IconButton
  icon={SaveIcon}
  label="Enregistrer"
  variant="primary"
  className="shadow-lg hover:shadow-xl"
  onClick={handleSave}
/>
```

## Combinaison avec d'autres Composants

### Avec Tooltip

```javascript
import { Tooltip } from '@headlessui/react';

<Tooltip content="Modifier cet élément">
  <IconButton
    icon={PencilIcon}
    variant="secondary"
    onClick={handleEdit}
  />
</Tooltip>
```

### Dans un Menu Dropdown

```javascript
import { Menu } from '@headlessui/react';

<Menu>
  <Menu.Button as={IconButton} icon={EllipsisVerticalIcon} variant="ghost"/>
  <Menu.Items>
    <Menu.Item>
      {({ active }) => (
        <button className={active ? 'bg-gray-100' : ''}>
          Modifier
        </button>
      )}
    </Menu.Item>
  </Menu.Items>
</Menu>
```

## Best Practices

### ✅ À Faire

- Utiliser `hoverExpand` pour les barres d'actions compactes
- Fournir un `aria-label` pour les boutons icon-only
- Utiliser des icônes cohérentes dans toute l'application
- Grouper les boutons liés ensemble

```javascript
// ✅ Bon
<div className="flex gap-2">
  <IconButton icon={PencilIcon} label="Modifier" hoverExpand/>
  <IconButton icon={TrashIcon} label="Supprimer" hoverExpand/>
</div>
```

### ❌ À Éviter

- Ne pas mélanger icônes de styles différents (outline vs solid)
- Ne pas utiliser trop de variantes différentes dans un même groupe
- Ne pas oublier les états de chargement pour les actions asynchrones

```javascript
// ❌ Mauvais - mélange de styles
<IconButton icon={PencilIcon} variant="primary"/>
<IconButton icon={TrashIcon} variant="danger"/>
<IconButton icon={EyeIcon} variant="ghost"/>
<IconButton icon={ShareIcon} variant="link"/>

// ✅ Bon - cohérent
<IconButton icon={PencilIcon} variant="secondary" hoverExpand/>
<IconButton icon={TrashIcon} variant="secondary" hoverExpand/>
<IconButton icon={EyeIcon} variant="secondary" hoverExpand/>
```

## Gestion des États de Chargement

Bien que `IconButton` hérite du prop `loading` de `Button`, pour les actions asynchrones complexes, utilisez plutôt les
composants spécialisés comme `DeleteButton` ou `PublishButton`.

```javascript
// Pour des actions simples
const [loading, setLoading] = useState(false);

<IconButton
  icon={ArrowPathIcon}
  label="Rafraîchir"
  loading={loading}
  onClick={async () => {
    setLoading(true);
    await refreshData();
    setLoading(false);
  }}
/>

// Pour des suppressions, utilisez DeleteButton
import DeleteButton from '@/components/ui/DeleteButton';

<DeleteButton
  onDelete={deleteItem}
  confirmMessage="Supprimer ?"
  hoverExpand
/>
```

## Notes Techniques

### Gestion du Padding

Le composant ajuste automatiquement le padding :

- **Avec label** : Padding standard selon la taille
- **Icon-only** : Padding horizontal réduit pour un bouton plus compact
- **Hover-expand** : Transition fluide lors de l'apparition du label

### Tailles d'Icônes

Les icônes sont automatiquement dimensionnées selon le `size` du bouton :

- `sm` : 16x16px (h-4 w-4)
- `md` : 20x20px (h-5 w-5)
- `lg` : 24x24px (h-6 w-6)

## Support

Pour plus d'informations, consultez :

- [Documentation du composant Button](./Button.jsx)
- [Guide des Utilitaires](../../UTILITIES_GUIDE.md)
- [Heroicons](https://heroicons.com/)

