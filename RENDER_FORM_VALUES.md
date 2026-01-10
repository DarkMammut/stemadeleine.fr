# 📝 FORMULAIRE RENDER - VALEURS À COPIER

## Configuration Rapide

### 🎯 Informations de Base

```
Name: stemadeleine-api
Language: Java
Branch: main
Region: Frankfurt (EU Central)
Root Directory: backend/api
```

### 🔨 Commandes

```
Build Command: ./render-build.sh
Start Command: ./render-start.sh
```

### 🔐 Variables d'Environnement (À compléter avec vos valeurs)

#### Base de Données Supabase

```
SUPABASE_DB_URL=jdbc:postgresql://db.XXXXX.supabase.co:5432/postgres
SUPABASE_DB_USER=postgres.XXXXX
SUPABASE_DB_PASSWORD=VOTRE_MOT_DE_PASSE
```

#### Stockage S3/Supabase

```
S3_ACCESS_KEY_ID=VOTRE_ACCESS_KEY
S3_SECRET_ACCESS_KEY=VOTRE_SECRET_KEY
S3_BUCKET=medias-prod
S3_REGION=eu-west-1
S3_ENDPOINT=https://XXXXX.supabase.co/storage/v1/s3
```

#### JWT (Générez avec ./generate-jwt-secret.sh)

```
JWT_SECRET_KEY=VOTRE_CLE_GENEREE
```

#### HelloAsso

```
HELLOASSO_CLIENT_ID=VOTRE_CLIENT_ID
HELLOASSO_CLIENT_SECRET=VOTRE_CLIENT_SECRET
```

#### reCAPTCHA

```
RECAPTCHA_SECRET_KEY=VOTRE_CLE_RECAPTCHA
```

---

## 🚀 Comment Récupérer Vos Valeurs

### 📍 Supabase Database

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. `Settings` → `Database` → `Connection string` (Session mode)
4. Copier et adapter au format JDBC

### 📍 Supabase Storage S3

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. `Settings` → `API` → Créer un "Access Token"
4. L'endpoint: `https://[PROJECT_REF].supabase.co/storage/v1/s3`

### 📍 JWT Secret

Exécuter dans le terminal :

```bash
./generate-jwt-secret.sh
```

### 📍 HelloAsso

1. https://api.helloasso.com/
2. Créer une application
3. Copier Client ID et Secret

### 📍 reCAPTCHA

1. https://www.google.com/recaptcha/admin
2. Créer un site reCAPTCHA v2
3. Copier la clé secrète (Secret Key)

---

## ⚡ Checklist Avant Déploiement

- [ ] Nettoyer les .env du repo : `./clean-env-files.sh`
- [ ] Générer une clé JWT : `./generate-jwt-secret.sh`
- [ ] Récupérer les identifiants Supabase
- [ ] Récupérer les identifiants HelloAsso
- [ ] Récupérer la clé reCAPTCHA
- [ ] Commit et push sur GitHub
- [ ] Créer le service sur Render
- [ ] Tester l'endpoint : `https://stemadeleine-api.onrender.com/api/public/health`

---

## 📱 URL de l'API une fois déployée

```
https://stemadeleine-api.onrender.com
```

Endpoint de test :

```
https://stemadeleine-api.onrender.com/api/public/health
```

Réponse attendue :

```json
{
  "status": "UP",
  "service": "stemadeleine-api"
}
```

