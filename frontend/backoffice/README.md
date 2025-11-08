# Backoffice - Sainte-Madeleine

Backoffice de gestion de contenu pour le site de la paroisse Sainte-Madeleine, développé avec Next.js 15.

## 📚 Documentation

### Guides Essentiels

- **[UTILITIES_GUIDE.md](./UTILITIES_GUIDE.md)** - Guide complet des composants et utilitaires
    - Système de notifications
    - Modales de confirmation
    - Boutons intelligents (Button, IconButton, DeleteButton, PublishButton)
    - Gestion des médias (MediaManager, MediaPicker, etc.)
    - Composants UI de base
    - Hooks personnalisés
    - Exemples de code

- **[../../DEVELOPMENT.md](../../DEVELOPMENT.md)** - Guide de développement général
- **[../../AI_INSTRUCTIONS.md](../../AI_INSTRUCTIONS.md)** - Instructions pour l'IA

### Documentation des Composants

- **[src/components/ui/IconButton.md](./src/components/ui/IconButton.md)** - Boutons avec icônes
- **[src/components/DeleteModal.md](./src/components/DeleteModal.md)** - Modale de suppression

## 🚀 Démarrage Rapide

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Build de Production

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## 🎨 Composants UI Disponibles

### Notifications

```javascript
import { useNotification } from '@/hooks/useNotification';
import Notification from '@/components/Notification';

const { showSuccess, showError, showInfo, showWarning } = useNotification();
```

**Types** : `success`, `error`, `info`, `warning`

### Modales

```javascript
import ConfirmModal from '@/components/ConfirmModal';
import DeleteModal from '@/components/DeleteModal';

// Confirmation générique
<ConfirmModal open={show} onClose={handleClose} onConfirm={handleConfirm}/>

// Suppression spécialisée
<DeleteModal open={show} onClose={handleClose} onConfirm={handleDelete}/>
```

### Boutons

```javascript
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import DeleteButton from '@/components/ui/DeleteButton';
import PublishButton from '@/components/ui/PublishButton';
import { PencilIcon } from '@heroicons/react/24/outline';

// Bouton standard
<Button variant="primary" size="md" loading={isLoading}>Enregistrer</Button>

// Bouton avec icône
<IconButton icon={PencilIcon} label="Modifier" variant="primary"/>

// Bouton icon-only
<IconButton icon={PencilIcon} variant="secondary"/>

// Bouton hover-expand (label au survol)
<IconButton icon={PencilIcon} label="Modifier" hoverExpand/>

// Bouton de suppression avec confirmation
<DeleteButton onDelete={handleDelete} confirmMessage="Supprimer ?"/>

// Bouton de publication
<PublishButton onPublish={handlePublish}/>
```

**Variantes de Button** :

- `primary` - Action principale (bleu indigo)
- `secondary` - Action secondaire (gris)
- `danger` - Action destructive (rouge)
- `ghost` - Transparent
- `link` - Style de lien
- `outline` - Bordure avec fond blanc
- `refresh` - Rafraîchissement (vert)
- `filter` - Filtre (bleu)

**Tailles** : `sm`, `md`, `lg`

### Gestion des Médias

```javascript
import MediaManager from '@/components/MediaManager';
import MediaPicker from '@/components/MediaPicker';
import MediaSelector from '@/components/MediaSelector';

// Upload et gestion
<MediaManager
  onUploadComplete={(media) => setSelectedMedia(media)}
  onBrowseClick={() => setShowLibrary(true)}
/>

// Sélection simple
<MediaPicker
  onSelect={(media) => setSelectedMedia(media)}
  selectedMedia={selectedMedia}
/>
```

**Fonctionnalités** :

- ✅ Drag & Drop
- ✅ Upload par clic
- ✅ Barre de progression
- ✅ Formats : PNG, JPG, GIF (max 10MB)
- ✅ Bibliothèque de médias
- ✅ Modification et recadrage

### Autres Composants UI

```javascript
import Card from '@/components/ui/Card';
import StatusTag from '@/components/ui/StatusTag';
import Flag from '@/components/ui/Flag';
import Switch from '@/components/ui/Switch';

// Carte
<Card className="p-6">Contenu</Card>

// Badge de statut
<StatusTag status="active">Actif</StatusTag>

// Petit badge
<Flag variant="primary">Nouveau</Flag>

// Interrupteur
<Switch checked={isEnabled} onChange={setIsEnabled} label="Activer"/>
```

## 🏗️ Structure du Projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── page.jsx           # Page d'accueil
│   └── [routes]/          # Autres pages
├── components/             # Composants React
│   ├── ui/                # Composants UI de base
│   │   ├── Button.jsx
│   │   ├── IconButton.jsx
│   │   ├── DeleteButton.jsx
│   │   ├── PublishButton.jsx
│   │   ├── Card.jsx
│   │   ├── Switch.jsx
│   │   └── ...
│   ├── Notification.jsx   # Système de notifications
│   ├── ConfirmModal.jsx   # Modale de confirmation
│   ├── DeleteModal.jsx    # Modale de suppression
│   ├── MediaManager.jsx   # Gestionnaire de médias
│   └── ...
├── contexts/              # Contextes React
├── hooks/                 # Hooks personnalisés
│   ├── useNotification.js # Hook de notifications
│   └── ...
├── scenes/                # Scènes/vues complexes
└── utils/                 # Utilitaires
    ├── axiosClient.js     # Client HTTP
    ├── cn.js              # Combinaison de classes
    └── ...
```

## 🛠️ Technologies

- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS** - Styling
- **Headless UI** - Composants accessibles
- **Heroicons** - Icônes
- **Axios** - Requêtes HTTP
- **clsx** - Gestion des classes

## 📖 Exemples de Code

### Exemple Complet : CRUD avec Notifications

```javascript
"use client";

import { useState, useEffect } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import DeleteButton from '@/components/ui/DeleteButton';
import Notification from '@/components/Notification';
import { useNotification } from '@/hooks/useNotification';
import { useAxiosClient } from '@/utils/axiosClient';

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  const axios = useAxiosClient();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/items');
      setItems(response.data);
    } catch (error) {
      showError("Erreur", "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    await axios.delete(`/api/items/${id}`);
    setItems(items.filter(i => i.id !== id));
    showSuccess("Supprimé", "L'élément a été supprimé");
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des Éléments</h1>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
              <div>
                <h2 className="font-semibold">{item.name}</h2>
                <p className="text-gray-500">{item.description}</p>
              </div>
              <div className="flex gap-2">
                <IconButton
                  icon={PencilIcon}
                  label="Modifier"
                  variant="secondary"
                  hoverExpand
                  onClick={() => router.push(`/items/${item.id}`)}
                />
                <DeleteButton
                  onDelete={() => deleteItem(item.id)}
                  confirmMessage={`Supprimer "${item.name}" ?`}
                  hoverExpand
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Notification
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={hideNotification}
      />
    </div>
  );
}
```

## 🎯 Best Practices

1. **Toujours utiliser les composants UI** au lieu de boutons/éléments HTML natifs
2. **Gérer les notifications** pour chaque action importante
3. **Confirmer les actions destructives** avec ConfirmModal ou DeleteButton
4. **Afficher les états de chargement** sur les boutons
5. **Documenter les nouveaux composants** dans des fichiers `.md`

## 📝 Contribution

1. Consulter [AI_INSTRUCTIONS.md](../../AI_INSTRUCTIONS.md) pour les conventions
2. Utiliser les composants UI existants
3. Tester les modifications
4. Documenter les nouveaux composants

## 🔗 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Heroicons](https://heroicons.com/)
- [Headless UI](https://headlessui.com/)
- [Guide des Utilitaires](./UTILITIES_GUIDE.md)

---

**Dernière mise à jour** : 2025-11-08

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use
the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for
more details.
