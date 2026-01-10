# 🚀 Guide de Déploiement sur Render

## 📋 Informations pour le formulaire Render

### Configuration du Web Service

| Champ              | Valeur                                                        |
|--------------------|---------------------------------------------------------------|
| **Name**           | `stemadeleine-api`                                            |
| **Language**       | `Java`                                                        |
| **Branch**         | `main` (ou `backoffice` si c'est votre branche de production) |
| **Region**         | `Frankfurt (EU Central)` *(ou Paris si disponible)*           |
| **Root Directory** | `backend/api`                                                 |
| **Build Command**  | `./render-build.sh`                                           |
| **Start Command**  | `./render-start.sh`                                           |

### ⚙️ Variables d'Environnement à Configurer

#### 🗄️ Base de Données Supabase

```
SUPABASE_DB_URL=jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres
SUPABASE_DB_USER=postgres.xxxxx
SUPABASE_DB_PASSWORD=votre_mot_de_passe_supabase
```

**Comment obtenir ces valeurs :**

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans `Settings` → `Database`
4. Utilisez les informations de connexion (mode Session, pas Transaction)
5. Formatez l'URL comme : `jdbc:postgresql://HOST:5432/postgres`

#### 📦 Stockage S3/Supabase

```
S3_ACCESS_KEY_ID=votre_access_key_id
S3_SECRET_ACCESS_KEY=votre_secret_access_key
S3_BUCKET=medias-prod
S3_REGION=eu-west-1
S3_ENDPOINT=https://xxxxx.supabase.co/storage/v1/s3
```

**Comment obtenir ces valeurs :**

1. Dans Supabase, allez dans `Settings` → `API`
2. Créez un nouveau "Access Token" pour S3
3. L'endpoint suit le format : `https://[PROJECT_REF].supabase.co/storage/v1/s3`

#### 🔐 JWT Secret

```
JWT_SECRET_KEY=votre_clé_secrète_minimum_256_bits
```

**Générer une clé sécurisée :**

```bash
openssl rand -base64 64
```

#### 💰 HelloAsso API

```
HELLOASSO_CLIENT_ID=votre_client_id_helloasso
HELLOASSO_CLIENT_SECRET=votre_client_secret_helloasso
```

**Comment obtenir ces valeurs :**

1. Connectez-vous sur https://api.helloasso.com/
2. Créez une application
3. Récupérez le Client ID et Client Secret

#### 🔒 Google reCAPTCHA

```
RECAPTCHA_SECRET_KEY=votre_clé_secrète_recaptcha
```

**Comment obtenir cette valeur :**

1. Allez sur https://www.google.com/recaptcha/admin
2. Créez un nouveau site (reCAPTCHA v2)
3. Utilisez la **clé secrète** (Secret Key)

---

## 📝 Étapes de Déploiement

### 1. Préparation du Repository

**Important :** Vos fichiers `.env` sont actuellement commités sur GitHub. Il faut les supprimer :

```bash
# Supprimer les .env du repository (mais les garder localement)
git rm --cached .env
git rm --cached frontend/stemadeleine/.env
git rm --cached backend/api/.env

# Commiter la suppression
git add .gitignore backend/api/.gitignore
git commit -m "chore: remove .env files from git and improve .gitignore"
git push origin main
```

### 2. Sur Render.com

1. **Créer un compte** sur https://render.com
2. Cliquez sur **"New +"** → **"Web Service"**
3. Connectez votre repository GitHub
4. Remplissez le formulaire avec les valeurs ci-dessus
5. Dans la section **Environment Variables**, ajoutez toutes les variables une par une
6. Cliquez sur **"Create Web Service"**

### 3. Vérification

Une fois déployé, votre API sera accessible à :

```
https://stemadeleine-api.onrender.com
```

Testez le endpoint de santé :

```
https://stemadeleine-api.onrender.com/api/public/health
```

---

## 🔧 Configuration Additionnelle

### Mise à jour du CORS

Dans votre `PublicController.java` et autres contrôleurs, ajoutez l'URL de production :

```java
@CrossOrigin(origins = {
        "http://localhost:3000",
        "https://stemadeleine.fr",
        "https://backoffice.stemadeleine.fr",
        "https://stemadeleine-api.onrender.com"
})
```

### Configuration des Frontends

Une fois l'API déployée, mettez à jour vos frontends Next.js avec l'URL de l'API :

**Dans `frontend/stemadeleine/.env.production` :**

```
NEXT_PUBLIC_API_URL=https://stemadeleine-api.onrender.com
```

**Dans `frontend/backoffice/.env.production` :**

```
NEXT_PUBLIC_API_URL=https://stemadeleine-api.onrender.com
```

---

## 📊 Surveillance

Render fournit :

- **Logs en temps réel** : Consultez les logs depuis le dashboard
- **Metrics** : CPU, mémoire, temps de réponse
- **Health checks** : Vérifie `/api/public/health` automatiquement
- **Auto-redéploiement** : À chaque push sur la branche main

---

## ⚠️ Plan Gratuit - Limitations

Le plan gratuit de Render a des limitations :

- L'application s'arrête après 15 minutes d'inactivité
- Le premier démarrage après inactivité prend ~30 secondes (cold start)
- 750 heures/mois gratuites

**Pour un site en production**, considérez le plan Starter ($7/mois) :

- Pas de cold starts
- Uptime 24/7
- Meilleure performance

---

## 🆘 Troubleshooting

### Erreur de build

- Vérifiez que Java 21 est bien configuré
- Vérifiez les logs de build dans Render

### Erreur de connexion à la base de données

- Vérifiez que l'URL Supabase est correcte (format JDBC)
- Vérifiez que l'IP de Render est autorisée dans Supabase

### L'application ne démarre pas

- Vérifiez les logs de démarrage
- Vérifiez que toutes les variables d'environnement sont définies

---

## 📞 Support

Si vous avez des questions ou des problèmes :

1. Consultez les logs dans le dashboard Render
2. Vérifiez la documentation Render : https://render.com/docs
3. Vérifiez la documentation Spring Boot : https://spring.io/guides

