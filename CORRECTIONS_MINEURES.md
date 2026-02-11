# Corrections des problèmes mineurs

## 📝 Problèmes résolus

### 1. ✅ Arrondi de la bannière qui disparaît en production

**Problème :** L'arrondi en bas de la bannière de la page d'accueil était visible en développement mais disparaissait en
production.

**Cause :** La classe Tailwind `rounded-b-[50%]` ne fonctionnait pas correctement avec les classes de fond dynamiques et
était optimisée par le build de production.

**Solution :** Remplacement par un style CSS inline qui est garanti de fonctionner en production :

```typescript
// Dans Hero.tsx
const homeStyle = variant === 'home' ? {
    borderBottomLeftRadius: '50% 20%',
    borderBottomRightRadius: '50% 20%',
} : {};

<section
    className = {`${sectionClassBase} ${variant === 'home' ? homeClasses : defaultClasses}`
}
style = {homeStyle}
    >
```

### 2. ✅ Redirection du bouton Don vers HelloAsso

**Problème :** Le bouton Don menait vers `/association/don` (page inexistante) au lieu du site HelloAsso.

**Solution :** Modification des boutons Don dans Header et Navigation pour qu'ils mènent directement vers HelloAsso :

**Header.tsx :**

```typescript
<IconButton
    as = "a"
href = "https://www.helloasso.com/associations/les-amis-de-sainte-madeleine-de-la-jarrie/formulaires/2"
target = "_blank"
rel = "noopener noreferrer"
    // ... autres props
    / >
```

**Navigation.tsx (version mobile) :**

```typescript
<IconButton
    as = "a"
href = "https://www.helloasso.com/associations/les-amis-de-sainte-madeleine-de-la-jarrie/formulaires/2"
target = "_blank"
rel = "noopener noreferrer"
    // ... autres props
    / >
```

## 🔧 Fichiers modifiés

1. **`/frontend/stemadeleine/src/components/Hero.tsx`**
    - Ajout du style CSS inline pour l'arrondi
    - Suppression de la classe Tailwind défaillante

2. **`/frontend/stemadeleine/src/components/Header.tsx`**
    - Modification du bouton Don desktop pour HelloAsso
    - Changement de `as={Link}` vers `as="a"` avec lien externe

3. **`/frontend/stemadeleine/src/components/Navigation.tsx`**
    - Modification du bouton Don mobile pour HelloAsso
    - Changement de `as={Link}` vers `as="a"` avec lien externe

## 🎯 Résultats attendus

### Bannière d'accueil

- ✅ Arrondi visible et permanent en développement ET en production
- ✅ Style CSS inline garanti de ne pas être supprimé lors de l'optimisation

### Boutons Don

- ✅ Redirection directe vers le formulaire HelloAsso
- ✅ Ouverture dans un nouvel onglet (`target="_blank"`)
- ✅ Sécurité avec `rel="noopener noreferrer"`
- ✅ Fonctionne sur desktop (Header) et mobile (Navigation)

## 🧪 Tests recommandés

1. **Tester en développement :**
   ```bash
   cd frontend/stemadeleine
   npm run dev
   ```

2. **Tester en production :**
   ```bash
   cd frontend/stemadeleine
   npm run build
   npm run start
   ```

3. **Vérifications :**
    - Page d'accueil : vérifier que l'arrondi en bas de la bannière est visible
    - Desktop : cliquer sur le bouton Don dans le header → doit ouvrir HelloAsso
    - Mobile : ouvrir le menu hamburger, cliquer sur Don → doit ouvrir HelloAsso
    - Les liens doivent s'ouvrir dans un nouvel onglet

## 💡 Notes techniques

- **Arrondi :** Utilisation de `border-radius` CSS natif avec valeurs elliptiques (`50% 20%`) pour un effet identique à
  l'ancien site
- **Liens externes :** Utilisation de balises `<a>` natives au lieu de `Link` Next.js pour les liens externes
- **Sécurité :** Ajout de `rel="noopener noreferrer"` pour les liens externes
