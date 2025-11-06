# DeleteModal - Composant de Confirmation de Suppression

## Description

`DeleteModal` est un composant générique réutilisable pour afficher des dialogues de confirmation de suppression dans
l'application. Il utilise Headless UI pour gérer l'état du modal et offre une interface utilisateur cohérente pour
toutes les actions de suppression.

## Props

| Prop           | Type       | Par défaut                                                                        | Description                                                                |
|----------------|------------|-----------------------------------------------------------------------------------|----------------------------------------------------------------------------|
| `open`         | `boolean`  | -                                                                                 | **Requis.** Contrôle l'état d'ouverture du modal                           |
| `onClose`      | `function` | -                                                                                 | **Requis.** Callback appelé lors de la fermeture du modal                  |
| `onConfirm`    | `function` | -                                                                                 | **Requis.** Callback appelé lors de la confirmation de suppression         |
| `title`        | `string`   | "Confirmer la suppression"                                                        | Titre du modal                                                             |
| `message`      | `string`   | "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible." | Message de confirmation                                                    |
| `confirmLabel` | `string`   | "Supprimer"                                                                       | Label du bouton de confirmation                                            |
| `cancelLabel`  | `string`   | "Annuler"                                                                         | Label du bouton d'annulation                                               |
| `isDeleting`   | `boolean`  | `false`                                                                           | Indique si l'opération de suppression est en cours (désactive les boutons) |

## Utilisation

### Exemple basique

```jsx
import { useState } from 'react';
import DeleteModal from '@/components/DeleteModal';

function MyComponent() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Votre logique de suppression
      await api.delete('/resource');
      setShowDeleteModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button onClick={() => setShowDeleteModal(true)}>
        Supprimer
      </button>

      <DeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
```

### Exemple avec message personnalisé

```jsx
<DeleteModal
  open={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={handleDelete}
  title="Supprimer l'utilisateur"
  message="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible et supprimera toutes les données associées."
  confirmLabel="Confirmer la suppression"
  isDeleting={isDeleting}
/>
```

### Exemple avec élément dynamique

```jsx
const [itemToDelete, setItemToDelete] = useState(null);

const handleDeleteClick = (item) => {
  setItemToDelete(item);
  setShowDeleteModal(true);
};

const confirmDelete = async () => {
  if (!itemToDelete) return;

  setIsDeleting(true);
  try {
    await api.delete(`/items/${itemToDelete.id}`);
  } finally {
    setIsDeleting(false);
    setShowDeleteModal(false);
    setItemToDelete(null);
  }
};

<DeleteModal
  open={showDeleteModal}
  onClose={() => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  }}
  onConfirm={confirmDelete}
  title={`Supprimer ${itemToDelete?.name}`}
  message={`Êtes-vous sûr de vouloir supprimer "${itemToDelete?.name}" ?`}
  isDeleting={isDeleting}
/>
```

## Cas d'usage dans le projet

Le composant `DeleteModal` est actuellement utilisé dans :

- **EditContact.jsx** - Suppression de contacts
- **EditUser.jsx** - Suppression d'utilisateurs
- **EditPayment.jsx** - Suppression de paiements
- **Pages.jsx** - Suppression de pages
- **Sections.jsx** - Suppression de sections et modules
- **EditNewsletters.jsx** - Suppression de médias et confirmation de publication

## Personnalisation avancée

### Utiliser le modal pour d'autres actions que la suppression

Bien que conçu pour les suppressions, le composant peut être adapté pour d'autres confirmations :

```jsx
<DeleteModal
  open={showPublishModal}
  onClose={() => setShowPublishModal(false)}
  onConfirm={handlePublish}
  title="Publier la newsletter"
  message="Êtes-vous sûr de vouloir publier cette newsletter ?"
  confirmLabel="Publier"
  isDeleting={isPublishing}
/>
```

## Design

Le modal utilise :

- Un icône `ExclamationTriangleIcon` rouge pour indiquer la nature destructive de l'action
- Une palette de couleurs rouge pour le bouton de confirmation
- Des transitions fluides avec Headless UI
- Un fond semi-transparent (overlay)
- Un z-index élevé (9999) pour s'assurer qu'il apparaît au-dessus de tout autre contenu

## Accessibilité

- Support du clavier (ESC pour fermer)
- Focus automatique sur le bouton d'annulation
- Désactivation des interactions pendant le chargement
- Labels clairs et descriptifs

