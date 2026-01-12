# Variables d'environnement pour Render

## Configuration du Web Service Java (Backend API)

### Formulaire Render - Informations de base

- **Name**: `stemadeleine-api`
- **Language**: `Docker` (car Java n'est pas dans la liste)
- **Branch**: `backoffice` (ou `main` après votre fusion)
- **Region**: `Frankfurt (EU Central)` (le plus proche de la France)
- **Root Directory**: `backend/api`
- **Build Command**: Laissez vide (Docker utilise le Dockerfile)
- **Start Command**: Laissez vide (Docker utilise le CMD du Dockerfile)

### Variables d'environnement

#### 1. Base de données Supabase (PostgreSQL)

```
SUPABASE_DB_URL=jdbc:postgresql://db.eahwfewbtyndxbqfifuh.supabase.co:5432/postgres
SUPABASE_DB_USER=postgres.eahwfewbtyndxbqfifuh
SUPABASE_DB_PASSWORD=[VOTRE_MOT_DE_PASSE_SUPABASE]
```

> **📍 Comment obtenir ces informations** :
>
> 1. **Allez sur votre Dashboard Supabase** : https://supabase.com/dashboard/project/eahwfewbtyndxbqfifuh
> 2. **Settings** → **Database**
> 3. Dans la section **Connection string**, vous verrez :
     >    ```
     > postgresql://postgres:[YOUR-PASSWORD]@db.eahwfewbtyndxbqfifuh.supabase.co:5432/postgres
     >    ```
>
> 4. **Pour récupérer le mot de passe** :
     >

- **Option A (Recommandé)** : Cliquez sur **"Reset database password"** → Copiez le nouveau mot de passe

> - **Option B** : Cherchez dans vos emails Supabase l'email de création du projet
>    - **Option C** : Si vous l'avez déjà enregistré, utilisez votre mot de passe actuel
>
> 5. **Conversion pour Java** :
     >

- URL : `jdbc:postgresql://db.eahwfewbtyndxbqfifuh.supabase.co:5432/postgres`

> - User : `postgres.eahwfewbtyndxbqfifuh`
>    - Password : Celui que vous avez récupéré à l'étape 4
>
> ⚠️ **Note sur le port** : Utilisez le port **5432** (Direct Connection) au lieu de 6543 (Pooler) pour éviter les
> problèmes de connexion avec JPA/Hibernate.

#### 2. Supabase Storage (S3)

```
S3_ACCESS_KEY_ID=8e63ae45988dfc0755a1136c5b77a6c0
S3_SECRET_ACCESS_KEY=1a85134618d6a7542b87a875eb23c663fb296bc2f08e0fece1c0902a34d78b6f
S3_BUCKET=medias-dev
S3_REGION=eu-west-3
S3_ENDPOINT=https://eahwfewbtyndxbqfifuh.storage.supabase.co/storage/v1/s3
```

#### 3. Supabase API (pour le storage)

```
SUPABASE_URL=https://eahwfewbtyndxbqfifuh.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhaHdmZXdidHluZHhicWZpZnVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE1NjQ4NiwiZXhwIjoyMDcwNzMyNDg2fQ.2wqGjErpBpoa7T-A0kWGRiKl4yFId53aDsMp278fNG0
```

> ⚠️ **IMPORTANT** : Cette clé a été exposée sur GitHub. Après le déploiement, allez dans Supabase Dashboard →
> Settings → API → Régénérez la "service_role key".

#### 4. JWT Secret

```
JWT_SECRET_KEY=B9F5AC8D37E4F2C1D6A0E8B3F7C4D1A9E2B5F8C3A6D9E0B7F4C1A8D5E2B9F6C3A7D0E4B1F8C5A2E9D6B3F7C0A4E1B8D5F2C9A6E3B0D7F4A1C8E5B2F9D6C3A0E7B4F1
```

#### 5. HelloAsso API

```
HELLOASSO_CLIENT_ID=5f742ced506f4344b3d1cc4bc0af1e8c
HELLOASSO_CLIENT_SECRET=L8MGUHDqhQh7emERRYsFiF087oRU/x8v
```

#### 6. Google reCAPTCHA

```
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

> **⚠️ IMPORTANT** : Cette clé reCAPTCHA est une clé de TEST qui accepte toujours les validations.
> Pour la production, vous devez :
> 1. Aller sur https://www.google.com/recaptcha/admin
> 2. Créer une nouvelle clé pour votre domaine de production
> 3. Remplacer cette valeur

#### 7. Port (automatique sur Render)

```
PORT=10000
```

> Render définit automatiquement cette variable, mais vous pouvez la configurer si nécessaire.

---

## Récapitulatif : Comment remplir le formulaire Render

1. **Créer un nouveau Web Service**
2. **Connect your repository** → Sélectionnez votre repo GitHub
3. **Remplir le formulaire** :
    - Name: `stemadeleine-api`
    - Language: `Docker`
    - Branch: `backoffice`
    - Region: `Frankfurt (EU Central)`
    - Root Directory: `backend/api`
    - Build Command: (vide)
    - Start Command: (vide)
    - **Health Check Path**: `/actuator/health`

4. **Advanced** → **Environment Variables** :
    - Cliquez sur "Add Environment Variable"
    - Ajoutez TOUTES les variables listées ci-dessus
    - Pour les valeurs sensibles (passwords, secrets), cochez "Encrypted"

5. **Create Web Service**

---

## Vérification Supabase

Pour obtenir vos vraies credentials Supabase :

### Connection String PostgreSQL

1. Supabase Dashboard → Settings → Database
2. Connection string → URI
3. Utilisez le mode **Transaction** (port 6543) pour la production

### Service Key

1. Supabase Dashboard → Settings → API
2. Copiez la "service_role key" (⚠️ pas l'anon key !)

### S3 Credentials

1. Supabase Dashboard → Settings → API
2. Allez dans la section Storage
3. Les credentials S3 sont dans "S3 Access Keys"

---

## ⚠️ SÉCURITÉ : Rotation des secrets

Étant donné que vos fichiers `.env` ont été exposés sur GitHub, vous devriez :

1. **Régénérer TOUS les secrets** :
    - JWT_SECRET_KEY → Générez un nouveau avec `./generate-jwt-secret.sh`
    - SUPABASE_SERVICE_KEY → Régénérez dans Supabase Dashboard
    - HELLOASSO credentials → Vérifiez si vous pouvez les régénérer
    - reCAPTCHA → Créez de nouvelles clés pour production
    - S3 credentials → Régénérez dans Supabase Storage settings

2. **Supprimer l'historique Git des fichiers .env** (voir SECURITY_ENV_FIX.md)

3. **Vérifier que les .gitignore fonctionnent correctement**

