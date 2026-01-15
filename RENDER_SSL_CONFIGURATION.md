# Configuration SSL et déploiement sur Render

## 🔐 Configuration SSL Supabase

### Sur le Dashboard Supabase

1. **NE PAS activer "Enforce SSL on incoming connections"**
    - Cette option rejetterait les connexions non-SSL et pourrait bloquer votre application
    - Le pooler Supabase gère déjà automatiquement le SSL

2. **Le certificat SSL est OPTIONNEL**
    - Vous n'avez pas besoin de télécharger le certificat
    - Le paramètre `sslmode=require` dans l'URL suffit
    - Supabase gère automatiquement le SSL via le Session Pooler

### Pourquoi le Session Pooler (port 6543) ?

Render utilise uniquement **IPv4**, mais Supabase utilise **IPv6** par défaut sur le port 5432 (connexion directe).

**Plateformes IPv4-only** (qui nécessitent le pooler) :

- ✅ Render
- ✅ Vercel
- ✅ GitHub Actions
- ✅ Retool

**Solution** : Utiliser le **Session Pooler** sur le **port 6543** qui supporte IPv4.

---

## 📋 Configuration Render - Web Service

### Formulaire de création du Web Service

| Champ                              | Valeur                                                  |
|------------------------------------|---------------------------------------------------------|
| **Name**                           | `stemadeleine-api` (ou le nom de votre choix)           |
| **Language**                       | `Docker`                                                |
| **Branch**                         | `main` (ou `backoffice` si c'est votre branche de prod) |
| **Region**                         | `Frankfurt (EU Central)` (le plus proche de Paris)      |
| **Root Directory**                 | `backend/api`                                           |
| **Docker Build Context Directory** | `backend/api`                                           |
| **Docker Command**                 | _(laisser vide, utilise le CMD du Dockerfile)_          |

### Build & Deploy

| Champ             | Valeur                            |
|-------------------|-----------------------------------|
| **Build Command** | _(géré par Docker, laisser vide)_ |
| **Start Command** | _(géré par Docker, laisser vide)_ |

### Health Check Path

| Champ                 | Valeur             |
|-----------------------|--------------------|
| **Health Check Path** | `/actuator/health` |

Votre application Spring Boot expose automatiquement ce endpoint grâce à Spring Boot Actuator.

---

## 🔧 Variables d'environnement Render

### Variables à configurer (cliquez sur "Add Environment Variable") :

#### 1. Base de données (Supabase PostgreSQL)

```
DATABASE_URL=jdbc:postgresql://aws-1-eu-west-3.pooler.supabase.com:6543/postgres?user=postgres.eahwfewbtyndxbqfifuh&password=Lajarrie17220&sslmode=require
```

⚠️ **IMPORTANT** :

- Host : **aws-1-eu-west-3.pooler.supabase.com** (Transaction Pooler)
- Port **6543** (compatible IPv4)
- Username complet : `postgres.eahwfewbtyndxbqfifuh`
- `sslmode=require` active le SSL

#### 2. JWT Secret

```
JWT_SECRET_KEY=B9F5AC8D37E4F2C1D6A0E8B3F7C4D1A9E2B5F8C3A6D9E0B7F4C1A8D5E2B9F6C3A7D0E4B1F8C5A2E9D6B3F7C0A4E1B8D5F2C9A6E3B0D7F4A1C8E5B2F9D6C3A0E7B4F1
```

#### 3. Supabase Storage (S3)

```
S3_ACCESS_KEY_ID=8e63ae45988dfc0755a1136c5b77a6c0
S3_SECRET_ACCESS_KEY=1a85134618d6a7542b87a875eb23c663fb296bc2f08e0fece1c0902a34d78b6f
S3_BUCKET=medias-prod
S3_REGION=eu-west-3
S3_ENDPOINT=https://eahwfewbtyndxbqfifuh.supabase.co/storage/v1/s3
```

⚠️ **ATTENTION** : Utilisez `medias-prod` (pas `medias-dev`) pour la production !

#### 4. HelloAsso API

```
HELLOASSO_CLIENT_ID=5f742ced506f4344b3d1cc4bc0af1e8c
HELLOASSO_CLIENT_SECRET=L8MGUHDqhQh7emERRYsFiF087oRU/x8v
```

#### 5. reCAPTCHA

```
RECAPTCHA_SECRET_KEY=VOTRE_VRAIE_CLE_RECAPTCHA
```

⚠️ **NE PAS utiliser** la clé de test `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe` en production !

---

## 🚫 Variables à NE PAS mettre dans Render

❌ **Supprimez ces variables** si vous les avez ajoutées :

- `SUPABASE_DB_URL`
- `SUPABASE_DB_USER`
- `SUPABASE_DB_PASSWORD`

✅ **Utilisez uniquement** `DATABASE_URL` qui contient tout.

---

## 🧪 Tester la connexion en local

Avant de déployer sur Render, testez en local avec la nouvelle configuration :

```bash
cd backend/api
./mvnw spring-boot:run
```

Si vous voyez des logs Flyway qui se connectent et appliquent les migrations, c'est bon ✅

---

## 🔍 Diagnostic des erreurs courantes

### Erreur : "The connection attempt failed"

**Cause** : Mauvaise URL ou mauvais credentials
**Solution** : Vérifiez que vous utilisez :

- Port **6543** (pas 5432)
- Username complet avec suffixe : `postgres.eahwfewbtyndxbqfifuh`
- Le bon mot de passe

### Erreur : "url must start with jdbc"

**Cause** : L'URL ne commence pas par `jdbc:`
**Solution** : Vérifiez que votre DATABASE_URL commence bien par `jdbc:postgresql://`

### Erreur : "SSL connection required"

**Cause** : Supabase nécessite SSL
**Solution** : Ajoutez `&sslmode=require` à la fin de votre URL

### Erreur : "No suitable driver found"

**Cause** : Driver PostgreSQL manquant
**Solution** : Vérifiez que `postgresql` est dans votre `pom.xml` (déjà fait ✅)

---

## 📦 Vérification du Dockerfile

Votre `backend/api/Dockerfile` doit :

1. Exposer le port 8080
2. Utiliser Java 21
3. Copier le JAR généré par Maven

Si vous avez des problèmes, vérifiez que votre Dockerfile contient bien :

```dockerfile
EXPOSE 8080
```

---

## 🎯 Checklist de déploiement

- [ ] Variables d'environnement configurées dans Render
- [ ] `DATABASE_URL` utilise le port **6543** (Session Pooler)
- [ ] `DATABASE_URL` contient `sslmode=require`
- [ ] Health Check configuré sur `/actuator/health`
- [ ] Docker Build Context = `backend/api`
- [ ] Region = Frankfurt (EU Central)
- [ ] Bucket S3 = `medias-prod` (pas `medias-dev`)
- [ ] reCAPTCHA : vraie clé (pas la clé de test)

---

## 🚀 Déploiement

Une fois tout configuré :

1. Cliquez sur **"Create Web Service"**
2. Render va :
    - Cloner votre repo GitHub
    - Builder l'image Docker
    - Démarrer le conteneur
    - Faire un health check sur `/actuator/health`
3. Surveillez les logs pour voir si la connexion à Supabase fonctionne

**Durée estimée** : 5-10 minutes pour le premier déploiement.

---

## 📱 URLs finales

Après le déploiement, Render vous donnera une URL comme :

```
https://stemadeleine-api.onrender.com
```

Vous pourrez tester :

- Health check : `https://stemadeleine-api.onrender.com/actuator/health`
- API : `https://stemadeleine-api.onrender.com/api/public/pages`

---

## 🆘 Support

Si vous rencontrez des problèmes, vérifiez les logs dans Render :

- Dashboard → Votre service → **Logs**

Les logs Spring Boot vous indiqueront exactement où est le problème.

