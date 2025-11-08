# Sainte-Madeleine - Site Web Paroissial

Site web complet pour la paroisse Sainte-Madeleine, comprenant un backoffice de gestion de contenu et un frontoffice
pour l'affichage public.

## 🏗️ Architecture

- **Backend API** : Spring Boot (Java) - `backend/api/`
- **Backoffice** : Next.js 15 - `frontend/backoffice/`
- **Frontoffice** : React 18 - `frontend/frontoffice/`

## 📚 Documentation

### Guides Principaux

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Guide complet de développement
    - Architecture du projet
    - Composants UI (Notifications, Modales, Boutons, MediaManager)
    - Bonnes pratiques
    - Exemples de code
    - Commandes de développement

- **[AI_INSTRUCTIONS.md](./AI_INSTRUCTIONS.md)** - Instructions pour l'IA
    - Conventions de codage
    - Patterns recommandés
    - Checklist pour nouvelles fonctionnalités
    - Exemples de composants complets

### Guides Spécifiques

- **[CONTACT_FORM_GUIDE.md](./CONTACT_FORM_GUIDE.md)** - Configuration du formulaire de contact
- **[RECAPTCHA_SETUP_GUIDE.md](./RECAPTCHA_SETUP_GUIDE.md)** - Configuration de reCAPTCHA

### Documentation du Backoffice

- **[frontend/backoffice/UTILITIES_GUIDE.md](./frontend/backoffice/UTILITIES_GUIDE.md)** - Guide détaillé des
  utilitaires et composants
    - Système de notifications
    - Modales de confirmation
    - Composants de boutons (Button, IconButton, DeleteButton, PublishButton)
    - Gestion des médias (MediaManager, MediaPicker, etc.)
    - Composants UI de base
    - Hooks personnalisés
    - Utilitaires

### Documentation des Composants

- **[IconButton.md](./frontend/backoffice/src/components/ui/IconButton.md)** - Documentation du composant IconButton
- **[DeleteModal.md](./frontend/backoffice/src/components/DeleteModal.md)** - Documentation du composant DeleteModal

## 🚀 Démarrage Rapide

### Prérequis

- **Java 17+** (pour le backend)
- **Node.js 18+** (pour le frontend)
- **PostgreSQL** (pour la base de données)
- **Docker** (optionnel, pour le déploiement)

### Installation

#### Avec Docker (Recommandé)

```bash
docker-compose up --build
```

#### Sans Docker

**Backend (API)**

```bash
cd backend/api
./mvnw spring-boot:run
```

**Backoffice**

```bash
cd frontend/backoffice
npm install
npm run dev
```

**Frontoffice**

```bash
cd frontend/frontoffice
npm install
npm start
```

## 🎨 Composants UI Principaux

### Système de Notifications

```javascript
import { useNotification } from '@/hooks/useNotification';
import Notification from '@/components/Notification';

const { notification, showSuccess, showError, hideNotification } = useNotification();

// Afficher une notification
showSuccess("Succès", "L'opération a réussi");
showError("Erreur", "Une erreur est survenue");
```

### Modales de Confirmation

```javascript
import ConfirmModal from '@/components/ConfirmModal';

<ConfirmModal
  open={showModal}
  onClose={() => setShowModal(false)}
  onConfirm={handleAction}
  title="Confirmer l'action"
  message="Êtes-vous sûr ?"
/>
```

### Boutons Intelligents

```javascript
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import DeleteButton from '@/components/ui/DeleteButton';
import PublishButton from '@/components/ui/PublishButton';

// Bouton standard
<Button variant="primary" loading={isLoading}>Enregistrer</Button>

// Bouton avec icône
<IconButton icon={PencilIcon} label="Modifier" hoverExpand/>

// Bouton de suppression avec confirmation
<DeleteButton onDelete={deleteItem} confirmMessage="Supprimer ?"/>

// Bouton de publication
<PublishButton onPublish={publishContent}/>
```

### Gestion des Médias

```javascript
import MediaManager from '@/components/MediaManager';

<MediaManager
  onUploadComplete={(media) => setSelectedMedia(media)}
  onBrowseClick={() => setShowLibrary(true)}
/>
```

## 🛠️ Technologies Utilisées

### Backend

- Spring Boot 3.x
- Spring Data JPA
- PostgreSQL
- Maven
- Java 17+

### Frontend Backoffice

- Next.js 15 (App Router)
- React 19
- Tailwind CSS
- Headless UI
- Heroicons
- Axios

### Frontend Frontoffice

- React 18
- React Router
- Tailwind CSS

## 📦 Structure du Projet

```
stemadeleine.fr/
├── backend/
│   └── api/                    # API Spring Boot
│       ├── src/
│       ├── pom.xml
│       └── ...
├── frontend/
│   ├── backoffice/            # Backoffice Next.js
│   │   ├── src/
│   │   │   ├── app/           # Pages Next.js
│   │   │   ├── components/    # Composants React
│   │   │   │   └── ui/        # Composants UI réutilisables
│   │   │   ├── hooks/         # Hooks personnalisés
│   │   │   └── utils/         # Utilitaires
│   │   ├── UTILITIES_GUIDE.md
│   │   └── package.json
│   └── frontoffice/           # Frontoffice React
│       ├── src/
│       └── package.json
├── DEVELOPMENT.md             # Guide de développement
├── AI_INSTRUCTIONS.md         # Instructions pour l'IA
├── CONTACT_FORM_GUIDE.md
├── RECAPTCHA_SETUP_GUIDE.md
├── docker-compose.yml
└── README.md
```

## 🧪 Tests

### Backend

```bash
cd backend/api
./mvnw test
```

### Frontend

```bash
cd frontend/backoffice
npm test

cd frontend/frontoffice
npm test
```

## 🚢 Déploiement

### Production avec Docker

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Build des Applications

**Backend**

```bash
cd backend/api
./mvnw clean package
```

**Backoffice**

```bash
cd frontend/backoffice
npm run build
npm run start
```

**Frontoffice**

```bash
cd frontend/frontoffice
npm run build
```

## 📝 Contribution

### Workflow de Développement

1. Créer une branche pour votre fonctionnalité
2. Suivre les conventions dans `AI_INSTRUCTIONS.md`
3. Utiliser les composants UI documentés
4. Tester vos modifications
5. Documenter les nouveaux composants
6. Créer une pull request

### Conventions de Code

- **Composants** : PascalCase (`MyComponent.jsx`)
- **Fichiers utilitaires** : camelCase (`myHelper.js`)
- **Hooks** : camelCase avec `use` (`useMyHook.js`)
- **Constantes** : UPPER_SNAKE_CASE (`MAX_ITEMS`)

Consultez [AI_INSTRUCTIONS.md](./AI_INSTRUCTIONS.md) pour plus de détails.

## 🔒 Sécurité

- reCAPTCHA sur les formulaires publics
- Validation côté serveur
- HTTPS en production
- Tokens JWT pour l'authentification
- Variables d'environnement pour les secrets

## 📞 Support

Pour toute question ou problème :

1. Consultez la documentation dans `DEVELOPMENT.md`
2. Vérifiez le guide des utilitaires dans `frontend/backoffice/UTILITIES_GUIDE.md`
3. Consultez les fichiers `.md` des composants spécifiques

## 📄 Licence

Tous droits réservés - Paroisse Sainte-Madeleine

## 🔗 Liens Utiles

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation React](https://react.dev)
- [Documentation Spring Boot](https://spring.io/projects/spring-boot)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Heroicons](https://heroicons.com/)
- [Headless UI](https://headlessui.com/)

---

**Dernière mise à jour** : 2025-11-08

