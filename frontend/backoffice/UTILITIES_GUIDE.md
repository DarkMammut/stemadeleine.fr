# Guide des Utilitaires et Composants - Backoffice

Ce guide détaille tous les composants et utilitaires réutilisables du backoffice.

---

## Table des Matières

1. [Système de Notifications](#système-de-notifications)
2. [Modales](#modales)
3. [Boutons](#boutons)
4. [Gestion des Médias](#gestion-des-médias)
5. [Composants UI de Base](#composants-ui-de-base)
6. [Hooks Personnalisés](#hooks-personnalisés)
7. [Utilitaires](#utilitaires)

---

## Système de Notifications

### Hook `useNotification`

**Fichier** : `src/hooks/useNotification.js`

Gère l'état et l'affichage des notifications dans l'application.

#### Utilisation

```javascript
import { useNotification } from '@/hooks/useNotification';
import Notification from '@/components/Notification';

function MyComponent() {
  const {
    notification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    hideNotification
  } = useNotification();

  const handleSave = async () => {
    try {
      await saveData();
      showSuccess("Enregistré avec succès", "Vos modifications ont été sauvegardées");
    } catch (error) {
      showError("Erreur de sauvegarde", error.message);
    }
  };

  return (
    <>
      <button onClick={handleSave}>Enregistrer</button>

      <Notification
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={hideNotification}
      />
    </>
  );
}
```

#### API du Hook

| Méthode                                  | Paramètres                                      | Description                              |
|------------------------------------------|-------------------------------------------------|------------------------------------------|
| `showSuccess(title, message)`            | `title: string, message?: string`               | Affiche une notification de succès       |
| `showError(title, message)`              | `title: string, message?: string`               | Affiche une notification d'erreur        |
| `showInfo(title, message)`               | `title: string, message?: string`               | Affiche une notification d'information   |
| `showWarning(title, message)`            | `title: string, message?: string`               | Affiche une notification d'avertissement |
| `hideNotification()`                     | -                                               | Masque la notification                   |
| `showNotification(type, title, message)` | `type: string, title: string, message?: string` | Méthode générique                        |

### Composant `Notification`

**Fichier** : `src/components/Notification.jsx`

Affiche une notification avec icône, titre et message optionnel.

#### Props

| Prop        | Type                                          | Défaut      | Description                       |
|-------------|-----------------------------------------------|-------------|-----------------------------------|
| `show`      | `boolean`                                     | `true`      | Affiche/masque la notification    |
| `type`      | `'success' \| 'error' \| 'info' \| 'warning'` | `'success'` | Type de notification              |
| `title`     | `string`                                      | -           | Titre de la notification (requis) |
| `message`   | `string`                                      | -           | Message détaillé (optionnel)      |
| `onClose`   | `function`                                    | -           | Callback appelé à la fermeture    |
| `autoClose` | `boolean`                                     | `true`      | Fermeture automatique             |
| `duration`  | `number`                                      | `3000`      | Durée avant fermeture (ms)        |

#### Types de Notifications

| Type      | Couleur | Icône               | Usage          |
|-----------|---------|---------------------|----------------|
| `success` | Vert    | CheckCircle         | Action réussie |
| `error`   | Rouge   | XCircle             | Erreur         |
| `info`    | Bleu    | InformationCircle   | Information    |
| `warning` | Jaune   | ExclamationTriangle | Avertissement  |

#### Exemple Complet

```javascript
<Notification
  show={true}
  type="success"
  title="Opération réussie"
  message="Les données ont été enregistrées avec succès"
  onClose={() => console.log('Notification fermée')}
  autoClose={true}
  duration={5000}
/>
```

---

## Modales

### `ConfirmModal`

**Fichier** : `src/components/ConfirmModal.jsx`

Modale de confirmation générique pour les actions sensibles.

#### Props

| Prop           | Type                    | Défaut                 | Description                       |
|----------------|-------------------------|------------------------|-----------------------------------|
| `open`         | `boolean`               | -                      | État d'ouverture (requis)         |
| `onClose`      | `function`              | -                      | Callback de fermeture (requis)    |
| `onConfirm`    | `function`              | -                      | Callback de confirmation (requis) |
| `title`        | `string`                | `"Confirmer l'action"` | Titre de la modale                |
| `message`      | `string`                | `"Êtes-vous sûr..."`   | Message de confirmation           |
| `confirmLabel` | `string`                | `"Confirmer"`          | Label du bouton de confirmation   |
| `cancelLabel`  | `string`                | `"Annuler"`            | Label du bouton d'annulation      |
| `isLoading`    | `boolean`               | `false`                | État de chargement                |
| `variant`      | `'danger' \| 'primary'` | `'danger'`             | Variante du bouton                |

#### Exemple d'Utilisation

```javascript
import { useState } from 'react';
import ConfirmModal from '@/components/ConfirmModal';

function MyComponent() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteItem();
      setShowConfirm(false);
      showSuccess("Supprimé");
    } catch (error) {
      showError("Erreur", error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>Supprimer</button>

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer l'élément"
        message="Cette action est irréversible. Continuer ?"
        confirmLabel="Supprimer définitivement"
        cancelLabel="Annuler"
        isLoading={isDeleting}
        variant="danger"
      />
    </>
  );
}
```

### `DeleteModal`

**Fichier** : `src/components/DeleteModal.jsx`

Modale spécialisée pour les suppressions (wrapper de ConfirmModal).

---

## Boutons

### `Button`

**Fichier** : `src/components/ui/Button.jsx`

Composant de bouton de base avec plusieurs variantes et tailles.

#### Props

| Prop        | Type                                                                                              | Défaut      | Description                 |
|-------------|---------------------------------------------------------------------------------------------------|-------------|-----------------------------|
| `variant`   | `'primary' \| 'secondary' \| 'danger' \| 'ghost' \| 'link' \| 'outline' \| 'refresh' \| 'filter'` | `'primary'` | Style du bouton             |
| `size`      | `'sm' \| 'md' \| 'lg'`                                                                            | `'md'`      | Taille du bouton            |
| `loading`   | `boolean`                                                                                         | `false`     | État de chargement          |
| `disabled`  | `boolean`                                                                                         | `false`     | Désactive le bouton         |
| `as`        | `string`                                                                                          | `'button'`  | Élément HTML à rendre       |
| `className` | `string`                                                                                          | -           | Classes CSS supplémentaires |

#### Variantes

```javascript
// Bouton principal (action primaire)
<Button variant="primary">Enregistrer</Button>

// Bouton secondaire
<Button variant="secondary">Annuler</Button>

// Bouton dangereux (suppression, etc.)
<Button variant="danger">Supprimer</Button>

// Bouton fantôme (transparent)
<Button variant="ghost">Options</Button>

// Bouton lien
<Button variant="link">En savoir plus</Button>

// Bouton avec bordure
<Button variant="outline">Paramètres</Button>

// Bouton de rafraîchissement
<Button variant="refresh">Actualiser</Button>

// Bouton de filtre
<Button variant="filter">Filtrer</Button>
```

#### Tailles

```javascript
<Button size="sm">Petit</Button>
<Button size="md">Moyen</Button>
<Button size="lg">Grand</Button>
```

#### État de Chargement

```javascript
const [loading, setLoading] = useState(false);

<Button loading={loading} onClick={async () => {
  setLoading(true);
  await performAction();
  setLoading(false);
}}>
  Enregistrer
</Button>
```

### `IconButton`

**Fichier** : `src/components/ui/IconButton.jsx`

Bouton avec icône, label optionnel, et mode hover-expand.

#### Props

| Prop          | Type        | Défaut        | Description                          |
|---------------|-------------|---------------|--------------------------------------|
| `icon`        | `Component` | -             | Composant d'icône Heroicons (requis) |
| `label`       | `string`    | -             | Texte du bouton (optionnel)          |
| `variant`     | `string`    | `'secondary'` | Même que Button                      |
| `size`        | `string`    | `'md'`        | Taille du bouton                     |
| `hoverExpand` | `boolean`   | `false`       | Label apparaît au survol             |
| `onClick`     | `function`  | -             | Gestionnaire de clic                 |
| `disabled`    | `boolean`   | `false`       | Désactive le bouton                  |
| `className`   | `string`    | -             | Classes CSS supplémentaires          |

#### Exemples

```javascript
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

// Avec icône et label
<IconButton
  icon={PencilIcon}
  label="Modifier"
  variant="primary"
  onClick={handleEdit}
/>

// Icon-only (sans label)
<IconButton
  icon={TrashIcon}
  variant="danger"
  onClick={handleDelete}
/>

// Hover-expand (label apparaît au survol)
<IconButton
  icon={PlusIcon}
  label="Ajouter"
  variant="primary"
  hoverExpand
  onClick={handleAdd}
/>

// Différentes tailles
<IconButton icon={PencilIcon} size="sm"/>
<IconButton icon={PencilIcon} size="md"/>
<IconButton icon={PencilIcon} size="lg"/>
```

### `DeleteButton`

**Fichier** : `src/components/ui/DeleteButton.jsx`

Bouton de suppression avec modale de confirmation intégrée.

#### Props

| Prop                  | Type       | Défaut                       | Description                      |
|-----------------------|------------|------------------------------|----------------------------------|
| `onDelete`            | `function` | -                            | Fonction de suppression (requis) |
| `onSuccess`           | `function` | -                            | Callback après succès            |
| `disabled`            | `boolean`  | `false`                      | Désactive le bouton              |
| `deleteLabel`         | `string`   | `"Supprimer"`                | Label du bouton                  |
| `confirmTitle`        | `string`   | `"Confirmer la suppression"` | Titre de la modale               |
| `confirmMessage`      | `string`   | `"Êtes-vous sûr..."`         | Message de confirmation          |
| `confirmLabel`        | `string`   | `"Supprimer"`                | Label du bouton de confirmation  |
| `size`                | `string`   | `'md'`                       | Taille du bouton                 |
| `hoverExpand`         | `boolean`  | `false`                      | Mode hover-expand                |
| `requireConfirmation` | `boolean`  | `true`                       | Active la modale de confirmation |

#### Exemple

```javascript
import DeleteButton from '@/components/ui/DeleteButton';

<DeleteButton
  onDelete={async () => {
    await axios.delete(`/api/items/${itemId}`);
  }}
  onSuccess={() => {
    showSuccess("Élément supprimé");
    refreshList();
  }}
  confirmTitle="Supprimer cet élément"
  confirmMessage="Cette action est irréversible. Continuer ?"
  deleteLabel="Supprimer"
  confirmLabel="Supprimer définitivement"
  size="md"
  hoverExpand
/>

// Sans confirmation (dangereux !)
<DeleteButton
  onDelete={deleteItem}
  requireConfirmation={false}
/>
```

### `PublishButton`

**Fichier** : `src/components/ui/PublishButton.jsx`

Bouton de publication avec feedback visuel.

#### Props

| Prop              | Type       | Défaut      | Description                      |
|-------------------|------------|-------------|----------------------------------|
| `onPublish`       | `function` | -           | Fonction de publication (requis) |
| `disabled`        | `boolean`  | `false`     | Désactive le bouton              |
| `publishLabel`    | `string`   | `"Publier"` | Label du bouton                  |
| `publishedLabel`  | `string`   | `"À jour"`  | Label après publication          |
| `size`            | `string`   | `'md'`      | Taille du bouton                 |
| `resetAfterDelay` | `boolean`  | `true`      | Réinitialise après 3s            |

#### Exemple

```javascript
import PublishButton from '@/components/ui/PublishButton';

<PublishButton
  onPublish={async () => {
    await axios.post(`/api/articles/${id}/publish`);
  }}
  publishLabel="Publier l'article"
  publishedLabel="Article publié"
  size="lg"
  resetAfterDelay={true}
/>
```

### Autres Boutons Spécialisés

#### `BackButton`

**Fichier** : `src/components/ui/BackButton.jsx`

Bouton de retour (navigation arrière).

```javascript
import BackButton from '@/components/ui/BackButton';

<BackButton/>
// ou
<BackButton onClick={() => router.back()}/>
```

#### `RefreshButton`

**Fichier** : `src/components/ui/RefreshButton.jsx`

Bouton de rafraîchissement.

```javascript
import RefreshButton from '@/components/ui/RefreshButton';

<RefreshButton onClick={fetchData}/>
```

#### `SendButton`

**Fichier** : `src/components/ui/SendButton.jsx`

Bouton d'envoi (formulaires, emails).

#### `DownloadButton`

**Fichier** : `src/components/ui/DownloadButton.jsx`

Bouton de téléchargement.

---

## Gestion des Médias

### `MediaManager`

**Fichier** : `src/components/MediaManager.jsx`

Gestionnaire complet de médias avec upload, sélection et modification.

#### Fonctionnalités

- ✅ **Drag & Drop** : Glisser-déposer des fichiers
- ✅ **Upload par clic** : Clic pour sélectionner
- ✅ **Barre de progression** : Pourcentage d'upload
- ✅ **Formats** : PNG, JPG, GIF (max 10MB)
- ✅ **Bibliothèque** : Navigation dans les médias existants
- ✅ **Modification** : Recadrage et métadonnées

#### Exemple

```javascript
import { useState } from 'react';
import MediaManager from '@/components/MediaManager';

function MyComponent() {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showLibrary, setShowLibrary] = useState(false);

  return (
    <MediaManager
      onUploadComplete={(media) => {
        console.log('Média uploadé:', media);
        setSelectedMedia(media);
      }}
      onBrowseClick={() => {
        setShowLibrary(true);
      }}
    />
  );
}
```

### `MediaPicker`

**Fichier** : `src/components/MediaPicker.jsx`

Sélecteur simple de média.

```javascript
import MediaPicker from '@/components/MediaPicker';

<MediaPicker
  onSelect={(media) => setSelectedMedia(media)}
  selectedMedia={selectedMedia}
  multiple={false}
/>
```

### `MediaSelector`

**Fichier** : `src/components/MediaSelector.jsx`

Sélecteur avancé avec recherche et filtres.

### `MediaGrid`

**Fichier** : `src/components/MediaGrid.jsx`

Grille d'affichage des médias.

### `MediaEditor`

**Fichier** : `src/components/MediaEditor.jsx`

Éditeur de médias (recadrage, rotation, etc.).

### `MediaModifier`

**Fichier** : `src/components/MediaModifier.jsx`

Modification des métadonnées des médias.

---

## Composants UI de Base

### `Card`

**Fichier** : `src/components/ui/Card.jsx`

Conteneur avec bordure et ombre.

```javascript
import Card from '@/components/ui/Card';

<Card className="p-6">
  <h2>Titre</h2>
  <p>Contenu de la carte</p>
</Card>
```

### `StatusTag`

**Fichier** : `src/components/ui/StatusTag.jsx`

Badge de statut coloré.

```javascript
import StatusTag from '@/components/ui/StatusTag';

<StatusTag status="active">Actif</StatusTag>
<StatusTag status="inactive">Inactif</StatusTag>
<StatusTag status="pending">En attente</StatusTag>
```

### `Flag`

**Fichier** : `src/components/ui/Flag.jsx`

Petit badge d'information.

```javascript
import Flag from '@/components/ui/Flag';

<Flag variant="primary">Nouveau</Flag>
<Flag variant="danger">Urgent</Flag>
```

### `Switch`

**Fichier** : `src/components/ui/Switch.jsx`

Interrupteur on/off.

```javascript
import Switch from '@/components/ui/Switch';

<Switch
  checked={isEnabled}
  onChange={setIsEnabled}
  label="Activer les notifications"
/>
```

---

## Hooks Personnalisés

### `useNotification`

Voir [Système de Notifications](#système-de-notifications).

### `useAxiosClient`

**Fichier** : `src/utils/axiosClient.js`

Hook pour obtenir une instance Axios configurée.

```javascript
import { useAxiosClient } from '@/utils/axiosClient';

function MyComponent() {
  const axios = useAxiosClient();

  const fetchData = async () => {
    const response = await axios.get('/api/data');
    return response.data;
  };

  // ...
}
```

---

## Utilitaires

### `cn` (Class Names)

**Fichier** : `src/utils/cn.js`

Utilitaire pour combiner des classes CSS conditionnellement.

```javascript
import { cn } from '@/utils/cn';

<div className={cn(
  "base-class",
  isActive && "active-class",
  isDisabled && "disabled-class"
)}>
  Contenu
</div>
```

### `breadcrumbs`

**Fichier** : `src/utils/breadcrumbs.js`

Utilitaires pour gérer les fils d'Ariane.

### `treeHelpers`

**Fichier** : `src/utils/treeHelpers.js`

Utilitaires pour manipuler des structures arborescentes.

---

## Composants de Formulaires

### `MyForm`

**Fichier** : `src/components/MyForm.jsx`

Formulaire générique avec validation.

### `ColorPicker`

**Fichier** : `src/components/ColorPicker.jsx`

Sélecteur de couleur.

```javascript
import ColorPicker from '@/components/ColorPicker';

<ColorPicker
  color={selectedColor}
  onChange={setSelectedColor}
/>
```

### `ColorInputWithPicker`

**Fichier** : `src/components/ColorInputWithPicker.jsx`

Input de couleur avec sélecteur intégré.

### `CurrencyInput`

**Fichier** : `src/components/CurrencyInput.jsx`

Input pour les montants en devise.

### `InputWithActions`

**Fichier** : `src/components/InputWithActions.jsx`

Input avec boutons d'action (copier, coller, etc.).

---

## Composants Complexes

### `RichTextEditor`

**Fichier** : `src/components/RichTextEditor.jsx`

Éditeur de texte riche.

### `ContentEditor`

**Fichier** : `src/components/ContentEditor.jsx`

Éditeur de contenu complet.

### `DraggableTree`

**Fichier** : `src/components/DraggableTree.jsx`

Arbre draggable pour réorganiser des éléments.

### `NavigationStepper`

**Fichier** : `src/components/NavigationStepper.jsx`

Stepper pour navigation en plusieurs étapes.

### `Tabs`

**Fichier** : `src/components/Tabs.jsx`

Système d'onglets.

```javascript
import Tabs from '@/components/Tabs';

<Tabs
  tabs={[
    { id: 'tab1', label: 'Onglet 1', content: <div>Contenu 1</div> },
    { id: 'tab2', label: 'Onglet 2', content: <div>Contenu 2</div> },
  ]}
  defaultTab="tab1"
/>
```

---

## Best Practices

### 1. Toujours utiliser les composants UI

```javascript
// ❌ Éviter
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  Cliquez
</button>

// ✅ Préférer
<Button variant="primary">
  Cliquez
</Button>
```

### 2. Gestion cohérente des erreurs

```javascript
const { showError, showSuccess } = useNotification();

try {
  await performAction();
  showSuccess("Succès");
} catch (error) {
  console.error(error);
  showError("Erreur", error.message);
}
```

### 3. États de chargement

```javascript
const [loading, setLoading] = useState(false);

<Button loading={loading} onClick={handleAction}>
  Action
</Button>
```

### 4. Confirmations pour actions destructives

```javascript
// ✅ Toujours demander confirmation
<DeleteButton
  onDelete={deleteItem}
  confirmMessage="Supprimer définitivement ?"
/>
```

---

## Liens Utiles

- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Heroicons](https://heroicons.com/)
- [Headless UI](https://headlessui.com/)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Dernière mise à jour** : 2025-11-08

