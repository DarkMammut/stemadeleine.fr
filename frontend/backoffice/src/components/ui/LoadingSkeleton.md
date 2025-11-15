# LoadingSkeleton

Composant réutilisable pour afficher des placeholders pendant le chargement.

Usage

```jsx
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

// Cards
<LoadingSkeleton variant="card" count={6} size="md" />

// List
<LoadingSkeleton variant="list" count={5} />

// Panel
<LoadingSkeleton variant="panel" />

// Tree
<LoadingSkeleton variant="tree" count={4} />
```

Props

- `variant` : 'card' | 'list' | 'panel' | 'tree' (par défaut 'card')
- `count` : nombre d'éléments à afficher (par défaut 3)
- `size` : 'sm' | 'md' | 'lg' (par défaut 'md')
- `className` : classes CSS supplémentaires

Notes

- Ce composant utilise `animate-pulse` (Tailwind) pour l'effet de pulse.
- Il fonctionne bien pour remplacer des listes de cartes, des lignes, des panneaux ou des arbres en attendant la réponse
  du backend.

