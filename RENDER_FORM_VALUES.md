# 🎯 Configuration Render - Formulaire Web Service

## Étape 1 : Création du Web Service

### Informations générales

```
Name: stemadeleine-api
Environment: Web Service
```

### Repository

```
Repository: votre-repo-github/stemadeleine.fr
Branch: main (ou backoffice)
```

---

## Étape 2 : Configuration

### Language

```
⚠️ ATTENTION : Choisir "Docker" (pas Java)
```

Render ne propose pas Java directement, mais votre projet utilise un Dockerfile qui gère tout.

### Build & Deploy

```
Root Directory: backend/api
Build Command: (laisser vide - géré par Docker)
Start Command: (laisser vide - géré par Docker)
```

### Docker

```
Docker Build Context Directory: backend/api
Docker Command: (laisser vide - utilise ENTRYPOINT du Dockerfile)
```

### Region

```
Region: Frankfurt (EU Central)
```

💡 C'est le plus proche de la France et de votre base Supabase.

### Instance Type

```
Instance Type: Free (pour commencer)
```

⚠️ Attention : Le plan gratuit s'endort après 15 min d'inactivité.

---

## Étape 3 : Advanced Settings

### Health Check Path

```
Health Check Path: /actuator/health
```

💡 Spring Boot Actuator expose automatiquement ce endpoint.

### Auto-Deploy

```
☑️ Auto-Deploy: Yes
```

L'application se redéploiera automatiquement à chaque push sur la branche.

---

## Étape 4 : Variables d'environnement

Cliquez sur **"Add Environment Variable"** pour chaque variable :

### 1️⃣ DATABASE_URL

```
Key: DATABASE_URL
Value: jdbc:postgresql://aws-1-eu-west-3.pooler.supabase.com:6543/postgres?user=postgres.eahwfewbtyndxbqfifuh&password=Lajarrie17220&sslmode=require
```

💡 **Transaction Pooler** : URL officielle fournie par Supabase, optimisée pour Flyway

### 2️⃣ JWT_SECRET_KEY

```
Key: JWT_SECRET_KEY
Value: B9F5AC8D37E4F2C1D6A0E8B3F7C4D1A9E2B5F8C3A6D9E0B7F4C1A8D5E2B9F6C3A7D0E4B1F8C5A2E9D6B3F7C0A4E1B8D5F2C9A6E3B0D7F4A1C8E5B2F9D6C3A0E7B4F1
```

### 3️⃣ S3_ACCESS_KEY_ID

```
Key: S3_ACCESS_KEY_ID
Value: 8e63ae45988dfc0755a1136c5b77a6c0
```

### 4️⃣ S3_SECRET_ACCESS_KEY

```
Key: S3_SECRET_ACCESS_KEY
Value: 1a85134618d6a7542b87a875eb23c663fb296bc2f08e0fece1c0902a34d78b6f
```

### 5️⃣ S3_BUCKET

```
Key: S3_BUCKET
Value: medias-prod
```

⚠️ **IMPORTANT** : Utilisez `medias-prod` en production (pas `medias-dev`)

### 6️⃣ S3_REGION

```
Key: S3_REGION
Value: eu-west-3
```

### 7️⃣ S3_ENDPOINT

```
Key: S3_ENDPOINT
Value: https://eahwfewbtyndxbqfifuh.supabase.co/storage/v1/s3
```

### 8️⃣ HELLOASSO_CLIENT_ID

```
Key: HELLOASSO_CLIENT_ID
Value: 5f742ced506f4344b3d1cc4bc0af1e8c
```

### 9️⃣ HELLOASSO_CLIENT_SECRET

```
Key: HELLOASSO_CLIENT_SECRET
Value: L8MGUHDqhQh7emERRYsFiF087oRU/x8v
```

### 🔟 RECAPTCHA_SECRET_KEY

```
Key: RECAPTCHA_SECRET_KEY
Value: VOTRE_VRAIE_CLE_RECAPTCHA_PRODUCTION
```

⚠️ **NE PAS utiliser** `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe` (clé de test)

Allez sur https://www.google.com/recaptcha/admin pour obtenir votre vraie clé.

---

## ✅ Checklist avant de cliquer sur "Create Web Service"

- [ ] Language = **Docker**
- [ ] Root Directory = `backend/api`
- [ ] Docker Build Context Directory = `backend/api`
- [ ] Health Check Path = `/actuator/health`
- [ ] Region = Frankfurt (EU Central)
- [ ] **10 variables d'environnement** configurées
- [ ] DATABASE_URL utilise le **port 6543** (Session Pooler)
- [ ] DATABASE_URL contient `&sslmode=require`
- [ ] S3_BUCKET = `medias-prod` (pas `medias-dev`)
- [ ] RECAPTCHA_SECRET_KEY = vraie clé (pas la clé de test)

---

## 🚀 Déploiement

Cliquez sur **"Create Web Service"** !

Render va :

1. ✅ Cloner votre repository GitHub
2. ✅ Builder l'image Docker (Maven compile, package)
3. ✅ Démarrer le conteneur
4. ✅ Vérifier le health check sur `/actuator/health`
5. ✅ Exposer votre API sur une URL publique

**Durée estimée** : 5-10 minutes

---

## 📊 Surveillance du déploiement

### Logs à surveiller

Allez dans **Dashboard** → **Votre service** → **Logs**

Vous devriez voir :

```
✅ Downloading dependencies from Maven Central
✅ Building with Maven
✅ Starting Spring Boot application
✅ Connected to Supabase PostgreSQL
✅ Flyway migrations applied successfully
✅ Tomcat started on port 8080
✅ Started ApiApplication in X seconds
```

### Erreurs courantes

#### ❌ "The connection attempt failed"

**Problème** : Connexion à la base de données échouée
**Solution** : Vérifiez votre `DATABASE_URL` (port 6543, bon username, bon password)

#### ❌ "url must start with jdbc"

**Problème** : URL mal formatée
**Solution** : Vérifiez que votre URL commence par `jdbc:postgresql://`

#### ❌ "Flyway failed to initialize"

**Problème** : Flyway ne peut pas se connecter ou exécuter les migrations
**Solution** : Vérifiez les droits de votre utilisateur PostgreSQL sur Supabase

#### ❌ "Health check failed"

**Problème** : L'application ne répond pas sur `/actuator/health`
**Solution** : Vérifiez que l'application démarre bien (logs)

---

## 🎉 Succès !

Une fois le déploiement réussi, vous verrez :

```
✅ Service is live
🌐 Your service is available at: https://stemadeleine-api.onrender.com
```

### Tests à faire

1. **Health Check**
   ```
   https://stemadeleine-api.onrender.com/actuator/health
   ```
   Devrait retourner : `{"status":"UP"}`

2. **API publique**
   ```
   https://stemadeleine-api.onrender.com/api/public/pages
   ```
   Devrait retourner la liste des pages

3. **Test CORS** (depuis votre frontend)
   Vérifiez que les requêtes depuis votre frontend Next.js fonctionnent

---

## 🔄 Redéploiement

Pour redéployer :

- **Automatique** : Pushez sur votre branche GitHub
- **Manuel** : Dashboard → Votre service → "Manual Deploy" → "Clear build cache & deploy"

---

## 💰 Coûts

- **Plan Free** : Gratuit, mais l'application s'endort après 15 min d'inactivité
    - Premier accès après sommeil : ~30 secondes de délai
    - 750 heures/mois gratuites

- **Plan Starter** : $7/mois
    - Pas de sommeil
    - 0.1 CPU, 512 MB RAM
    - Idéal pour commencer

---

## 🔗 Configuration du Frontend

Une fois votre API déployée, configurez votre frontend Next.js :

### En production

```env
NEXT_PUBLIC_API_URL=https://stemadeleine-api.onrender.com
```

### En développement (local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## 📚 Documentation complète

Pour plus de détails, consultez :

- `RENDER_SSL_CONFIGURATION.md` - Configuration SSL et diagnostic
- `RENDER_DEPLOYMENT_GUIDE.md` - Guide de déploiement complet
- `RENDER_ENV_VARIABLES.md` - Liste détaillée des variables

---

## 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes :

1. Consultez les logs dans Render
2. Vérifiez que toutes les variables d'environnement sont correctes
3. Testez la connexion Supabase en local d'abord
4. Vérifiez que le port 6543 (Session Pooler) est bien utilisé

Bonne chance ! 🚀

