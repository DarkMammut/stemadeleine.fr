# IconButton

Composant bouton avec icône et texte, wrapper autour du composant `Button` existant.

## Utilisation

```jsx
import IconButton from '@/components/ui/IconButton';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

function MyComponent() {
  return (
    <div className="flex gap-2">
      <IconButton
        icon={PencilIcon}
        label="Modifier"
        variant="secondary"
        size="sm"
        onClick={handleEdit}
      />

      <IconButton
        icon={TrashIcon}
        label="Supprimer"
        variant="danger"
        size="sm"
        onClick={handleDelete}
      />
    </div>
  );
}
```

## Props

| Prop        | Type      | Défaut        | Description                                                            |
|-------------|-----------|---------------|------------------------------------------------------------------------|
| `icon`      | Component | -             | **Requis.** Le composant icône Heroicons à afficher                    |
| `label`     | string    | -             | **Requis.** Le texte à afficher à côté de l'icône                      |
| `variant`   | string    | `"secondary"` | Variante de couleur: `"primary"`, `"secondary"`, `"danger"`, `"ghost"` |
| `size`      | string    | `"md"`        | Taille du bouton: `"sm"`, `"md"`, `"lg"`                               |
| `onClick`   | function  | -             | Fonction appelée au clic                                               |
| `disabled`  | boolean   | `false`       | Désactive le bouton                                                    |
| `className` | string    | -             | Classes CSS supplémentaires                                            |

## Variantes

### Primary (Bleu)

```jsx
<IconButton icon={CheckIcon} label="Valider" variant="primary" />
```

### Secondary (Gris)

```jsx
<IconButton icon={PencilIcon} label="Modifier" variant="secondary" />
```

### Danger (Rouge)

```jsx
<IconButton icon={TrashIcon} label="Supprimer" variant="danger" />
```

### Ghost (Transparent)

```jsx
<IconButton icon={XMarkIcon} label="Fermer" variant="ghost" />
```

## Tailles

### Small

```jsx
<IconButton icon={PencilIcon} label="Modifier" size="sm" />
```

### Medium (défaut)

```jsx
<IconButton icon={PencilIcon} label="Modifier" size="md" />
```

### Large

```jsx
<IconButton icon={PencilIcon} label="Modifier" size="lg" />
```

## Caractéristiques

- ✅ Wrapper autour du composant `Button` existant
- ✅ Affiche une icône et du texte côte à côte
- ✅ Réutilise toutes les styles et comportements de `Button`
- ✅ Tailles d'icônes adaptatives selon la taille du bouton
- ✅ Support complet de l'accessibilité
- ✅ États hover, focus, et disabled

## Notes

- Le composant utilise un `flex` avec `gap-1.5` pour espacer l'icône et le texte
- Les tailles d'icônes sont automatiquement ajustées selon la prop `size`
- Toutes les autres props sont transmises au composant `Button` sous-jacent

