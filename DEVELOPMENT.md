# Guide de Développement - Sainte-Madeleine

## Architecture du Projet

Ce projet est organisé en plusieurs parties :

- **Backend API** : Spring Boot (Java) dans `backend/api/`
- **Frontend Backoffice** : Next.js 15 (React) dans `frontend/backoffice/`
- **Frontend Frontoffice** : React dans `frontend/frontoffice/`

---

## Backoffice - Composants et Utilitaires

### 1. Système de Notifications

Le système de notifications permet d'afficher des messages contextuels à l'utilisateur.

#### Hook `useNotification`

**Emplacement** : `frontend/backoffice/src/hooks/useNotification.js`

```javascript
import {useNotification} from '@/hooks/useNotification';

function MyComponent() {
    const {notification, showSuccess, showError, showInfo, showWarning, hideNotification} = useNotification();

    const handleSave = async () => {
        try {
            await saveData();
            showSuccess("Succès", "Les données ont été enregistrées avec succès");
        } catch (error) {
            showError("Erreur", "Impossible d'enregistrer les données");
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

#### Composant `Notification`

**Emplacement** : `frontend/backoffice/src/components/Notification.jsx`

**Props** :

- `show` (boolean) : Affiche/masque la notification
- `type` (string) : Type de notification : `'success'`, `'error'`, `'info'`, `'warning'`
- `title` (string) : Titre de la notification
- `message` (string) : Message détaillé (optionnel)
- `onClose` (function) : Callback appelé à la fermeture
- `autoClose` (boolean, default: true) : Fermeture automatique
- `duration` (number, default: 3000) : Durée avant fermeture automatique en ms

**Types de notifications** :

- ✅ **success** : Action réussie (icône CheckCircle, vert)
- ❌ **error** : Erreur (icône XCircle, rouge)
- ℹ️ **info** : Information (icône InformationCircle, bleu)
- ⚠️ **warning** : Avertissement (icône ExclamationTriangle, jaune)

---

### 2. Modale de Confirmation

Le composant `ConfirmModal` permet de demander une confirmation avant une action critique.

**Emplacement** : `frontend/backoffice/src/components/ConfirmModal.jsx`

#### Utilisation de base

```javascript
import {useState} from 'react';
import ConfirmModal from '@/components/ConfirmModal';

function MyComponent() {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteItem();
            setShowConfirm(false);
        } catch (error) {
            console.error(error);
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
                title="Confirmer la suppression"
                message="Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."
                confirmLabel="Supprimer"
                cancelLabel="Annuler"
                isLoading={isDeleting}
                variant="danger"
            />
        </>
    );
}
```

#### Props de `ConfirmModal`

- `open` (boolean, required) : État d'ouverture de la modale
- `onClose` (function, required) : Callback pour fermer la modale
- `onConfirm` (function, required) : Callback appelé lors de la confirmation
- `title` (string, default: "Confirmer l'action") : Titre de la modale
- `message` (string, default: "Êtes-vous sûr...") : Message de confirmation
- `confirmLabel` (string, default: "Confirmer") : Label du bouton de confirmation
- `cancelLabel` (string, default: "Annuler") : Label du bouton d'annulation
- `isLoading` (boolean, default: false) : État de chargement
- `variant` (string, default: "danger") : Variante du bouton de confirmation (`'danger'`, `'primary'`)

---

### 3. MediaManager - Gestion des Images

Le `MediaManager` permet de gérer les médias (upload, sélection, modification) dans l'application.

**Emplacement** : `frontend/backoffice/src/components/MediaManager.jsx`

#### Composants du système de médias

##### MediaManager (Composant principal)

Zone de drag & drop + navigation dans la bibliothèque de médias

```javascript
import MediaManager from '@/components/MediaManager';

function MyComponent() {
    const [selectedMedia, setSelectedMedia] = useState(null);

    return (
        <MediaManager
            onUploadComplete={(media) => {
                console.log('Média uploadé:', media);
                setSelectedMedia(media);
            }}
            onBrowseClick={() => {
                // Ouvrir la bibliothèque de médias
            }}
        />
    );
}
```

##### MediaSelector

Sélecteur de médias depuis la bibliothèque

##### MediaModifier

Éditeur de médias (recadrage, métadonnées)

##### MediaPicker

Sélecteur simple de média

##### MediaGrid

Grille d'affichage des médias

#### Fonctionnalités

- **Drag & Drop** : Glisser-déposer des fichiers directement
- **Upload par clic** : Clic sur la zone pour sélectionner un fichier
- **Barre de progression** : Affichage du pourcentage d'upload
- **Formats acceptés** : PNG, JPG, JPEG, GIF, WebP, SVG (max 10MB)
- **Bibliothèque de médias** : Navigation dans les médias existants
- **Modification** : Édition des médias (recadrage, métadonnées)

---

### 4. Boutons UI

Le système de boutons offre une interface cohérente avec plusieurs variantes et tailles.

#### Composant `Button`

**Emplacement** : `frontend/backoffice/src/components/ui/Button.jsx`

```javascript
import Button from '@/components/ui/Button';

<Button variant="primary" size="md" onClick={handleClick}>
    Enregistrer
</Button>

<Button variant="danger" size="sm" loading={isDeleting}>
    Supprimer
</Button>
```

**Props** :

- `variant` (string) : Style du bouton
    - `'primary'` : Bouton principal (indigo)
    - `'secondary'` : Bouton secondaire (gris)
    - `'danger'` : Action dangereuse (rouge)
    - `'ghost'` : Transparent avec hover
    - `'link'` : Style de lien (bleu)
    - `'outline'` : Bordure avec fond blanc
    - `'refresh'` : Bouton de rafraîchissement (vert)
    - `'filter'` : Bouton de filtre (bleu)
- `size` (string) : Taille du bouton (`'sm'`, `'md'`, `'lg'`)
- `loading` (boolean) : État de chargement (affiche "Chargement...")
- `as` (string, default: "button") : Élément HTML à utiliser
- `className` (string) : Classes CSS supplémentaires
- `disabled` (boolean) : Désactive le bouton

#### Composant `IconButton`

**Emplacement** : `frontend/backoffice/src/components/ui/IconButton.jsx`

Bouton avec icône et texte optionnel, supporte le mode "hover-expand".

```javascript
import IconButton from '@/components/ui/IconButton';
import {PencilIcon, TrashIcon} from '@heroicons/react/24/outline';

// Bouton avec icône et label
<IconButton
    icon={PencilIcon}
    label="Modifier"
    variant="primary"
    size="md"
    onClick={handleEdit}
/>

// Icon-only (pas de label)
<IconButton
    icon={TrashIcon}
    variant="danger"
    size="sm"
    onClick={handleDelete}
/>

// Hover-expand : label apparaît au survol
<IconButton
    icon={PencilIcon}
    label="Modifier"
    variant="secondary"
    hoverExpand
    onClick={handleEdit}
/>
```

**Props** :

- `icon` (Component, required) : Composant d'icône (Heroicons)
- `label` (string) : Texte du bouton (optionnel)
- `variant` (string) : Même que `Button`
- `size` (string) : `'sm'`, `'md'`, `'lg'`
- `hoverExpand` (boolean, default: false) : Le label apparaît au survol
- `onClick` (function) : Gestionnaire de clic
- `disabled` (boolean) : Désactive le bouton
- `className` (string) : Classes CSS supplémentaires

#### Composant `DeleteButton`

**Emplacement** : `frontend/backoffice/src/components/ui/DeleteButton.jsx`

Bouton de suppression avec modale de confirmation intégrée.

```javascript
import DeleteButton from '@/components/ui/DeleteButton';

<DeleteButton
    onDelete={async () => {
        await deleteItem(itemId);
    }}
    onSuccess={() => {
        showSuccess("Suppression réussie");
        refreshList();
    }}
    confirmTitle="Supprimer l'élément"
    confirmMessage="Êtes-vous sûr ? Cette action est irréversible."
    deleteLabel="Supprimer"
    confirmLabel="Confirmer la suppression"
    size="md"
    hoverExpand
    requireConfirmation={true}
/>
```

**Props** :

- `onDelete` (function, required) : Fonction appelée lors de la confirmation
- `onSuccess` (function) : Callback après suppression réussie
- `disabled` (boolean) : Désactive le bouton
- `deleteLabel` (string, default: "Supprimer") : Texte du bouton
- `confirmTitle` (string) : Titre de la modale de confirmation
- `confirmMessage` (string) : Message de confirmation
- `confirmLabel` (string, default: "Supprimer") : Label du bouton de confirmation
- `size` (string) : Taille du bouton
- `hoverExpand` (boolean) : Mode hover-expand
- `requireConfirmation` (boolean, default: true) : Active/désactive la modale

#### Composant `PublishButton`

**Emplacement** : `frontend/backoffice/src/components/ui/PublishButton.jsx`

Bouton de publication avec feedback visuel.

```javascript
import PublishButton from '@/components/ui/PublishButton';

<PublishButton
    onPublish={async () => {
        await publishContent();
    }}
    publishLabel="Publier"
    publishedLabel="À jour"
    size="md"
    resetAfterDelay={true}
/>
```

**Props** :

- `onPublish` (function, required) : Fonction appelée lors du clic
- `disabled` (boolean) : Désactive le bouton
- `publishLabel` (string, default: "Publier") : Texte du bouton
- `publishedLabel` (string, default: "À jour") : Texte affiché après publication
- `size` (string) : Taille du bouton
- `resetAfterDelay` (boolean, default: true) : Remet le bouton à l'état initial après 3s

#### Autres Boutons Spécialisés

- **BackButton** : Bouton de retour (navigation arrière)
- **RefreshButton** : Bouton de rafraîchissement
- **SendButton** : Bouton d'envoi
- **DownloadButton** : Bouton de téléchargement

---

### 5. Autres Composants UI

#### StatusTag

**Emplacement** : `frontend/backoffice/src/components/ui/StatusTag.jsx`

Badge coloré pour afficher un statut.

#### Flag

**Emplacement** : `frontend/backoffice/src/components/ui/Flag.jsx`

Petit drapeau/badge d'information.

#### Switch

**Emplacement** : `frontend/backoffice/src/components/ui/Switch.jsx`

Interrupteur on/off.

#### Card

**Emplacement** : `frontend/backoffice/src/components/ui/Card.jsx`

Conteneur avec bordure et ombre.

---

## Bonnes Pratiques

### 1. Gestion des erreurs

```javascript
const {showSuccess, showError} = useNotification();

try {
    await saveData();
    showSuccess("Succès", "Données enregistrées");
} catch (error) {
    console.error(error);
    showError("Erreur", error.message || "Une erreur est survenue");
}
```

### 2. Actions destructives

Toujours utiliser `ConfirmModal` ou `DeleteButton` pour les actions destructives (suppression, désactivation, etc.).

```javascript
// ❌ Ne pas faire
<button onClick={deleteItem}>Supprimer</button>

// ✅ Faire
<DeleteButton
    onDelete={deleteItem}
    confirmMessage="Cette action est irréversible"
/>
```

### 3. Feedback utilisateur

- Utiliser `loading` sur les boutons pendant les opérations asynchrones
- Afficher des notifications pour confirmer les actions
- Désactiver les boutons pendant le chargement

```javascript
const [loading, setLoading] = useState(false);

const handleSave = async () => {
    setLoading(true);
    try {
        await saveData();
        showSuccess("Enregistré");
    } catch (error) {
        showError("Erreur");
    } finally {
        setLoading(false);
    }
};

<Button loading={loading} onClick={handleSave}>
    Enregistrer
</Button>
```

### 4. Accessibilité

Tous les composants UI sont conçus avec l'accessibilité en tête :

- Attributs ARIA appropriés
- Support du clavier
- Contrastes de couleurs respectant WCAG
- Focus visible

---

## Structure de Dossiers du Backoffice

```
frontend/backoffice/src/
├── app/                    # Pages Next.js (App Router)
├── components/             # Composants React
│   ├── ui/                 # Composants UI réutilisables
│   │   ├── Button.jsx
│   │   ├── IconButton.jsx
│   │   ├── DeleteButton.jsx
│   │   ├── PublishButton.jsx
│   │   └── ...
│   ├── Notification.jsx
│   ├── ConfirmModal.jsx
│   ├── MediaManager.jsx
│   └── ...
├── contexts/               # Contextes React
├── hooks/                  # Hooks personnalisés
│   └── useNotification.js
├── scenes/                 # Scènes/vues complexes
└── utils/                  # Utilitaires
    ├── axiosClient.js
    └── ...
```

---

## Technologies Utilisées

### Backend

- **Java 17+**
- **Spring Boot 3.x**
- **Spring Data JPA**
- **PostgreSQL**
- **Maven**

### Frontend Backoffice

- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS**
- **Headless UI**
- **Heroicons**
- **Axios**

### Frontend Frontoffice

- **React 18**
- **React Router**
- **Tailwind CSS**

---

## Commandes de Développement

### Backend (API)

```bash
cd backend/api
./mvnw spring-boot:run              # Démarrer l'API
./mvnw test                         # Lancer les tests
./mvnw clean package                # Compiler
```

### Frontend Backoffice

```bash
cd frontend/backoffice
npm install                         # Installer les dépendances
npm run dev                         # Démarrer en développement
npm run build                       # Compiler pour production
npm run start                       # Démarrer en production
```

### Frontend Frontoffice

```bash
cd frontend/frontoffice
npm install                         # Installer les dépendances
npm start                           # Démarrer en développement
npm run build                       # Compiler pour production
```

### Docker

```bash
docker-compose up                   # Démarrer tous les services
docker-compose up --build           # Reconstruire et démarrer
docker-compose down                 # Arrêter tous les services
```

---

## Contribution

1. Créer une branche pour votre fonctionnalité
2. Respecter les conventions de nommage
3. Tester vos modifications
4. Documenter les nouveaux composants
5. Créer une pull request

---

## Support

Pour toute question ou problème, consultez :

- La documentation dans `frontend/backoffice/UTILITIES_GUIDE.md`
- Les fichiers `.md` dans les dossiers de composants
- Le guide de configuration reCAPTCHA : `RECAPTCHA_SETUP_GUIDE.md`
- Le guide de formulaire de contact : `CONTACT_FORM_GUIDE.md`

