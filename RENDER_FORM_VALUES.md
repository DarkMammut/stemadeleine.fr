# 📋 Valeurs du formulaire Render - Web Service API

## Informations de base

| Champ                 | Valeur                   |
|-----------------------|--------------------------|
| **Name**              | `stemadeleine-api`       |
| **Language**          | `Docker`                 |
| **Branch**            | `backoffice`             |
| **Region**            | `Frankfurt (EU Central)` |
| **Root Directory**    | `backend/api`            |
| **Build Command**     | *(laisser vide)*         |
| **Start Command**     | *(laisser vide)*         |
| **Health Check Path** | `/actuator/health`       |

## Variables d'environnement

### 🔐 Base de données Supabase (PostgreSQL)

```
SUPABASE_DB_URL=jdbc:postgresql://db.eahwfewbtyndxbqfifuh.supabase.co:5432/postgres
SUPABASE_DB_USER=postgres.eahwfewbtyndxbqfifuh
SUPABASE_DB_PASSWORD=[VOTRE_MOT_DE_PASSE_SUPABASE]
```

> **📍 Comment obtenir le mot de passe** :
> 1. Allez sur https://supabase.com/dashboard/project/eahwfewbtyndxbqfifuh
> 2. Settings → Database
> 3. Cliquez sur "Reset database password" et copiez le nouveau mot de passe
> 4. ⚠️ **Utilisez le port 5432 (Direct Connection)** pour éviter les problèmes avec JPA/Hibernate

### 📦 Supabase Storage (S3)

```
S3_ACCESS_KEY_ID=8e63ae45988dfc0755a1136c5b77a6c0
S3_SECRET_ACCESS_KEY=1a85134618d6a7542b87a875eb23c663fb296bc2f08e0fece1c0902a34d78b6f
S3_BUCKET=medias-dev
S3_REGION=eu-west-3
S3_ENDPOINT=https://eahwfewbtyndxbqfifuh.supabase.co/storage/v1/s3
```

### 🌐 Supabase API (pour le storage)

```
SUPABASE_URL=https://eahwfewbtyndxbqfifuh.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhaHdmZXdidHluZHhicWZpZnVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE1NjQ4NiwiZXhwIjoyMDcwNzMyNDg2fQ.2wqGjErpBpoa7T-A0kWGRiKl4yFId53aDsMp278fNG0
```

> ⚠️ **Oui, ces deux variables sont nécessaires en plus des credentials PostgreSQL**
> - `SUPABASE_URL` et `SUPABASE_SERVICE_KEY` sont utilisés pour le **Supabase Storage** (upload de fichiers)
> - Les variables `SUPABASE_DB_*` sont utilisées pour la **connexion PostgreSQL** (base de données)

### 🔑 JWT Secret

```
JWT_SECRET_KEY=B9F5AC8D37E4F2C1D6A0E8B3F7C4D1A9E2B5F8C3A6D9E0B7F4C1A8D5E2B9F6C3A7D0E4B1F8C5A2E9D6B3F7C0A4E1B8D5F2C9A6E3B0D7F4A1C8E5B2F9D6C3A0E7B4F1
```

### 💳 HelloAsso API

```
HELLOASSO_CLIENT_ID=5f742ced506f4344b3d1cc4bc0af1e8c
HELLOASSO_CLIENT_SECRET=L8MGUHDqhQh7emERRYsFiF087oRU/x8v
```

### 🤖 Google reCAPTCHA

```
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

> **⚠️ ATTENTION** : Clé de TEST. Pour la production :
> 1. Créez une nouvelle clé sur https://www.google.com/recaptcha/admin
> 2. Remplacez cette valeur

### 🔌 Port

```
PORT=10000
```

> Render définit automatiquement cette variable, mais vous pouvez la configurer si nécessaire.

---

## 📝 Instructions étape par étape

1. **Connectez-vous à Render** : https://dashboard.render.com/

2. **New +** → **Web Service**

3. **Connect your repository** : Sélectionnez `stemadeleine.fr`

4. **Remplissez le formulaire** avec les valeurs du tableau ci-dessus

5. **Advanced** → **Add Environment Variable** : Ajoutez TOUTES les variables listées ci-dessus
    - Pour les valeurs sensibles (passwords, secrets), cochez "Encrypted"

6. **Create Web Service**

7. **Attendez le déploiement** (5-10 minutes)

8. **Testez le health check** : `https://stemadeleine-api.onrender.com/actuator/health`

---

## ✅ Vérification après déploiement

### Test du Health Check

```bash
curl https://stemadeleine-api.onrender.com/actuator/health
```

Réponse attendue :

```json
{
  "status": "UP"
}
```

### Test de l'API

```bash
curl https://stemadeleine-api.onrender.com/api/public/test
```

---

## ⚠️ SÉCURITÉ : Actions à faire APRÈS le déploiement

1. **Régénérer les secrets exposés sur GitHub** :
    - JWT_SECRET_KEY → `./generate-jwt-secret.sh`
    - SUPABASE_SERVICE_KEY → Supabase Dashboard → Settings → API → Régénérer
    - S3 credentials → Supabase Dashboard → Storage → Régénérer
    - reCAPTCHA → Créer de nouvelles clés de production

2. **Nettoyer l'historique Git** :
    - Suivre les instructions dans `SECURITY_ENV_FIX.md`

3. **Vérifier les .gitignore** :
    - Assurez-vous que tous les `.env` sont ignorés (sauf `.env.example`)

