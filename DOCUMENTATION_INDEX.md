# Index de la Documentation

Ce fichier liste toute la documentation disponible pour le projet Sainte-Madeleine.

## 📚 Documentation Principale

### Guides Généraux

| Fichier                      | Description                            | Emplacement |
|------------------------------|----------------------------------------|-------------|
| **README.md**                | Présentation générale du projet        | Racine      |
| **DEVELOPMENT.md**           | Guide complet de développement         | Racine      |
| **AI_INSTRUCTIONS.md**       | Instructions et conventions pour l'IA  | Racine      |
| **CONTACT_FORM_GUIDE.md**    | Configuration du formulaire de contact | Racine      |
| **RECAPTCHA_SETUP_GUIDE.md** | Configuration de reCAPTCHA             | Racine      |

## 🎨 Documentation du Backoffice

### Guide Principal

| Fichier                | Description                                 | Emplacement            |
|------------------------|---------------------------------------------|------------------------|
| **UTILITIES_GUIDE.md** | Guide complet des composants et utilitaires | `frontend/backoffice/` |
| **README.md**          | Documentation du backoffice                 | `frontend/backoffice/` |

### Documentation des Composants

#### Composants de Base

| Composant         | Fichier Documentation | Emplacement                                               |
|-------------------|-----------------------|-----------------------------------------------------------|
| **IconButton**    | `IconButton.md`       | `frontend/backoffice/src/components/ui/`                  |
| **Button**        | Code source documenté | `frontend/backoffice/src/components/ui/Button.jsx`        |
| **DeleteButton**  | Code source documenté | `frontend/backoffice/src/components/ui/DeleteButton.jsx`  |
| **PublishButton** | Code source documenté | `frontend/backoffice/src/components/ui/PublishButton.jsx` |

#### Modales

| Composant        | Fichier Documentation | Emplacement                                           |
|------------------|-----------------------|-------------------------------------------------------|
| **ConfirmModal** | Code source documenté | `frontend/backoffice/src/components/ConfirmModal.jsx` |
| **DeleteModal**  | `DeleteModal.md`      | `frontend/backoffice/src/components/`                 |

#### Notifications

| Composant/Hook      | Fichier Documentation | Emplacement                                           |
|---------------------|-----------------------|-------------------------------------------------------|
| **Notification**    | Code source documenté | `frontend/backoffice/src/components/Notification.jsx` |
| **useNotification** | Code source documenté | `frontend/backoffice/src/hooks/useNotification.js`    |

#### Gestion des Médias

| Composant         | Fichier Documentation | Emplacement                                            |
|-------------------|-----------------------|--------------------------------------------------------|
| **MediaManager**  | Code source documenté | `frontend/backoffice/src/components/MediaManager.jsx`  |
| **MediaPicker**   | Code source documenté | `frontend/backoffice/src/components/MediaPicker.jsx`   |
| **MediaSelector** | Code source documenté | `frontend/backoffice/src/components/MediaSelector.jsx` |
| **MediaEditor**   | Code source documenté | `frontend/backoffice/src/components/MediaEditor.jsx`   |
| **MediaModifier** | Code source documenté | `frontend/backoffice/src/components/MediaModifier.jsx` |
| **MediaGrid**     | Code source documenté | `frontend/backoffice/src/components/MediaGrid.jsx`     |

## 🔍 Index par Sujet

### Système de Notifications

- **Guide principal** : `UTILITIES_GUIDE.md` → Section "Système de Notifications"
- **DEVELOPMENT.md** → Section "Système de Notifications"
- **Code source** :
    - `frontend/backoffice/src/components/Notification.jsx`
    - `frontend/backoffice/src/hooks/useNotification.js`

**Concepts couverts** :

- Hook `useNotification`
- Composant `Notification`
- Types de notifications (success, error, info, warning)
- Exemples d'utilisation

### Modales de Confirmation

- **Guide principal** : `UTILITIES_GUIDE.md` → Section "Modales"
- **DEVELOPMENT.md** → Section "Modale de Confirmation"
- **Documentation spécifique** :
    - `frontend/backoffice/src/components/DeleteModal.md`
- **Code source** :
    - `frontend/backoffice/src/components/ConfirmModal.jsx`
    - `frontend/backoffice/src/components/DeleteModal.jsx`

**Concepts couverts** :

- ConfirmModal générique
- DeleteModal spécialisée
- Props et configuration
- Exemples d'utilisation
- Comparaison DeleteModal vs DeleteButton

### Boutons UI

- **Guide principal** : `UTILITIES_GUIDE.md` → Section "Boutons"
- **DEVELOPMENT.md** → Section "Boutons UI"
- **Documentation spécifique** :
    - `frontend/backoffice/src/components/ui/IconButton.md`
- **Code source** :
    - `frontend/backoffice/src/components/ui/Button.jsx`
    - `frontend/backoffice/src/components/ui/IconButton.jsx`
    - `frontend/backoffice/src/components/ui/DeleteButton.jsx`
    - `frontend/backoffice/src/components/ui/PublishButton.jsx`
    - `frontend/backoffice/src/components/ui/BackButton.jsx`
    - `frontend/backoffice/src/components/ui/RefreshButton.jsx`

**Concepts couverts** :

- Composant Button et ses variantes
- IconButton et mode hover-expand
- DeleteButton avec confirmation intégrée
- PublishButton avec feedback visuel
- Boutons spécialisés (Back, Refresh, Send, Download)
- Tailles et états de chargement

### Gestion des Médias

- **Guide principal** : `UTILITIES_GUIDE.md` → Section "Gestion des Médias"
- **DEVELOPMENT.md** → Section "MediaManager - Gestion des Images"
- **Code source** :
    - `frontend/backoffice/src/components/MediaManager.jsx`
    - `frontend/backoffice/src/components/MediaPicker.jsx`
    - `frontend/backoffice/src/components/MediaSelector.jsx`
    - `frontend/backoffice/src/components/MediaEditor.jsx`
    - `frontend/backoffice/src/components/MediaModifier.jsx`
    - `frontend/backoffice/src/components/MediaGrid.jsx`

**Concepts couverts** :

- Upload par drag & drop
- Upload par clic
- Barre de progression
- Bibliothèque de médias
- Sélection de médias
- Modification et recadrage

### Conventions de Développement

- **Guide principal** : `AI_INSTRUCTIONS.md`
- **DEVELOPMENT.md** → Section "Bonnes Pratiques"

**Concepts couverts** :

- Nommage des fichiers et composants
- Organisation des imports
- Structure du code
- Patterns recommandés
- Checklist pour nouvelles fonctionnalités
- Gestion des erreurs
- Accessibilité

## 📖 Comment Utiliser Cette Documentation

### Pour Débuter

1. Lire **README.md** pour comprendre l'architecture
2. Consulter **DEVELOPMENT.md** pour les concepts clés
3. Lire **frontend/backoffice/UTILITIES_GUIDE.md** pour les composants disponibles

### Pour Développer une Nouvelle Fonctionnalité

1. Consulter **AI_INSTRUCTIONS.md** pour les conventions
2. Chercher dans **UTILITIES_GUIDE.md** les composants existants
3. Voir **DEVELOPMENT.md** pour les patterns recommandés
4. Utiliser les exemples dans la documentation des composants

### Pour Comprendre un Composant Spécifique

1. Commencer par **UTILITIES_GUIDE.md** pour une vue d'ensemble
2. Consulter le fichier `.md` spécifique du composant si disponible
3. Lire les commentaires dans le code source
4. Voir les exemples dans **DEVELOPMENT.md**

### Pour Configurer des Fonctionnalités

| Fonctionnalité        | Guide à Consulter          |
|-----------------------|----------------------------|
| Formulaire de contact | `CONTACT_FORM_GUIDE.md`    |
| reCAPTCHA             | `RECAPTCHA_SETUP_GUIDE.md` |
| Composants UI         | `UTILITIES_GUIDE.md`       |
| Architecture générale | `DEVELOPMENT.md`           |
| Conventions de code   | `AI_INSTRUCTIONS.md`       |

## 🔧 Commandes Utiles

### Développement

```bash
# Démarrer le backoffice
cd frontend/backoffice && npm run dev

# Démarrer l'API
cd backend/api && ./mvnw spring-boot:run

# Tout démarrer avec Docker
docker-compose up
```

### Build

```bash
# Build du backoffice
cd frontend/backoffice && npm run build

# Build de l'API
cd backend/api && ./mvnw clean package

# Build avec Docker
docker-compose build
```

## 📝 Contribuer à la Documentation

Lors de l'ajout de nouveaux composants :

1. **Documenter le composant** :
    - Ajouter des commentaires JSDoc dans le code
    - Créer un fichier `.md` si le composant est complexe
    - Ajouter des exemples d'utilisation

2. **Mettre à jour les guides** :
    - Ajouter une section dans `UTILITIES_GUIDE.md`
    - Mentionner dans `DEVELOPMENT.md` si c'est un concept clé
    - Mettre à jour `AI_INSTRUCTIONS.md` si ça impacte les conventions

3. **Mettre à jour cet index** :
    - Ajouter le nouveau composant dans la section appropriée
    - Ajouter des liens vers la documentation

## 🔄 Dernières Mises à Jour

| Date       | Fichiers Mis à Jour | Description                           |
|------------|---------------------|---------------------------------------|
| 2025-11-08 | Tous                | Création complète de la documentation |

## 🎯 Prochaines Étapes

Documentation à créer ou améliorer :

- [ ] Guide de déploiement détaillé
- [ ] Documentation de l'API backend
- [ ] Guide de contribution
- [ ] Documentation des tests
- [ ] Guide de migration/mise à jour

---

**Dernière mise à jour** : 2025-11-08

Pour toute question ou suggestion, consultez d'abord les guides existants avant de créer de nouvelle documentation.

