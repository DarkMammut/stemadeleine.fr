# BackButton intelligent - Documentation

## ✅ Implémentation terminée

Le composant `BackButton` a été amélioré pour s'afficher automatiquement uniquement dans les sous-pages, et a été
intégré dans le composant `Title`.

---

## 🎯 Fonctionnement

### Détection automatique des pages

Le BackButton détecte automatiquement si l'utilisateur est sur une **page principale** ou une **sous-page** :

**Pages principales** (BackButton caché) :

- `/pages`
- `/news`
- `/newsletters`
- `/users`
- `/contacts`
- `/sections`
- `/payments`

**Sous-pages** (BackButton visible) :

- `/pages/[pageId]` ✅
- `/news/[newsId]` ✅
- `/newsletters/[newsletterId]` ✅
- `/users/[userId]` ✅
- `/contacts/[contactId]` ✅
- `/sections/[sectionId]` ✅
- `/payments/[paymentId]` ✅

---

## 📦 Composant BackButton

### Props

| Prop        | Type     | Défaut    | Description                                                        |
|-------------|----------|-----------|--------------------------------------------------------------------|
| `to`        | string   | undefined | URL de destination (optionnel, utilise `router.back()` par défaut) |
| `label`     | string   | "Retour"  | Texte affiché sur le bouton                                        |
| `autoHide`  | boolean  | true      | Active/désactive le masquage automatique                           |
| `mainPages` | string[] | [...]     | Liste des pages principales où le bouton doit être caché           |

### Utilisation directe

```jsx
import BackButton from '@/components/ui/BackButton';

// Exemple 1 : Auto-hide activé (défaut)
<BackButton />

// Exemple 2 : Redirection spécifique
<BackButton to="/newsletters" />

// Exemple 3 : Label personnalisé
<BackButton label="Retour aux actualités" />

// Exemple 4 : Toujours visible (désactiver auto-hide)
<BackButton autoHide={false} />

// Exemple 5 : Pages principales personnalisées
<BackButton mainPages={['/dashboard', '/settings']} />
```

---

## 📦 Intégration dans Title

Le composant `Title` utilise maintenant automatiquement le `BackButton` avec auto-hide.

**Important :** Le BackButton s'affiche **même avec les breadcrumbs**. Il apparaît au-dessus des breadcrumbs pour offrir
une navigation cohérente dans toutes les sous-pages.

### Structure visuelle

```
← Retour                    (BackButton - auto-hide)
Pages > Accueil > Section   (Breadcrumbs)
─────────────────────────────
Titre de la page
```

### Props de Title

| Prop                 | Type    | Défaut    | Description                                       |
|----------------------|---------|-----------|---------------------------------------------------|
| `showBackButton`     | boolean | false     | Force l'affichage du bouton (désactive auto-hide) |
| `backTo`             | string  | undefined | URL de destination pour le BackButton             |
| `autoHideBackButton` | boolean | true      | Active/désactive l'auto-hide du BackButton        |
| ...autres props      | -       | -         | Props existantes (label, onPublish, etc.)         |

### Utilisation dans Title

```jsx
import Title from '@/components/Title';

// Exemple 1 : Auto-hide activé (défaut) - Visible uniquement dans les sous-pages
<Title label="Édition d'actualité" />

// Exemple 2 : Force l'affichage (même sur les pages principales)
<Title label="Configuration" showBackButton={true} />

// Exemple 3 : Avec redirection spécifique
<Title label="Édition" backTo="/newsletters" />

// Exemple 4 : Désactiver complètement le BackButton
<Title label="Tableau de bord" autoHideBackButton={false} showBackButton={false} />
```

---

## 🎨 Exemples concrets

### EditPage.jsx (Sous-page avec breadcrumbs)

```jsx
<Title
  label={pageData?.name || "Édition de page"}
  onPublish={handlePublishPage}
  showBreadcrumbs={!!pageData}
  breadcrumbs={breadcrumbs}
/>
```

**Résultat :**

- URL : `/pages/abc-123`
- BackButton **visible** ✅ (au-dessus des breadcrumbs)
- Breadcrumbs **visibles** ✅ (ex: "Pages > Accueil")
- Clic sur BackButton → `router.back()`
- Clic sur breadcrumb → Navigation vers la page

**Interface :**

```
← Retour
Pages > Accueil
─────────────────
Ma Page d'Accueil [Publier]
```

### Pages.jsx (Page principale)

```jsx
<Title label="Gestion des pages" />
```

**Résultat :**

- URL : `/pages`
- BackButton **caché** ❌

### EditNewsletters.jsx (Sous-page)

```jsx
<Title label="Édition de newsletter" />
```

**Résultat :**

- URL : `/newsletters/def-456`
- BackButton **visible** ✅
- Clic → Retour à `/newsletters`

---

## 🔄 Logique de détection

Le BackButton utilise `usePathname()` de Next.js pour détecter l'URL actuelle :

```javascript
const pathname = usePathname();

// Vérifie si on est sur une page principale
const isMainPage = mainPages.some(page => pathname === page);

if (isMainPage && autoHide) {
  return null; // Ne rien afficher
}
```

**Correspondance exacte** : Le pathname doit être **exactement** égal à une page principale.

**Exemples :**

- `/pages` → Match ✅ (caché)
- `/pages/abc` → Pas de match ❌ (visible)
- `/pages/abc/edit` → Pas de match ❌ (visible)

---

## ✨ Avantages

### 1. Automatique ✅

- Pas besoin de gérer manuellement la visibilité
- Fonctionne out-of-the-box dans toutes les sous-pages

### 2. Intelligent ✅

- Détecte automatiquement le contexte
- S'adapte à la structure de l'application

### 3. Configurable ✅

- Props pour personnaliser le comportement
- Peut être forcé visible ou caché si nécessaire

### 4. Cohérent ✅

- Même comportement partout dans l'application
- UX uniforme

---

## 📊 Comportement par page

| Page                  | URL                 | BackButton visible ? |
|-----------------------|---------------------|----------------------|
| **Pages principales** |
| Pages                 | `/pages`            | ❌ Non                |
| News                  | `/news`             | ❌ Non                |
| Newsletters           | `/newsletters`      | ❌ Non                |
| Users                 | `/users`            | ❌ Non                |
| Contacts              | `/contacts`         | ❌ Non                |
| Sections              | `/sections`         | ❌ Non                |
| Payments              | `/payments`         | ❌ Non                |
| **Sous-pages**        |
| EditPage              | `/pages/[id]`       | ✅ Oui                |
| EditNews              | `/news/[id]`        | ✅ Oui                |
| EditNewsletters       | `/newsletters/[id]` | ✅ Oui                |
| EditUser              | `/users/[id]`       | ✅ Oui                |
| EditContact           | `/contacts/[id]`    | ✅ Oui                |
| EditSection           | `/sections/[id]`    | ✅ Oui                |
| EditPayment           | `/payments/[id]`    | ✅ Oui                |

---

## 🛠️ Personnalisation

### Ajouter une nouvelle page principale

Si vous ajoutez une nouvelle page principale (ex: `/dashboard`) où le BackButton ne doit pas apparaître :

**Option 1 : Dans BackButton (global)**

```jsx
// BackButton.jsx
mainPages = [
  '/pages',
  '/news',
  '/newsletters',
  '/users',
  '/contacts',
  '/sections',
  '/payments',
  '/dashboard', // ← Ajouté
]
```

**Option 2 : Localement (pour une utilisation spécifique)**

```jsx
<BackButton mainPages={[...defaultPages, '/dashboard']} />
```

### Désactiver l'auto-hide pour une page

```jsx
// Dans EditSomething.jsx
<Title
  label="Édition"
  autoHideBackButton={false} // Désactive l'auto-hide
  showBackButton={true}       // Force l'affichage
/>
```

---

## 🎯 Style

Le BackButton utilise un style cohérent avec le reste de l'application :

```jsx
<button className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
  <ArrowLeftIcon className="w-5 h-5" />
  <span className="text-sm font-medium">{label}</span>
</button>
```

**Style :**

- Icône flèche gauche (ArrowLeftIcon)
- Texte gris qui devient noir au survol
- Transition fluide
- Taille de police cohérente (text-sm)

---

## 📝 Migration

### Anciennes pages utilisant showBackButton

**Avant :**

```jsx
<Title
  label="Édition"
  showBackButton={true}
  backTo="/pages"
/>
```

**Après :**

```jsx
// Plus besoin de showBackButton si on est dans une sous-page
<Title
  label="Édition"
  backTo="/pages" // Optionnel, router.back() par défaut
/>
```

Le BackButton s'affichera automatiquement si on est dans une sous-page !

---

## ✅ Conclusion

Le BackButton est maintenant :

- ✅ **Automatique** : Détecte les sous-pages
- ✅ **Intelligent** : S'affiche uniquement quand nécessaire
- ✅ **Intégré** : Fonctionne avec Title
- ✅ **Configurable** : Props pour personnaliser
- ✅ **Cohérent** : Même UX partout

Plus besoin de gérer manuellement la visibilité du bouton retour ! 🎉

