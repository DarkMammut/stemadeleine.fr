# Renommage DeleteModal → ConfirmModal - Documentation

## ✅ Renommage effectué

`DeleteModal` a été renommé en `ConfirmModal` pour refléter son usage générique pour toute confirmation d'action, pas
seulement les suppressions.

---

## 🎯 Raison du renommage

### Problème

Le composant `DeleteModal` était utilisé pour :

- ❌ Confirmer une suppression (nom approprié)
- ❌ Confirmer une publication (nom inapproprié)
- ❌ Potentiellement d'autres confirmations futures

Le nom `DeleteModal` était donc **trompeur** car il ne servait pas uniquement à supprimer.

### Solution

Renommer en `ConfirmModal` pour un nom **générique** qui reflète mieux son utilisation.

---

## 📦 Nouveau composant : ConfirmModal

### Props

| Prop           | Type     | Défaut               | Description                             |
|----------------|----------|----------------------|-----------------------------------------|
| `open`         | Boolean  | -                    | État d'ouverture de la modal            |
| `onClose`      | Function | -                    | Callback de fermeture                   |
| `onConfirm`    | Function | -                    | Callback de confirmation                |
| `title`        | String   | "Confirmer l'action" | Titre de la modal                       |
| `message`      | String   | "Êtes-vous sûr..."   | Message de confirmation                 |
| `confirmLabel` | String   | "Confirmer"          | Texte du bouton de confirmation         |
| `cancelLabel`  | String   | "Annuler"            | Texte du bouton d'annulation            |
| `isLoading`    | Boolean  | false                | État de chargement                      |
| `variant`      | String   | "danger"             | Variant du bouton ("danger", "primary") |

### Changements par rapport à DeleteModal

| Aspect               | DeleteModal                | ConfirmModal                    |
|----------------------|----------------------------|---------------------------------|
| **Nom de prop**      | `isDeleting`               | `isLoading` ✅                   |
| **Variant**          | Toujours rouge             | Configurable (danger/primary) ✅ |
| **Titre par défaut** | "Confirmer la suppression" | "Confirmer l'action" ✅          |
| **Icône couleur**    | Toujours rouge             | Adapté au variant ✅             |

---

## 🔄 Utilisations dans l'application

### 1. Confirmation de suppression (variant="danger")

```jsx
<ConfirmModal
  open={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={handleDelete}
  title="Supprimer l'utilisateur"
  message="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
  isLoading={isDeleting}
  variant="danger"
/>
```

**Rendu :** Icône rouge, bouton rouge "Supprimer"

### 2. Confirmation de publication (variant="primary")

```jsx
<ConfirmModal
  open={showPublishModal}
  onClose={() => setShowPublishModal(false)}
  onConfirm={handlePublish}
  title="Publier la newsletter"
  message="Êtes-vous sûr de vouloir publier cette newsletter ?"
  confirmLabel="Publier"
  isLoading={saving}
  variant="primary"
/>
```

**Rendu :** Icône bleue, bouton bleu "Publier"

---

## 📋 Fichiers modifiés

### Composant créé

- ✅ `components/ConfirmModal.jsx` (nouveau)

### Composants mis à jour

- ✅ `ui/DeleteButton.jsx` (utilise ConfirmModal)

### Scènes mises à jour

- ✅ `EditNewsletters.jsx` (DeleteModal → ConfirmModal)
- ✅ `EditNews.jsx` (DeleteModal → ConfirmModal)
- ✅ `EditUser.jsx` (DeleteModal → ConfirmModal)
- ✅ `EditPayment.jsx` (DeleteModal → ConfirmModal)
- ✅ `EditContact.jsx` (DeleteModal → ConfirmModal)
- ✅ `Pages.jsx` (DeleteModal → ConfirmModal)
- ✅ `Sections.jsx` (DeleteModal → ConfirmModal)
- ✅ `AddressManager.jsx` (DeleteModal → ConfirmModal)

**Total :** 8 fichiers + DeleteButton

---

## 🎨 Variants disponibles

### variant="danger" (rouge)

Pour les actions destructives :

- Suppression
- Désactivation
- Révocation
- Etc.

**Couleur icône :** Rouge (`bg-red-100`, `text-red-600`)
**Couleur bouton :** Rouge

### variant="primary" (bleu)

Pour les actions importantes mais non destructives :

- Publication
- Validation
- Confirmation
- Etc.

**Couleur icône :** Bleu (`bg-blue-100`, `text-blue-600`)
**Couleur bouton :** Bleu

---

## 🔧 Migration automatique effectuée

### Imports

```diff
- import DeleteModal from "@/components/DeleteModal";
+ import ConfirmModal from "@/components/ConfirmModal";
```

### JSX - Suppression

```diff
- <DeleteModal
+ <ConfirmModal
    open={showDeleteModal}
    onClose={...}
    onConfirm={handleDelete}
    title="Supprimer..."
    message="..."
-   isDeleting={isDeleting}
+   isLoading={isDeleting}
+   variant="danger"
  />
```

### JSX - Publication

```diff
- <DeleteModal
+ <ConfirmModal
    open={showPublishModal}
    onClose={...}
    onConfirm={confirmPublish}
    title="Publier..."
    message="..."
-   isDeleting={saving}
+   isLoading={saving}
+   variant="primary"
  />
```

---

## 📊 Statistiques

| Métrique               | Valeur                     |
|------------------------|----------------------------|
| Fichiers modifiés      | 9                          |
| Occurrences remplacées | ~40                        |
| Nouveau variant ajouté | `primary`                  |
| Props renommées        | `isDeleting` → `isLoading` |
| Temps de migration     | Automatique ✅              |

---

## ✨ Avantages du renommage

### 1. Nom plus clair ✅

`ConfirmModal` reflète mieux l'usage générique du composant.

### 2. Variants configurables ✅

Le composant peut maintenant avoir différentes couleurs selon le contexte.

### 3. Cohérence ✅

- `isLoading` au lieu de `isDeleting` (plus cohérent avec les autres composants)
- Même pattern que PublishButton, DownloadButton, etc.

### 4. Extensibilité ✅

Facile d'ajouter de nouveaux variants à l'avenir :

- `variant="warning"` (orange)
- `variant="success"` (vert)
- Etc.

---

## 🚀 Utilisation future

Pour toute nouvelle confirmation :

```jsx
<ConfirmModal
  open={showModal}
  onClose={() => setShowModal(false)}
  onConfirm={handleAction}
  title="Titre de l'action"
  message="Message de confirmation"
  confirmLabel="Action"
  isLoading={loading}
  variant="danger" // ou "primary"
/>
```

**Simple, clair, et cohérent !** 🎉

---

## 📝 Note sur DeleteModal.jsx

Le fichier `DeleteModal.jsx` existe toujours mais n'est plus utilisé nulle part. Il peut être supprimé en toute sécurité
si souhaité.

**Commande pour supprimer :**

```bash
rm frontend/backoffice/src/components/DeleteModal.jsx
```

---

## ✅ Conclusion

Le renommage de `DeleteModal` en `ConfirmModal` rend le code :

- Plus clair
- Plus flexible
- Plus cohérent
- Plus maintenable

Le composant peut maintenant être utilisé pour **toute** action nécessitant une confirmation, pas seulement les
suppressions.

