# 🏛️ Les Amis de Sainte-Madeleine de la Jarrie

Site web et backoffice de l'association Les Amis de Sainte-Madeleine de la Jarrie.

## 📚 Table des matières

- [Architecture](#architecture)
- [Démarrage rapide](#démarrage-rapide)
- [Fonctionnalités](#fonctionnalités)
- [Documentation](#documentation)
- [Scripts utiles](#scripts-utiles)

## 🏗️ Architecture

Le projet est composé de 3 parties principales :

```
stemadeleine.fr/
├── backend/api/          # API Spring Boot (Java)
├── frontend/
│   ├── backoffice/      # Interface d'administration (Next.js)
│   └── stemadeleine/    # Site public (Next.js)
└── infra/               # Configuration infrastructure
```

### Technologies

- **Backend** : Spring Boot 3.x, Java 17, PostgreSQL (Supabase)
- **Frontend** : Next.js 15, React 19, TailwindCSS
- **Base de données** : PostgreSQL (Supabase)
- **Déploiement** : Render.com

## 🚀 Démarrage rapide

### Prérequis

- Java 17+
- Node.js 18+
- Maven 3.8+
- PostgreSQL (ou compte Supabase)

### Backend

```bash
cd backend/api
./mvnw spring-boot:run
```

Le backend sera accessible sur http://localhost:8080

### Frontend Backoffice

```bash
cd frontend/backoffice
npm install
npm run dev
```

Le backoffice sera accessible sur http://localhost:3001

### Frontend Site Public

```bash
cd frontend/stemadeleine
npm install
npm run dev
```

Le site public sera accessible sur http://localhost:3000

## ✨ Fonctionnalités

### Backoffice (Administration)

- 🔐 Authentification avec JWT
- 👥 Gestion des utilisateurs et rôles
- 📰 Gestion des actualités
- 📧 Gestion des newsletters
- 💰 Gestion des paiements/adhésions
- 👤 Gestion des contacts
- 🎨 Personnalisation du site (couleurs, logos, favicon)
- 🖼️ Gestionnaire de médias

### Site Public

- 🏠 Page d'accueil avec bannière personnalisable
- 📰 Actualités
- 📧 Newsletter
- 📱 Responsive design
- 🎨 Thème personnalisable depuis le backoffice
- ⚡ Performance optimisée (SSR, SSG)

## 🎨 Personnalisation

### Favicon dynamique

Le site supporte maintenant des **favicons dynamiques** configurables depuis le backoffice !

#### Comment changer le favicon

1. Démarrer le backoffice
2. Aller dans **Paramètres du site** (`/settings`)
3. Section **"Favicon du site"**
4. Cliquer sur **"Ajouter un média"**
5. Uploader une image (ICO, PNG ou SVG)
6. Le favicon se met à jour automatiquement ! ✨

#### Test rapide

```bash
# Script de diagnostic
chmod +x test-favicon.sh
./test-favicon.sh

# Guide de démarrage
chmod +x start-favicon-test.sh
./start-favicon-test.sh
```

📖 **Documentation complète** : [FAVICON_GUIDE.md](FAVICON_GUIDE.md)

### Thème et couleurs

Les couleurs du site peuvent être personnalisées depuis le backoffice :

- Couleur primaire
- Couleur secondaire
- Couleur de fond
- Couleur du texte

## 📖 Documentation

### Guides principaux

- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Guide de développement
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guide de déploiement
- **[API.md](API.md)** - Documentation de l'API

### Guides spécifiques

- **[FAVICON_GUIDE.md](FAVICON_GUIDE.md)** - Guide complet du système de favicon
- **[BACKOFFICE.md](BACKOFFICE.md)** - Documentation du backoffice
- **[FIX_META_FAVICON_BANNER.md](FIX_META_FAVICON_BANNER.md)** - Modifications meta tags
- **[FIX_DYNAMIC_FAVICON.md](FIX_DYNAMIC_FAVICON.md)** - Implémentation favicon dynamique

## 🛠️ Scripts utiles

### Tests

```bash
# Tester le backend
cd backend/api
./mvnw test

# Tester les routes API
./test-api-routes.sh

# Tester le favicon
./test-favicon.sh

# Tester CORS
./test-cors-config.sh
```

### Développement

```bash
# Générer un secret JWT
./generate-jwt-secret.sh

# Aide rapide
./help.sh

# Démarrer le test du favicon
./start-favicon-test.sh
```

### Déploiement

```bash
# Build du backend
cd backend/api
./mvnw clean package -DskipTests

# Build du backoffice
cd frontend/backoffice
npm run build

# Build du site public
cd frontend/stemadeleine
npm run build
```

## 🔧 Configuration

### Variables d'environnement

#### Backend (.env ou application.properties)

```properties
spring.datasource.url=jdbc:postgresql://...
spring.datasource.username=postgres
spring.datasource.password=...
jwt.secret=...
jwt.expiration=86400000
```

#### Backoffice (.env.local)

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

#### Site Public (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="Sainte-Madeleine"
```

## 🐛 Dépannage

### Le backend ne démarre pas

- Vérifier que Java 17+ est installé : `java -version`
- Vérifier que PostgreSQL est accessible
- Vérifier les variables d'environnement

### Le frontend ne démarre pas

- Vérifier que Node.js 18+ est installé : `node -v`
- Supprimer `node_modules` et `.next` puis réinstaller : `rm -rf node_modules .next && npm install`
- Vérifier les variables d'environnement dans `.env.local`

### Le favicon ne change pas

- Forcer le rafraîchissement : `Ctrl+Shift+R` (Mac: `Cmd+Shift+R`)
- Vérifier que le backend est accessible
- Lancer le diagnostic : `./test-favicon.sh`
- Consulter [FAVICON_GUIDE.md](FAVICON_GUIDE.md)

### Erreur CORS

- Vérifier la configuration CORS du backend
- Vérifier que les URLs dans `.env.local` sont correctes
- Tester avec : `./test-cors-config.sh`

## 🤝 Contribution

Pour contribuer au projet :

1. Créer une branche pour votre fonctionnalité
2. Faire vos modifications
3. Tester localement
4. Créer une pull request

## 📝 License

Propriété de l'association Les Amis de Sainte-Madeleine de la Jarrie.

## 📞 Support

Pour toute question ou problème, consultez d'abord la documentation dans le dossier du projet.

---

**Dernière mise à jour** : Février 2026
