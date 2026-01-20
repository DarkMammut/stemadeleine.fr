# 📘 Backoffice - Guide Complet

Backoffice de gestion de contenu pour stemadeleine.fr, développé avec Next.js 15.

---

## 🚀 Démarrage

### Installation

```bash
cd frontend/backoffice
npm install
```

### Développement

```bash
npm run dev
```

Accès : http://localhost:3001

### Build de Production

```bash
npm run build
npm run start
```

---

## 🏗️ Architecture

### Structure des Dossiers

```
frontend/backoffice/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── page.js             # Landing page
│   │   ├── auth/
│   │   │   └── login/          # Page de connexion
│   │   ├── dashboard/          # Tableau de bord
│   │   ├── pages/              # Gestion des pages
│   │   ├── news/               # Gestion des actualités
│   │   ├── newsletters/        # Gestion des newsletters
│   │   ├── users/              # Gestion des utilisateurs
│   │   ├── contacts/           # Gestion des contacts
│   │   └── settings/           # Paramètres
│   ├── components/             # Composants réutilisables
│   │   ├── ui/                 # Composants UI de base
│   │   └── ...                 # Composants métier
│   ├── scenes/                 # Scènes (vues complexes)
│   ├── hooks/                  # Hooks personnalisés
│   ├── utils/                  # Utilitaires
│   └── styles/                 # Styles globaux
└── public/                     # Fichiers statiques
```

### Technologies

- **Framework** : Next.js 15 (App Router)
- **UI** : React 18, Tailwind CSS
- **Icônes** : Heroicons
- **HTTP** : Axios
- **Authentification** : Cookie HTTPOnly (JWT)

---

## 🎨 Composants UI

### 1. Système de Notifications

Affichage de messages contextuels à l'utilisateur.

#### Hook `useNotification`

```javascript
import {useNotification} from '@/hooks/useNotification';
import Notification from '@/components/ui/Notification';

function MyComponent() {
    const {notification, showSuccess, showError, showInfo, showWarning, hideNotification} = useNotification();

    const handleSave = async () => {
        try {
            await saveData();
            showSuccess("Succès", "Les données ont été enregistrées");
        } catch (error) {
            showError("Erreur", "Impossible d'enregistrer");
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

#### Types de notifications

- ✅ `success` : Action réussie (vert)
- ❌ `error` : Erreur (rouge)
- ℹ️ `info` : Information (bleu)
- ⚠️ `warning` : Avertissement (jaune)

---

### 2. Boutons

#### Button (Standard)

```javascript
import Button from '@/components/ui/Button';

<Button variant="primary" size="md" loading={isLoading}>
    Enregistrer
</Button>
```

**Variantes** : `primary`, `secondary`, `danger`, `success`, `ghost`  
**Tailles** : `sm`, `md`, `lg`

#### IconButton (Avec Icône)

```javascript
import IconButton from '@/components/ui/IconButton';
import {PencilIcon} from '@heroicons/react/24/outline';

// Avec label
<IconButton icon={PencilIcon} label="Modifier" variant="primary"/>

// Icon-only
<IconButton icon={PencilIcon} variant="secondary"/>

// Hover-expand (label au survol)
<IconButton icon={PencilIcon} label="Modifier" hoverExpand/>
```

#### DeleteButton

```javascript
import DeleteButton from '@/components/ui/DeleteButton';

<DeleteButton onClick={handleDelete} loading={isDeleting}/>
```

#### PublishButton

```javascript
import PublishButton from '@/components/ui/PublishButton';

<PublishButton
    isPublished={page.isPublished}
    onClick={handlePublish}
    loading={isPublishing}
/>
```

---

### 3. Modales

#### ConfirmModal (Confirmation générique)

```javascript
import ConfirmModal from '@/components/ConfirmModal';

<ConfirmModal
    open={showConfirm}
    onClose={() => setShowConfirm(false)}
    onConfirm={handleConfirm}
    title="Confirmer l'action"
    message="Êtes-vous sûr de vouloir continuer ?"
    confirmLabel="Confirmer"
    cancelLabel="Annuler"
    isLoading={isLoading}
    variant="danger"
/>
```

#### DeleteModal (Suppression spécialisée)

```javascript
import DeleteModal from '@/components/DeleteModal';

<DeleteModal
    open={showDelete}
    onClose={() => setShowDelete(false)}
    onConfirm={handleDelete}
    title="Supprimer l'élément"
    itemName="cette actualité"
    isLoading={isDeleting}
/>
```

---

### 4. MediaManager (Gestion des Images)

Upload et gestion des médias avec drag & drop.

```javascript
import MediaManager from '@/components/MediaManager';

<MediaManager
    onUploadComplete={(media) => {
        console.log('Média uploadé:', media);
        setSelectedMedia(media);
    }}
    onBrowseClick={() => {
        // Ouvrir la bibliothèque de médias
    }}
/>
```

**Fonctionnalités** :

- Drag & drop de fichiers
- Upload par clic
- Barre de progression
- Formats acceptés : PNG, JPG, GIF (max 10MB)
- Bibliothèque de médias

---

### 5. BackButton (Bouton Retour)

```javascript
import BackButton from '@/components/ui/BackButton';

// Retour automatique (router.back())
<BackButton/>

// Retour vers une URL spécifique
<BackButton to="/pages" label="Retour aux pages"/>

// Toujours visible
<BackButton autoHide={false}/>
```

---

## 🔐 Authentification

### Système d'Authentification

- **Cookie HTTPOnly** : `authToken` (JWT) créé par le backend
- **SameSite=None** : Permet les requêtes cross-domain
- **Secure=true** : Cookie sécurisé en production

### Protection des Routes

Le middleware Next.js (`middleware.js`) protège automatiquement les routes.

#### Routes Publiques

- `/` : Landing page
- `/auth/login` : Page de connexion

#### Routes Protégées

Toutes les autres routes (`/dashboard`, `/news`, `/users`, etc.) nécessitent une authentification.

### Hook useLogin

```javascript
import useLogin from '@/utils/auth/useLogin';

const {login, loading, error} = useLogin();

const handleLogin = async (email, password) => {
    const success = await login(email, password);
    if (success) {
        router.push('/dashboard');
    }
};
```

### Bouton Dev Login

Le bouton "Dev Login" n'est visible qu'en développement local :

```javascript
{
    process.env.NODE_ENV === 'development' && (
        <button onClick={handleDevLogin}>Dev Login</button>
    )
}
```

**En production** : Le bouton est complètement masqué.

---

## 🌐 Configuration

### Variables d'Environnement

Créez un fichier `.env.local` :

```bash
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Production (Vercel)

```bash
NEXT_PUBLIC_BACKEND_URL=https://stemadeleine-api.onrender.com
NEXT_PUBLIC_API_URL=https://stemadeleine-api.onrender.com
```

---

## 🛠️ Développement

### Créer une Nouvelle Page

1. Créez un fichier dans `src/app/[nom-page]/page.js`
2. Créez la scène correspondante dans `src/scenes/[NomPage].jsx`
3. Ajoutez la route dans `src/utils/navigation.js`

**Exemple** :

```javascript
// src/app/ma-page/page.js
"use client";
import {useState} from "react";
import Layout from "@/components/ui/Layout";
import MaPage from "@/scenes/MaPage";

export default function MaPagePage() {
    const [current, setCurrent] = useState("ma-page");

    return (
        <Layout current={current} setCurrent={setCurrent}>
            <MaPage/>
        </Layout>
    );
}
```

```javascript
// src/scenes/MaPage.jsx
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";

export default function MaPage() {
    return (
        <SceneLayout>
            <Title label="Ma Nouvelle Page"/>
            {/* Contenu */}
        </SceneLayout>
    );
}
```

### Utiliser les Hooks

#### useAxiosClient

```javascript
import {useAxiosClient} from '@/utils/axiosClient';

const axios = useAxiosClient();

// GET
const response = await axios.get('/api/news');

// POST
await axios.post('/api/news', data);

// PUT
await axios.put('/api/news/1', data);

// DELETE
await axios.delete('/api/news/1');
```

#### useNotification

```javascript
import {useNotification} from '@/hooks/useNotification';

const {showSuccess, showError} = useNotification();

showSuccess("Succès", "Opération réussie");
showError("Erreur", "Une erreur est survenue");
```

---

## 📦 Composants Avancés

### EditablePanel

Panneau avec formulaire éditable et gestion automatique de l'état.

```javascript
import EditablePanelV2 from '@/components/ui/EditablePanel';

const fields = [
    {
        name: "title",
        label: "Titre",
        type: "text",
        required: true
    },
    {
        name: "content",
        label: "Contenu",
        type: "textarea",
        rows: 5
    }
];

<EditablePanelV2
    title="Détails"
    fields={fields}
    initialValues={data}
    onSubmit={handleSubmit}
    loading={isSaving}
    displayColumns={2}
/>
```

### DataTable

Table de données avec tri, filtrage et pagination.

```javascript
import DataTable from '@/components/ui/DataTable';

const columns = [
    {key: 'name', label: 'Nom', sortable: true},
    {key: 'email', label: 'Email', sortable: true},
    {key: 'createdAt', label: 'Date', sortable: true}
];

<DataTable
    data={users}
    columns={columns}
    onRowClick={(user) => router.push(`/users/${user.id}`)}
    loading={isLoading}
/>
```

---

## 🎯 Bonnes Pratiques

### 1. Utiliser les Hooks Personnalisés

Au lieu de dupliquer la logique, utilisez les hooks existants :

- `useNotification` pour les messages
- `useAxiosClient` pour les requêtes HTTP
- `useLogin` pour l'authentification

### 2. Gérer les États de Chargement

Toujours afficher un état de chargement pendant les opérations asynchrones :

```javascript
const [loading, setLoading] = useState(false);

const handleSave = async () => {
    setLoading(true);
    try {
        await axios.post('/api/data', data);
        showSuccess("Enregistré");
    } catch (error) {
        showError("Erreur");
    } finally {
        setLoading(false);
    }
};
```

### 3. Nettoyer les Effets

```javascript
useEffect(() => {
    loadData();
    return () => hideNotification(); // Cleanup
}, []);
```

### 4. Validation des Formulaires

Validez les données côté client avant d'envoyer au backend :

```javascript
const handleSubmit = (data) => {
    if (!data.title) {
        showError("Erreur", "Le titre est requis");
        return;
    }
    // Envoyer au backend
};
```

---

## 🐛 Débogage

### Vérifier les Cookies

Dans la console du navigateur :

```javascript
document.cookie
```

### Vérifier l'Authentification

```javascript
// Vérifie si le cookie authToken existe
const isAuth = document.cookie.includes('authToken=');
console.log('Authentifié:', isAuth);
```

### Logs Backend

Les requêtes sont loggées dans la console du navigateur et dans les logs Render.

---

## 📚 Documentation Complémentaire

- **[DEPLOYMENT.md](../../DEPLOYMENT.md)** - Guide de déploiement complet
- **[STEMADELEINE.md](../../STEMADELEINE.md)** - Guide du site principal
- **[API.md](../../API.md)** - Guide de l'API backend

---

**✅ Backoffice prêt pour le développement et la production !**
