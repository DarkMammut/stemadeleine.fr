# Instructions pour l'IA - Projet Sainte-Madeleine

## Contexte du Projet

Ce projet est un site web pour la paroisse Sainte-Madeleine, comprenant :

- Un **backoffice** (Next.js 15) pour la gestion de contenu
- Un **frontoffice** (React) pour l'affichage public
- Une **API backend** (Spring Boot/Java) pour la logique métier

## Architecture et Technologies

### Backend (API)

- **Framework** : Spring Boot 3.x
- **Langage** : Java 17+
- **Base de données** : PostgreSQL
- **Build** : Maven
- **Emplacement** : `backend/api/`

### Frontend Backoffice

- **Framework** : Next.js 15 (App Router)
- **Langage** : JavaScript/React 19
- **Styling** : Tailwind CSS
- **Composants UI** : Headless UI, Heroicons
- **HTTP Client** : Axios
- **Emplacement** : `frontend/backoffice/`

### Frontend Frontoffice

- **Framework** : React 18
- **Routing** : React Router
- **Styling** : Tailwind CSS
- **Emplacement** : `frontend/frontoffice/`

---

## Règles de Développement

### 1. Structure du Code

#### Backoffice

```
frontend/backoffice/src/
├── app/                    # Pages Next.js (App Router)
│   ├── page.jsx           # Page principale
│   └── [autres-pages]/
├── components/             # Composants réutilisables
│   ├── ui/                # Composants UI de base
│   │   ├── Button.jsx
│   │   ├── IconButton.jsx
│   │   ├── DeleteButton.jsx
│   │   ├── PublishButton.jsx
│   │   ├── Card.jsx
│   │   ├── Switch.jsx
│   │   ├── StatusTag.jsx
│   │   └── Flag.jsx
│   ├── Notification.jsx   # Système de notifications
│   ├── ConfirmModal.jsx   # Modale de confirmation
│   ├── MediaManager.jsx   # Gestion des médias
│   └── [autres]/
├── contexts/              # Contextes React
├── hooks/                 # Hooks personnalisés
│   └── useNotification.js
├── scenes/                # Scènes/vues complexes
└── utils/                 # Utilitaires
    ├── axiosClient.js
    └── [autres]/
```

### 2. Conventions de Codage

#### Nommage

- **Composants** : PascalCase (`MyComponent.jsx`)
- **Fichiers utilitaires** : camelCase (`myHelper.js`)
- **Hooks** : camelCase avec préfixe `use` (`useMyHook.js`)
- **Constantes** : UPPER_SNAKE_CASE (`MAX_ITEMS`)
- **Variables/fonctions** : camelCase (`myVariable`, `myFunction`)

#### Organisation des Imports

```javascript
// 1. Imports externes
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Imports de composants UI
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';

// 3. Imports de composants locaux
import MyComponent from '@/components/MyComponent';

// 4. Imports de hooks
import { useNotification } from '@/hooks/useNotification';

// 5. Imports d'utilitaires
import { axiosClient } from '@/utils/axiosClient';

// 6. Imports d'icônes (en dernier)
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
```

### 3. Composants UI - Utilisation Obligatoire

#### Système de Notifications

**Toujours utiliser** le hook `useNotification` pour les retours utilisateur :

```javascript
import { useNotification } from '@/hooks/useNotification';
import Notification from '@/components/Notification';

function MyComponent() {
  const { notification, showSuccess, showError, showInfo, showWarning, hideNotification } = useNotification();

  const handleAction = async () => {
    try {
      await performAction();
      showSuccess("Succès", "L'action a été effectuée");
    } catch (error) {
      showError("Erreur", error.message || "Une erreur est survenue");
    }
  };

  return (
    <>
      {/* Votre contenu */}

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

**Types de notifications** :

- `showSuccess()` : Opération réussie
- `showError()` : Erreur
- `showInfo()` : Information
- `showWarning()` : Avertissement

#### Modale de Confirmation

**Toujours utiliser** `ConfirmModal` pour les actions destructives :

```javascript
import { useState } from 'react';
import ConfirmModal from '@/components/ConfirmModal';

function MyComponent() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDangerousAction = async () => {
    setIsLoading(true);
    try {
      await performDangerousAction();
      setShowConfirm(false);
      showSuccess("Action effectuée");
    } catch (error) {
      showError("Erreur", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>Action Dangereuse</button>

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDangerousAction}
        title="Confirmer l'action"
        message="Êtes-vous sûr ? Cette action est irréversible."
        confirmLabel="Confirmer"
        isLoading={isLoading}
        variant="danger"
      />
    </>
  );
}
```

#### Boutons

**Utiliser les composants de boutons** au lieu de `<button>` natif :

```javascript
// ❌ Ne PAS faire
<button className="bg-blue-500..." onClick={handleClick}>Cliquez</button>

// ✅ Faire
import Button from '@/components/ui/Button';

<Button variant="primary" onClick={handleClick}>Cliquez</Button>

// Pour les boutons avec icône
import IconButton from '@/components/ui/IconButton';
import { PencilIcon } from '@heroicons/react/24/outline';

<IconButton icon={PencilIcon} label="Modifier" variant="primary" onClick={handleEdit}/>

// Pour les suppressions
import DeleteButton from '@/components/ui/DeleteButton';

<DeleteButton
  onDelete={deleteItem}
  onSuccess={refreshList}
  confirmMessage="Supprimer cet élément ?"
/>

// Pour les publications
import PublishButton from '@/components/ui/PublishButton';

<PublishButton onPublish={publishContent}/>
```

**Variantes de Button** :

- `primary` : Action principale (bleu indigo)
- `secondary` : Action secondaire (gris)
- `danger` : Action destructive (rouge)
- `ghost` : Bouton transparent
- `link` : Style de lien
- `outline` : Bordure avec fond blanc
- `refresh` : Rafraîchissement (vert)
- `filter` : Filtre (bleu)

**Tailles** : `sm`, `md`, `lg`

#### Gestion des Médias

**Utiliser MediaManager** pour l'upload et la gestion des images :

```javascript
import MediaManager from '@/components/MediaManager';
import MediaPicker from '@/components/MediaPicker';
import MediaSelector from '@/components/MediaSelector';

// Upload de média
<MediaManager
  onUploadComplete={(media) => {
    console.log('Média uploadé:', media);
    setSelectedMedia(media);
  }}
/>

// Sélection d'un média existant
<MediaPicker
  onSelect={(media) => setSelectedMedia(media)}
  selectedMedia={selectedMedia}
/>
```

### 4. Gestion des États de Chargement

**Toujours indiquer** les états de chargement :

```javascript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await performAction();
  } finally {
    setLoading(false);
  }
};

<Button loading={loading} onClick={handleAction}>
  Enregistrer
</Button>
```

### 5. Gestion des Erreurs

**Pattern standard** pour la gestion des erreurs :

```javascript
const { showError, showSuccess } = useNotification();

try {
  const result = await apiCall();
  showSuccess("Succès", "Opération réussie");
  return result;
} catch (error) {
  console.error('Erreur détaillée:', error);
  showError(
    "Erreur",
    error.response?.data?.message || error.message || "Une erreur est survenue"
  );
  // Ne pas re-throw sauf si nécessaire
}
```

### 6. Appels API

**Utiliser axiosClient** pour tous les appels API :

```javascript
import { useAxiosClient } from '@/utils/axiosClient';

function MyComponent() {
  const axios = useAxiosClient();

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/my-endpoint');
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
}
```

### 7. Styling avec Tailwind

**Préférer** Tailwind CSS aux styles personnalisés :

```javascript
// ✅ Bien
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow">
  {/* Contenu */}
</div>

// ❌ Éviter
<div style={{ display: 'flex', gap: '16px', padding: '24px' }}>
  {/* Contenu */}
</div>
```

**Utiliser `clsx`** pour les classes conditionnelles :

```javascript
import clsx from 'clsx';

<div className={clsx(
  "base-class",
  isActive && "active-class",
  isDisabled && "disabled-class"
)}>
  {/* Contenu */}
</div>
```

### 8. Accessibilité

**Toujours respecter** les bonnes pratiques d'accessibilité :

- Utiliser des balises sémantiques (`<button>`, `<nav>`, `<main>`, etc.)
- Ajouter des labels aux inputs
- Utiliser `aria-label` quand nécessaire
- Assurer la navigation au clavier
- Respecter les contrastes de couleurs

```javascript
// ✅ Bien
<button aria-label="Fermer la modale" onClick={onClose}>
  <XMarkIcon className="w-5 h-5"/>
</button>

// ❌ Éviter
<div onClick={onClose}>
  <XMarkIcon className="w-5 h-5"/>
</div>
```

### 9. Commentaires et Documentation

**Documenter** les composants complexes :

```javascript
/**
 * Composant de gestion des utilisateurs
 *
 * @param {Array} users - Liste des utilisateurs
 * @param {Function} onUpdate - Callback appelé lors de la mise à jour
 * @param {boolean} loading - État de chargement
 */
export default function UserManager({ users, onUpdate, loading }) {
  // ...
}
```

### 10. Performance

**Optimiser** les rendus avec `useMemo` et `useCallback` quand approprié :

```javascript
import { useMemo, useCallback } from 'react';

const filteredItems = useMemo(
  () => items.filter(item => item.active),
  [items]
);

const handleClick = useCallback(
  (id) => {
    performAction(id);
  },
  [performAction]
);
```

---

## Patterns Courants

### 1. CRUD Standard

```javascript
function MyList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();
  const axios = useAxiosClient();

  // Lecture
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

  // Création
  const createItem = async (data) => {
    try {
      const response = await axios.post('/api/items', data);
      setItems([...items, response.data]);
      showSuccess("Créé", "L'élément a été créé");
    } catch (error) {
      showError("Erreur", "Impossible de créer l'élément");
    }
  };

  // Mise à jour
  const updateItem = async (id, data) => {
    try {
      const response = await axios.put(`/api/items/${id}`, data);
      setItems(items.map(item => item.id === id ? response.data : item));
      showSuccess("Mis à jour", "L'élément a été mis à jour");
    } catch (error) {
      showError("Erreur", "Impossible de mettre à jour l'élément");
    }
  };

  // Suppression
  const deleteItem = async (id) => {
    try {
      await axios.delete(`/api/items/${id}`);
      setItems(items.filter(item => item.id !== id));
      showSuccess("Supprimé", "L'élément a été supprimé");
    } catch (error) {
      showError("Erreur", "Impossible de supprimer l'élément");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        items.map(item => (
          <div key={item.id}>
            {item.name}
            <IconButton
              icon={PencilIcon}
              onClick={() => updateItem(item.id, { name: 'Nouveau nom' })}
            />
            <DeleteButton
              onDelete={() => deleteItem(item.id)}
              confirmMessage="Supprimer cet élément ?"
            />
          </div>
        ))
      )}
    </div>
  );
}
```

### 2. Formulaire avec Validation

```javascript
function MyForm({ onSubmit, initialData = {} }) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Le nom est requis";
    if (!formData.email) newErrors.email = "L'email est requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      showSuccess("Enregistré", "Le formulaire a été soumis");
    } catch (error) {
      showError("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Nettoyer l'erreur du champ modifié
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nom</label>
        <input
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      <Button type="submit" loading={loading} variant="primary">
        Enregistrer
      </Button>
    </form>
  );
}
```

---

## Checklist pour Nouvelles Fonctionnalités

Avant de considérer une fonctionnalité comme terminée :

- [ ] Les notifications sont affichées pour les actions importantes
- [ ] Les modales de confirmation sont utilisées pour les actions destructives
- [ ] Les états de chargement sont gérés
- [ ] Les erreurs sont capturées et affichées
- [ ] Les composants UI du système sont utilisés (Button, IconButton, etc.)
- [ ] Le code est commenté si nécessaire
- [ ] Les bonnes pratiques d'accessibilité sont respectées
- [ ] Le responsive design est pris en compte
- [ ] Les imports sont organisés correctement
- [ ] Le code est testé manuellement

---

## Exemples de Composants Complets

### Exemple : Page de Gestion d'Articles

```javascript
"use client";

import { useState, useEffect } from 'react';
import { PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import DeleteButton from '@/components/ui/DeleteButton';
import Card from '@/components/ui/Card';
import Notification from '@/components/Notification';
import { useNotification } from '@/hooks/useNotification';
import { useAxiosClient } from '@/utils/axiosClient';

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  const axios = useAxiosClient();

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/articles');
      setArticles(response.data);
    } catch (error) {
      showError("Erreur", "Impossible de charger les articles");
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async (id) => {
    await axios.delete(`/api/articles/${id}`);
    setArticles(articles.filter(a => a.id !== id));
    showSuccess("Supprimé", "L'article a été supprimé");
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Articles</h1>
        <Button variant="primary" onClick={() => router.push('/articles/new')}>
          <PlusIcon className="w-5 h-5 mr-2"/>
          Nouvel article
        </Button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="grid gap-4">
          {articles.map(article => (
            <Card key={article.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{article.title}</h2>
                  <p className="text-gray-500">{article.summary}</p>
                </div>
                <div className="flex gap-2">
                  <IconButton
                    icon={PencilIcon}
                    label="Modifier"
                    variant="secondary"
                    hoverExpand
                    onClick={() => router.push(`/articles/${article.id}`)}
                  />
                  <DeleteButton
                    onDelete={() => deleteArticle(article.id)}
                    confirmMessage={`Supprimer l'article "${article.title}" ?`}
                    hoverExpand
                  />
                </div>
              </div>
            </Card>
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

---

## Points d'Attention

### 1. Next.js 15 Spécificités

- Utiliser `"use client"` pour les composants avec hooks/interactivité
- Préférer le App Router aux Pages Router
- Utiliser `useRouter` de `next/navigation` (pas `next/router`)

### 2. Sécurité

- Ne jamais exposer de secrets dans le code frontend
- Valider les données côté backend
- Utiliser HTTPS en production
- Implémenter reCAPTCHA pour les formulaires publics

### 3. Performance

- Lazy loading pour les images
- Code splitting avec dynamic imports
- Minimiser les re-rendus inutiles
- Utiliser React DevTools Profiler

---

## Ressources

- Documentation Next.js : https://nextjs.org/docs
- Documentation Tailwind CSS : https://tailwindcss.com/docs
- Heroicons : https://heroicons.com/
- Headless UI : https://headlessui.com/

---

**Note** : Ce document doit être maintenu à jour avec l'évolution du projet. Toute nouvelle convention ou pattern doit
être documenté ici.

