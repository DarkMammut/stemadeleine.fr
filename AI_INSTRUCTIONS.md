# Instructions pour les Agents IA - Projet stemadeleine.fr

## 📋 Vue d'ensemble du projet

**stemadeleine.fr** est une application web complète pour la gestion d'un site paroissial avec :

- **Backend API** : Spring Boot 3.5.4 avec Java 21
- **Frontend Frontoffice** : React 19.2.0 (site public)
- **Frontend Backoffice** : Next.js (interface d'administration)
- **Base de données** : PostgreSQL avec versioning de contenu
- **Déploiement** : Docker avec docker-compose

---

## 🏗️ Architecture du projet

### Structure des dossiers

```
stemadeleine.fr/
├── backend/api/           # API Spring Boot
├── frontend/frontoffice/  # Site public (React)
├── frontend/backoffice/   # Interface admin (Next.js)
└── frontend/to_delete/    # Ancien code à supprimer
```

### Stack technique

- **Backend** : Spring Boot, Spring Security, JPA/Hibernate, PostgreSQL
- **Frontend Public** : React, React Router, Axios, TailwindCSS, Heroicons
- **Frontend Admin** : Next.js, TailwindCSS, Framer Motion, Heroicons, Supabase
- **Tests** : JUnit 5, Spring Boot Test, React Testing Library

---

## 🎯 Conventions de développement

### Architecture Backend (Spring Boot)

- **Package structure** : `com.stemadeleine.api.{controller,service,repository,model,config,security}`
- **Naming conventions** :
    - Controllers : `*Controller` (ex: `AuthController`)
    - Services : `*Service` (ex: `ContentService`)
    - Repositories : `*Repository` (ex: `ContentRepository`)
    - Models/Entities : Nom simple (ex: `Content`, `User`)
- **API REST** : Utiliser les annotations Spring (`@RestController`, `@RequestMapping`)
- **Sécurité** : Spring Security avec JWT
- **Tests** : Utiliser `@SpringBootTest` pour les tests d'intégration

### Architecture Frontend

#### React (Frontoffice)

- **Structure** : Components dans `src/components/`, pages dans `src/pages/`
- **Styling** : TailwindCSS uniquement
- **Icons** : Heroicons (@heroicons/react) - toujours utiliser ces icônes
- **State management** : React hooks (useState, useEffect, useContext)
- **Routing** : React Router v6
- **API calls** : **OBLIGATOIRE** - Utiliser le hook `axiosClient` personnalisé du projet

#### Next.js (Backoffice)

- **Structure** : App Router (`src/app/`)
- **Components** : Dans `src/components/`
- **Styling** : TailwindCSS + Framer Motion pour animations
- **Icons** : Heroicons (@heroicons/react) - toujours utiliser ces icônes
- **State** : React hooks + Context API
- **API calls** : **OBLIGATOIRE** - Utiliser le hook `axiosClient` personnalisé du projet

### Base de données

- **Versioning** : Tous les contenus sont versionnés avec `content_id` et `version`
- **Soft delete** : Marquer comme supprimé au lieu de supprimer physiquement
- **Migrations** : Flyway avec fichiers `V*__*.sql`

---

## 🔧 Commandes de développement

```bash
# Démarrer l'API seulement
npm run api

# Reset complet de l'API (supprime volumes Docker)
npm run api:reset

# Démarrer frontend development (frontoffice + backoffice)
npm run dev

# Démarrer tout (API + frontends)
npm run start
```

---

## 📚 Fonctionnalités clés implémentées

### Système de versioning de contenu

- Chaque contenu a un `contentId` (UUID logique) et un `version` (numérique)
- Récupération automatique de la dernière version
- Historique des versions conservé
- Soft delete avec versioning

### Gestion des médias

- Upload et gestion via `MediaService`
- Association aux contenus avec versioning

### Authentification

- JWT avec Spring Security
- Rôles utilisateur (ADMIN, USER, etc.)

---

## 🎨 Préférences de style

### Code Java

- **Indentation** : 4 espaces
- **Naming** : camelCase pour variables/méthodes, PascalCase pour classes
- **Annotations** : Une par ligne pour les principales (`@RestController`, `@Service`)
- **Validation** : Utiliser `@Valid` et annotations de validation
- **Langue** : **OBLIGATOIRE** - Logs et commentaires en ANGLAIS uniquement

### Code JavaScript/TypeScript

- **Indentation** : 2 espaces
- **Quotes** : Doubles quotes pour les strings
- **Props** : Destructuring en paramètres
- **Components** : Functional components avec hooks
- **Langue** : **OBLIGATOIRE** - Logs et commentaires en ANGLAIS uniquement

### CSS/TailwindCSS

- **Classes** : Préférer TailwindCSS aux CSS custom
- **Responsive** : Mobile-first approach
- **Colors** : Utiliser la palette de couleurs définie dans tailwind.config

---

## ⚠️ RÈGLES OBLIGATOIRES

### Frontend - Requêtes API

- **TOUJOURS utiliser le hook `axiosClient` personnalisé** pour les appels API
- **JAMAIS utiliser axios directement** - passer par le hook du projet
- Le hook gère automatiquement l'authentification et les headers

### Frontend - Icônes

- **UNIQUEMENT Heroicons** (@heroicons/react) - pas d'autres librairies d'icônes
- Importer depuis : `import { IconName } from '@heroicons/react/24/outline'` ou `/solid`

### Langue du code

- **Logs, commentaires, messages d'erreur** : **ANGLAIS OBLIGATOIRE**
- **Variables et fonctions** : **ANGLAIS OBLIGATOIRE**
- **Seules les chaînes utilisateur** peuvent être en français

---

## 🚨 Points d'attention importants

### Sécurité

- Toujours valider les entrées utilisateur
- Utiliser `@PreAuthorize` pour les contrôles d'accès
- Pas de données sensibles dans les logs

### Performance

- Lazy loading pour les relations JPA
- Pagination pour les listes longues
- Optimiser les requêtes SQL

### Base de données

- **JAMAIS** supprimer physiquement du contenu
- Toujours créer une nouvelle version pour les modifications
- Utiliser les index appropriés pour les requêtes de versioning

---

## 🔍 Débogage et tests

### Backend

- Logs : Utiliser `@Slf4j` de Lombok
- Tests : Coverage minimum de 80%
- Profils : `dev`, `test`, `prod`

### Frontend

- Console errors : Toujours fixer les warnings React
- Tests : React Testing Library pour les composants
- Debugging : React DevTools

---

## 📖 Documentation à consulter

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

---

## 💡 Conseils pour les agents IA

1. **Toujours analyser le contexte existant** avant de proposer du code
2. **Respecter l'architecture de versioning** pour tout ce qui touche au contenu
3. **Utiliser les services existants** plutôt que de créer de nouveaux
4. **Tester les modifications** avec les outils appropriés
5. **Documenter les changements complexes** dans les commentaires
6. **Suivre les conventions de nommage** établies
7. **Préférer les solutions simples et maintenables**

---

## 🎯 Objectifs du projet

Le projet vise à créer une plateforme moderne pour la gestion d'un site paroissial avec :

- Interface publique intuitive et responsive
- Interface d'administration complète
- Gestion de contenu avec historique
- Sécurité robuste
- Performance optimisée

**Toujours garder l'utilisateur final en tête lors des développements !**
