# DeleteModal - Documentation

## Description

Le composant `DeleteModal` est une modale spécialisée pour la confirmation de suppressions. C'est essentiellement un
wrapper du composant `ConfirmModal` avec des valeurs par défaut adaptées aux actions de suppression.

## Import

```javascript
import DeleteModal from '@/components/DeleteModal';
```

## Relation avec ConfirmModal

`DeleteModal` utilise `ConfirmModal` en interne avec des valeurs par défaut optimisées pour les suppressions :

- `variant="danger"` par défaut
- Messages adaptés à la suppression
- Icône d'avertissement appropriée

## Props

Les mêmes props que `ConfirmModal` avec des valeurs par défaut différentes :

| Prop           | Type       | Défaut                               | Description                                                  |
|----------------|------------|--------------------------------------|--------------------------------------------------------------|
| `open`         | `boolean`  | -                                    | État d'ouverture (requis)                                    |
| `onClose`      | `function` | -                                    | Callback de fermeture (requis)                               |
| `onConfirm`    | `function` | -                                    | Callback de confirmation (requis)                            |
| `title`        | `string`   | `"Confirmer la suppression"`         | Titre de la modale                                           |
| `message`      | `string`   | `"Cette action est irréversible..."` | Message de confirmation                                      |
| `confirmLabel` | `string`   | `"Supprimer"`                        | Label du bouton de confirmation                              |
| `cancelLabel`  | `string`   | `"Annuler"`                          | Label du bouton d'annulation                                 |
| `isLoading`    | `boolean`  | `false`                              | État de chargement                                           |
| `itemName`     | `string`   | -                                    | Nom de l'élément à supprimer (pour personnaliser le message) |

## Utilisation Basique

```javascript
import { useState } from 'react';
import DeleteModal from '@/components/DeleteModal';

function MyComponent() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteItem();
      setShowDeleteModal(false);
      showSuccess("Élément supprimé");
    } catch (error) {
      showError("Erreur", error.message);
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
        isLoading={isDeleting}
      />
    </>
  );
}
```

## Exemples Avancés

### Avec Nom d'Élément Personnalisé

```javascript
<DeleteModal
  open={showModal}
  onClose={() => setShowModal(false)}
  onConfirm={handleDelete}
  title="Supprimer l'article"
  message={`Êtes-vous sûr de vouloir supprimer l'article "${article.title}" ? Cette action est irréversible.`}
  itemName={article.title}
  isLoading={isDeleting}
/>
```

### Suppression d'un Utilisateur

```javascript
function UserCard({ user }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSuccess, showError } = useNotification();
  const axios = useAxiosClient();

  const handleDeleteUser = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/users/${user.id}`);
      setShowDeleteModal(false);
      showSuccess("Utilisateur supprimé", `${user.name} a été supprimé`);
      // Rafraîchir la liste
      onUserDeleted();
    } catch (error) {
      showError("Erreur", "Impossible de supprimer l'utilisateur");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-4">
        <div>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="text-red-600 hover:text-red-800"
        >
          Supprimer
        </button>
      </div>

      <DeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteUser}
        title="Supprimer l'utilisateur"
        message={`Êtes-vous sûr de vouloir supprimer ${user.name} ? Toutes ses données seront perdues.`}
        confirmLabel="Supprimer l'utilisateur"
        isLoading={isDeleting}
      />
    </>
  );
}
```

### Suppression Multiple

```javascript
function ItemList({ items }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    try {
      await Promise.all(
        selectedItems.map(id => axios.delete(`/api/items/${id}`))
      );
      setShowDeleteModal(false);
      setSelectedItems([]);
      showSuccess("Éléments supprimés", `${selectedItems.length} éléments supprimés`);
      refreshList();
    } catch (error) {
      showError("Erreur", "Impossible de supprimer tous les éléments");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div>
        {/* Liste avec sélection */}
        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={selectedItems.length === 0}
        >
          Supprimer la sélection ({selectedItems.length})
        </button>
      </div>

      <DeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteSelected}
        title="Supprimer les éléments sélectionnés"
        message={`Vous allez supprimer ${selectedItems.length} élément(s). Cette action est irréversible.`}
        confirmLabel={`Supprimer ${selectedItems.length} élément(s)`}
        isLoading={isDeleting}
      />
    </>
  );
}
```

## Comparaison : DeleteModal vs DeleteButton

### Quand utiliser DeleteModal ?

Utilisez `DeleteModal` quand :

- Vous avez déjà un bouton/élément déclencheur personnalisé
- Vous voulez un contrôle total sur l'ouverture de la modale
- Vous gérez plusieurs actions avant de supprimer

```javascript
// ✅ Utiliser DeleteModal
<>
  <button onClick={() => setShowModal(true)}>
    Mon bouton personnalisé
  </button>

  <DeleteModal
    open={showModal}
    onClose={() => setShowModal(false)}
    onConfirm={handleDelete}
  />
</>
```

### Quand utiliser DeleteButton ?

Utilisez `DeleteButton` quand :

- Vous avez besoin d'un bouton de suppression simple
- Vous voulez moins de code
- Le comportement standard suffit

```javascript
// ✅ Utiliser DeleteButton (plus simple)
import DeleteButton from '@/components/ui/DeleteButton';

<DeleteButton
  onDelete={handleDelete}
  confirmMessage="Supprimer cet élément ?"
/>
```

## Pattern Recommandé avec Notifications

```javascript
import { useState } from 'react';
import DeleteModal from '@/components/DeleteModal';
import Notification from '@/components/Notification';
import { useNotification } from '@/hooks/useNotification';
import { useAxiosClient } from '@/utils/axiosClient';

function MyComponent({ item, onItemDeleted }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  const axios = useAxiosClient();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/items/${item.id}`);
      setShowDeleteModal(false);
      showSuccess(
        "Suppression réussie",
        `L'élément "${item.name}" a été supprimé`
      );
      // Notifier le parent
      if (onItemDeleted) {
        onItemDeleted(item.id);
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      showError(
        "Erreur de suppression",
        error.response?.data?.message || "Impossible de supprimer l'élément"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowDeleteModal(true)}
        className="text-red-600 hover:text-red-800"
      >
        Supprimer
      </button>

      <DeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Supprimer l'élément"
        message={`Êtes-vous sûr de vouloir supprimer "${item.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer définitivement"
        isLoading={isDeleting}
      />

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

## Gestion des Erreurs

### Erreur Réseau

```javascript
const handleDelete = async () => {
  setIsDeleting(true);
  try {
    await axios.delete(`/api/items/${item.id}`);
    setShowDeleteModal(false);
    showSuccess("Supprimé");
  } catch (error) {
    if (error.response) {
      // Erreur du serveur
      showError("Erreur", error.response.data.message);
    } else if (error.request) {
      // Pas de réponse
      showError("Erreur réseau", "Impossible de contacter le serveur");
    } else {
      // Autre erreur
      showError("Erreur", error.message);
    }
    // NE PAS fermer la modale en cas d'erreur
  } finally {
    setIsDeleting(false);
  }
};
```

### Erreur de Validation

```javascript
const handleDelete = async () => {
  // Vérifier les dépendances avant de supprimer
  if (item.hasChildren) {
    showError(
      "Suppression impossible",
      "Cet élément contient des sous-éléments. Supprimez-les d'abord."
    );
    setShowDeleteModal(false);
    return;
  }

  setIsDeleting(true);
  try {
    await axios.delete(`/api/items/${item.id}`);
    setShowDeleteModal(false);
    showSuccess("Supprimé");
  } catch (error) {
    showError("Erreur", error.message);
  } finally {
    setIsDeleting(false);
  }
};
```

## Accessibilité

Le composant hérite de l'accessibilité de `ConfirmModal` :

- Support du clavier (Escape pour fermer, Tab pour naviguer)
- Attributs ARIA appropriés
- Focus trap dans la modale
- Overlay cliquable pour fermer

## Styling

Le composant utilise le styling de `ConfirmModal` avec les couleurs "danger" par défaut :

- Icône rouge d'avertissement
- Bouton de confirmation rouge
- Animation d'entrée/sortie fluide

## Notes Techniques

### État de Chargement

Pendant le chargement (`isLoading={true}`), la modale :

- Désactive les boutons
- Affiche un indicateur de chargement sur le bouton de confirmation
- Empêche la fermeture

### Fermeture de la Modale

La modale peut être fermée :

- En cliquant sur le bouton "Annuler"
- En cliquant sur l'overlay (fond grisé)
- En appuyant sur la touche Escape
- Programmatiquement en changeant le prop `open`

## Best Practices

### ✅ À Faire

- Toujours afficher un message clair sur ce qui va être supprimé
- Utiliser `isLoading` pendant l'opération de suppression
- Fermer la modale uniquement après une suppression réussie
- Afficher une notification de succès après la suppression
- Rafraîchir les données après la suppression

### ❌ À Éviter

- Ne pas fermer la modale en cas d'erreur
- Ne pas supprimer sans confirmation
- Ne pas oublier de gérer les états de chargement
- Ne pas oublier les notifications de retour utilisateur

## Voir Aussi

- [ConfirmModal](./ConfirmModal.jsx) - Modale de confirmation générique
- [DeleteButton](DeleteButton.jsx) - Bouton de suppression avec modale intégrée
- [Notification](../Notification.jsx) - Système de notifications
- [useNotification Hook](../../hooks/useNotification.js) - Hook pour gérer les notifications

## Support

Pour plus d'informations, consultez :

- [Guide des Utilitaires](../../../UTILITIES_GUIDE.md)
- [Documentation de Développement](../../../DEVELOPMENT.md)

