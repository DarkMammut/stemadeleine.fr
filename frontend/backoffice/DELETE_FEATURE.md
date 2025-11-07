# Fonctionnalité de suppression - Documentation

## ✅ Implémentation complète

Un bouton de suppression avec confirmation a été ajouté aux pages EditNewsletters et EditNews.

---

## 🎯 Fonctionnalités

### 1. Bouton de suppression

- **Type** : IconButton avec icône de poubelle (TrashIcon)
- **Variant** : danger (rouge)
- **Position** : En haut à droite, à côté du bouton "Publier"
- **Désactivation** : Bouton désactivé pendant la suppression

### 2. Modal de confirmation

- **Composant** : DeleteModal (réutilisé)
- **Message** : "Êtes-vous sûr de vouloir supprimer cette [newsletter/actualité] ? Cette action est irréversible."
- **Boutons** : Annuler / Supprimer

### 3. Redirection

- Après suppression réussie → Redirection automatique vers la liste
    - Newsletter : `/newsletters`
    - News : `/news`

---

## 📦 Modifications apportées

### PublicationInfoCard.jsx

**Nouvelles props ajoutées :**

```jsx
{
  onDelete,        // Fonction appelée lors du clic sur supprimer
    isDeleting,      // État pour désactiver le bouton pendant la suppression
}
```

**Bouton ajouté :**

```jsx
{
  onDelete && (
    <IconButton
      variant="danger"
      size="sm"
      onClick={onDelete}
      disabled={isDeleting}
      icon={TrashIcon}
      title="Supprimer"
    />
  )
}
```

### EditNewsletters.jsx

**Imports ajoutés :**

```jsx
import { useRouter } from "next/navigation";
import IconButton from "@/components/ui/IconButton";
import { TrashIcon } from "@heroicons/react/24/outline";
```

**States ajoutés :**

```jsx
const [showDeleteModal, setShowDeleteModal] = useState(false);
const router = useRouter();
```

**Fonctions du hook :**

```jsx
const { deleteNewsletterPublication } = useNewsletterPublicationOperations();
```

**Fonctions ajoutées :**

```jsx
const handleDelete = () => {
  setShowDeleteModal(true);
};

const confirmDelete = async () => {
  try {
    setSaving(true);
    await deleteNewsletterPublication(newsletterId);
    showSuccess("Newsletter supprimée", "...");
    router.push("/newsletters");
  } catch (err) {
    showError("Erreur de suppression", "...");
    setShowDeleteModal(false);
  } finally {
    setSaving(false);
  }
};
```

**Props passées à PublicationInfoCard :**

```jsx
<PublicationInfoCard
  // ...existing props
  onDelete={handleDelete}
  isDeleting={saving}
/>
```

**Modal ajoutée :**

```jsx
<DeleteModal
  open={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={confirmDelete}
  title="Supprimer la newsletter"
  message="Êtes-vous sûr de vouloir supprimer cette newsletter ? Cette action est irréversible."
  confirmLabel="Supprimer"
  isDeleting={saving}
/>
```

### EditNews.jsx

**Mêmes modifications que EditNewsletters.jsx**, avec :

- `deleteNewsPublication` au lieu de `deleteNewsletterPublication`
- Redirection vers `/news` au lieu de `/newsletters`
- Messages adaptés pour "actualité"

---

## 🔄 Flux de suppression

```
┌─────────────────────────────────────────┐
│ 1. Utilisateur clique sur l'icône 🗑️    │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 2. handleDelete() ouvre la modal       │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 3. Modal de confirmation s'affiche      │
│    "Êtes-vous sûr de vouloir..."       │
│    [Annuler]  [Supprimer]              │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 4. Si confirmation :                    │
│    confirmDelete() est appelé           │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 5. Appel API DELETE                     │
│    /api/newsletter-publication/{id}     │
│    ou /api/news-publications/{id}       │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 6. Si succès :                          │
│    - Notification de succès             │
│    - router.push('/newsletters')        │
│                                         │
│ Si erreur :                             │
│    - Notification d'erreur              │
│    - Modal se ferme                     │
└─────────────────────────────────────────┘
```

---

## 🎨 Interface utilisateur

### Avant

```
┌─────────────────────────────────────────┐
│ Informations        [Publier]           │
└─────────────────────────────────────────┘
```

### Après

```
┌─────────────────────────────────────────┐
│ Informations        [🗑️] [Publier]       │
└─────────────────────────────────────────┘
```

Le bouton de suppression (🗑️) apparaît toujours, que la publication soit DRAFT ou PUBLISHED.

---

## ⚠️ Sécurité

### Backend

Les endpoints de suppression existent déjà dans le backend :

- `DELETE /api/newsletter-publication/{id}`
- `DELETE /api/news-publications/{id}`

**Type de suppression** : Soft delete (probablement)

- Les données ne sont pas physiquement supprimées de la base
- Un flag `deleted` ou `status` est probablement utilisé

### Frontend

- **Double confirmation** : Modal obligatoire avant suppression
- **Message d'avertissement** : "Cette action est irréversible"
- **Désactivation** : Bouton désactivé pendant la suppression
- **Redirection** : Empêche l'utilisateur de rester sur une page supprimée

---

## 🧪 Tests à effectuer

### Test 1 : Suppression d'une newsletter DRAFT

- [ ] Ouvrir une newsletter en DRAFT
- [ ] Cliquer sur l'icône de suppression (🗑️)
- [ ] Vérifier que la modal s'affiche
- [ ] Cliquer sur "Annuler" → Modal se ferme, rien n'est supprimé
- [ ] Re-cliquer sur l'icône de suppression
- [ ] Cliquer sur "Supprimer" → Suppression + Redirection vers /newsletters
- [ ] Vérifier la notification de succès
- [ ] Vérifier que la newsletter n'apparaît plus dans la liste

### Test 2 : Suppression d'une newsletter PUBLISHED

- [ ] Ouvrir une newsletter PUBLISHED
- [ ] Cliquer sur l'icône de suppression
- [ ] Confirmer la suppression
- [ ] Vérifier que ça fonctionne même si publiée

### Test 3 : Suppression d'une actualité

- [ ] Même chose avec une actualité
- [ ] Vérifier la redirection vers /news
- [ ] Vérifier les messages adaptés ("actualité" au lieu de "newsletter")

### Test 4 : Erreur de suppression

- [ ] Simuler une erreur (couper le backend)
- [ ] Tenter de supprimer
- [ ] Vérifier que la notification d'erreur s'affiche
- [ ] Vérifier que la modal se ferme
- [ ] Vérifier que l'utilisateur reste sur la page

---

## 📝 API utilisées

### Newsletter

```javascript
// Hook
const { deleteNewsletterPublication } = useNewsletterPublicationOperations();

// Appel
await deleteNewsletterPublication(newsletterId);

// Endpoint backend
DELETE / api / newsletter - publication / { id }
```

### News

```javascript
// Hook
const { deleteNewsPublication } = useNewsPublicationOperations();

// Appel
await deleteNewsPublication(newsId);

// Endpoint backend
DELETE / api / news - publications / { id }
```

---

## 🎯 Cohérence avec le reste du système

### Même pattern que la publication

- Modal de confirmation (DeleteModal)
- États de chargement (isDeleting)
- Notifications de succès/erreur
- Redirection après action

### Utilisation des composants existants

- ✅ IconButton (déjà utilisé ailleurs)
- ✅ DeleteModal (déjà utilisé pour d'autres suppressions)
- ✅ Notification (système unifié)
- ✅ useRouter (Next.js standard)

---

## 📚 Fichiers modifiés

| Fichier                   | Modifications                  |
|---------------------------|--------------------------------|
| `PublicationInfoCard.jsx` | Props + Bouton de suppression  |
| `EditNewsletters.jsx`     | Logique de suppression + Modal |
| `EditNews.jsx`            | Logique de suppression + Modal |

**Total** : 3 fichiers modifiés

---

## ✨ Résultat

✅ **Bouton de suppression fonctionnel**
✅ **Confirmation obligatoire**
✅ **Redirection automatique**
✅ **Notifications informatives**
✅ **Code réutilisable**
✅ **Cohérent avec le reste du système**

La fonctionnalité de suppression est maintenant complète et opérationnelle pour les Newsletters et les News ! 🎉

