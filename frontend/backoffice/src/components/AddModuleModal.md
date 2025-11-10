# AddModuleModal - Documentation

## Description

Le composant `AddModuleModal` est une modale spécialisée pour l'ajout de modules à une section. Il suit le style
de `ConfirmModal` et permet de sélectionner le type de module à créer.

## Import

```javascript
import AddModuleModal from '@/components/AddModuleModal';
```

## Props

| Prop          | Type       | Défaut           | Description                                                          |
|---------------|------------|------------------|----------------------------------------------------------------------|
| `open`        | `boolean`  | -                | État d'ouverture du modal (requis)                                   |
| `onClose`     | `function` | -                | Callback de fermeture (requis)                                       |
| `onConfirm`   | `function` | -                | Callback de confirmation avec le type de module sélectionné (requis) |
| `section`     | `object`   | -                | Section cible pour l'ajout du module                                 |
| `isLoading`   | `boolean`  | `false`          | État de chargement pendant la création                               |
| `moduleTypes` | `array`    | Types par défaut | Liste des types de modules disponibles                               |

### Types de Modules par Défaut

```javascript
[
  { value: 'article', label: 'Article' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'news', label: 'News' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'cta', label: 'CTA' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'form', label: 'Form' },
  { value: 'list', label: 'List' },
]
```

## Utilisation de Base

```javascript
import { useState } from 'react';
import AddModuleModal from '@/components/AddModuleModal';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  const handleAddModule = async (moduleType) => {
    try {
      // Créer le module via l'API
      await createModule({
        sectionId: selectedSection.sectionId,
        type: moduleType,
        name: `New ${moduleType}`,
      });
      
      setShowModal(false);
      // Rafraîchir les données
      await refetch();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du module:', error);
    }
  };

  return (
    <>
      <button onClick={() => {
        setSelectedSection(section);
        setShowModal(true);
      }}>
        Ajouter un module
      </button>
      
      <AddModuleModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedSection(null);
        }}
        onConfirm={handleAddModule}
        section={selectedSection}
      />
    </>
  );
}
```

## Exemple Complet avec Gestion d'Erreurs

```javascript
import { useState } from 'react';
import AddModuleModal from '@/components/AddModuleModal';
import Notification from '@/components/Notification';
import { useNotification } from '@/hooks/useNotification';
import { useAxiosClient } from '@/utils/axiosClient';

function SectionManager({ sections }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  const axios = useAxiosClient();

  const handleAddModule = async (moduleType) => {
    if (!selectedSection || !moduleType) return;

    setIsCreating(true);
    try {
      const typeToEndpoint = {
        article: '/api/articles',
        news: '/api/news',
        newsletter: '/api/newsletters',
        cta: '/api/cta',
        timeline: '/api/timelines',
        form: '/api/forms',
        list: '/api/lists',
        gallery: '/api/galleries',
      };

      const endpoint = typeToEndpoint[moduleType] || '/api/modules';

      await axios.post(endpoint, {
        sectionId: selectedSection.sectionId,
        type: moduleType,
        name: `New ${moduleType}`,
      });

      setShowModal(false);
      setSelectedSection(null);
      showSuccess(
        'Module créé',
        `Le module ${moduleType} a été ajouté à ${selectedSection.name}`
      );

      // Rafraîchir les données
      await refetchSections();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du module:', error);
      showError(
        'Erreur',
        error.response?.data?.message || 'Impossible de créer le module'
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      {sections.map(section => (
        <div key={section.id}>
          <h3>{section.name}</h3>
          <button
            onClick={() => {
              setSelectedSection(section);
              setShowModal(true);
            }}
          >
            Ajouter un module
          </button>
        </div>
      ))}

      <AddModuleModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedSection(null);
        }}
        onConfirm={handleAddModule}
        section={selectedSection}
        isLoading={isCreating}
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

## Personnalisation des Types de Modules

Vous pouvez personnaliser la liste des types de modules disponibles :

```javascript
const customModuleTypes = [
  { value: 'hero', label: 'Hero Banner' },
  { value: 'testimonials', label: 'Témoignages' },
  { value: 'pricing', label: 'Tarifs' },
  { value: 'faq', label: 'FAQ' },
];

<AddModuleModal
  open={showModal}
  onClose={handleClose}
  onConfirm={handleAddModule}
  section={selectedSection}
  moduleTypes={customModuleTypes}
/>
```

## Intégration avec DraggableTree

Le composant est conçu pour s'intégrer facilement avec `DraggableTree` et `SortableItem` :

```javascript
import DraggableTree from '@/components/DraggableTree';
import AddModuleModal from '@/components/AddModuleModal';

function ContentManager({ pageId }) {
  const [showModal, setShowModal] = useState(false);
  const [targetSection, setTargetSection] = useState(null);

  const handleAddModuleClick = (section) => {
    setTargetSection(section);
    setShowModal(true);
  };

  const handleConfirmAddModule = async (moduleType) => {
    // Logique de création du module
    await createModule(targetSection.sectionId, moduleType);
    setShowModal(false);
    setTargetSection(null);
  };

  return (
    <>
      <DraggableTree
        initialData={treeData}
        onChange={handleTreeChange}
        onAddChild={handleAddModuleClick}
      />

      <AddModuleModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setTargetSection(null);
        }}
        onConfirm={handleConfirmAddModule}
        section={targetSection}
      />
    </>
  );
}
```

## Fonctionnalités

### ✅ Style Cohérent

- Suit le design de `ConfirmModal`
- Utilise Headless UI pour l'accessibilité
- Animations d'entrée/sortie fluides

### ✅ UX Optimisée

- Sélecteur de type de module clair
- Affiche le nom de la section cible
- Désactivation automatique pendant le chargement
- Bouton "Ajouter" désactivé si aucun type sélectionné

### ✅ Réinitialisation Automatique

- Le type sélectionné est réinitialisé à chaque ouverture
- Évite les erreurs de création de modules incorrects

## Accessibilité

Le composant hérite de l'accessibilité de Headless UI Dialog :

- Support du clavier (Escape pour fermer, Tab pour naviguer)
- Attributs ARIA appropriés
- Focus trap dans le modal
- Overlay cliquable pour fermer
- Labels appropriés pour le sélecteur

## Styling

Le composant utilise Tailwind CSS avec :

- Icône bleue (PlusCircleIcon) au lieu de l'icône d'avertissement
- Bouton principal bleu (variant="primary")
- Responsive design (adaptatif mobile/desktop)
- Animations fluides

## Comparaison avec ConfirmModal

| Caractéristique      | ConfirmModal         | AddModuleModal         |
|----------------------|----------------------|------------------------|
| **Usage**            | Confirmer une action | Créer un module        |
| **Icône**            | ExclamationTriangle  | PlusCircle             |
| **Couleur**          | Rouge/Bleu           | Bleu                   |
| **Input**            | Aucun                | Sélecteur de type      |
| **Réinitialisation** | Non                  | Oui (type sélectionné) |

## Best Practices

### ✅ À Faire

- Toujours réinitialiser `targetSection` à la fermeture
- Gérer l'état de chargement pendant la création
- Afficher une notification de succès/erreur
- Rafraîchir les données après création

```javascript
// ✅ Bon
<AddModuleModal
  open={showModal}
  onClose={() => {
    setShowModal(false);
    setTargetSection(null); // Réinitialisation
  }}
  onConfirm={async (type) => {
    await createModule(type);
    showSuccess('Module créé');
    await refetch(); // Rafraîchir
  }}
  section={targetSection}
  isLoading={isCreating}
/>
```

### ❌ À Éviter

- Ne pas oublier de réinitialiser les états
- Ne pas créer le module sans vérifier la section
- Ne pas oublier la gestion d'erreurs

```javascript
// ❌ Mauvais - pas de réinitialisation
<AddModuleModal
  open={showModal}
  onClose={() => setShowModal(false)}
  onConfirm={createModule}
  section={targetSection}
/>
```

## Gestion des Erreurs

```javascript
const handleConfirmAddModule = async (moduleType) => {
  try {
    await createModule(moduleType);
    setShowModal(false);
  } catch (error) {
    if (error.response?.status === 404) {
      showError('Section introuvable');
    } else if (error.response?.status === 403) {
      showError('Permissions insuffisantes');
    } else {
      showError('Erreur lors de la création');
    }
    // Ne pas fermer le modal en cas d'erreur
  }
};
```

## Événements

### onConfirm

La fonction `onConfirm` reçoit le type de module sélectionné en paramètre :

```javascript
onConfirm = {(moduleType)
=>
{
  console.log('Type sélectionné:', moduleType);
  // 'article', 'gallery', 'news', etc.
}
}
```

## Voir Aussi

- [ConfirmModal](./ConfirmModal.jsx) - Modale de confirmation générique
- [DeleteModal](./DeleteModal.jsx) - Modale de suppression
- [DraggableTree](./DraggableTree.jsx) - Arbre draggable
- [SortableItem](./SortableItem.jsx) - Élément sortable avec bouton d'ajout

## Support

Pour plus d'informations, consultez :

- [Guide des Utilitaires](../../UTILITIES_GUIDE.md)
- [Documentation de Développement](../../../DEVELOPMENT.md)

---

**Dernière mise à jour** : 2025-11-08

