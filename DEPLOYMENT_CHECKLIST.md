# ✅ CHECKLIST DE DÉPLOIEMENT COMPLÈTE

## 🎯 Objectif

Déployer votre stack complète :

- **Backend API** (Java/Spring Boot) sur Render
- **Frontend principal** (Next.js) sur Vercel
- **Backoffice** (Next.js) sur Vercel avec reverse proxy
- **Base de données** sur Supabase (déjà configuré)

---

## 📋 ÉTAPE 1 : Nettoyer les fichiers .env du repository GitHub

### ⚠️ URGENT : Vos .env sont actuellement sur GitHub !

Exécutez le script de nettoyage :

```bash
cd /Users/seb/Documents/SteMadeleine/stemadeleine.fr
./clean-env-files.sh
```

Puis commitez les changements :

```bash
git add .gitignore backend/api/.gitignore
git commit -m "chore: remove .env files from git and improve .gitignore"
git push origin main
```

**✅ Vérification :** Allez sur GitHub et vérifiez que les .env n'apparaissent plus dans les fichiers.

---

## 📋 ÉTAPE 2 : Générer une clé JWT sécurisée

```bash
./generate-jwt-secret.sh
```

**📝 Copiez la clé générée**, vous en aurez besoin pour Render.

---

## 📋 ÉTAPE 3 : Récupérer vos identifiants

### Supabase Database

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. `Settings` → `Database` → `Connection string` (Session mode)
4. Notez :
    - URL : `db.xxxxx.supabase.co:5432`
    - User : `postgres.xxxxx`
    - Password : votre mot de passe

### Supabase Storage S3

1. Même projet Supabase
2. `Settings` → `API`
3. Créez un "Access Token" pour S3
4. Notez :
    - Access Key ID
    - Secret Access Key
    - Endpoint : `https://[PROJECT_REF].supabase.co/storage/v1/s3`

### HelloAsso

1. https://api.helloasso.com/
2. Créez une application si ce n'est pas déjà fait
3. Notez Client ID et Client Secret

### Google reCAPTCHA

1. https://www.google.com/recaptcha/admin
2. Sélectionnez votre site (ou créez-en un)
3. Notez la clé secrète (Secret Key)

---

## 📋 ÉTAPE 4 : Déployer l'API sur Render

### A. Créer le service sur Render.com

1. Allez sur https://render.com (créez un compte si nécessaire)
2. Cliquez sur **"New +"** → **"Web Service"**
3. Connectez votre repository GitHub `stemadeleine.fr`
4. Remplissez le formulaire :

| Champ              | Valeur                   |
|--------------------|--------------------------|
| **Name**           | `stemadeleine-api`       |
| **Language**       | `Java`                   |
| **Branch**         | `main`                   |
| **Region**         | `Frankfurt (EU Central)` |
| **Root Directory** | `backend/api`            |
| **Build Command**  | `./render-build.sh`      |
| **Start Command**  | `./render-start.sh`      |

### B. Configurer les variables d'environnement

Cliquez sur **"Add Environment Variable"** pour chaque variable :

```
SUPABASE_DB_URL=jdbc:postgresql://db.XXXXX.supabase.co:5432/postgres
SUPABASE_DB_USER=postgres.XXXXX
SUPABASE_DB_PASSWORD=VOTRE_MOT_DE_PASSE

S3_ACCESS_KEY_ID=VOTRE_ACCESS_KEY
S3_SECRET_ACCESS_KEY=VOTRE_SECRET_KEY
S3_BUCKET=medias-prod
S3_REGION=eu-west-1
S3_ENDPOINT=https://XXXXX.supabase.co/storage/v1/s3

JWT_SECRET_KEY=VOTRE_CLE_GENEREE_AVEC_LE_SCRIPT

HELLOASSO_CLIENT_ID=VOTRE_CLIENT_ID
HELLOASSO_CLIENT_SECRET=VOTRE_CLIENT_SECRET

RECAPTCHA_SECRET_KEY=VOTRE_CLE_RECAPTCHA
```

### C. Déployer

5. Cliquez sur **"Create Web Service"**
6. Attendez la fin du déploiement (5-10 minutes)
7. Notez l'URL : `https://stemadeleine-api.onrender.com`

### D. Tester

Testez que l'API fonctionne :

```bash
curl https://stemadeleine-api.onrender.com/api/public/health
```

Réponse attendue :

```json
{
  "status": "UP",
  "service": "stemadeleine-api"
}
```

**✅ Si vous voyez cette réponse, l'API est déployée avec succès !**

---

## 📋 ÉTAPE 5 : Déployer le Frontend principal sur Vercel

### A. Préparer le projet

Créez un fichier `.env.production` dans `frontend/stemadeleine/` :

```bash
cat > frontend/stemadeleine/.env.production << EOF
NEXT_PUBLIC_API_URL=https://stemadeleine-api.onrender.com
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=VOTRE_CLE_SITE_RECAPTCHA
EOF
```

**⚠️ N'ajoutez PAS ce fichier à Git !**

### B. Déployer sur Vercel

1. Allez sur https://vercel.com (créez un compte si nécessaire)
2. Cliquez sur **"Add New..."** → **"Project"**
3. Importez votre repository GitHub `stemadeleine.fr`
4. Configurez :

| Champ                | Valeur                  |
|----------------------|-------------------------|
| **Framework Preset** | `Next.js`               |
| **Root Directory**   | `frontend/stemadeleine` |
| **Build Command**    | `npm run build`         |
| **Output Directory** | `.next`                 |

5. Dans **Environment Variables**, ajoutez :
    - `NEXT_PUBLIC_API_URL` = `https://stemadeleine-api.onrender.com`
    - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` = votre clé site reCAPTCHA

6. Cliquez sur **"Deploy"**

### C. Configurer le domaine

1. Une fois déployé, allez dans **"Settings"** → **"Domains"**
2. Ajoutez votre domaine : `stemadeleine.fr`
3. Suivez les instructions pour configurer les DNS

**✅ Votre site principal est en ligne !**

---

## 📋 ÉTAPE 6 : Déployer le Backoffice sur Vercel

### A. Préparer le projet

Créez un fichier `.env.production` dans `frontend/backoffice/` :

```bash
cat > frontend/backoffice/.env.production << EOF
NEXT_PUBLIC_API_URL=https://stemadeleine-api.onrender.com
EOF
```

### B. Déployer sur Vercel

1. Sur Vercel, cliquez à nouveau sur **"Add New..."** → **"Project"**
2. Sélectionnez le même repository `stemadeleine.fr`
3. Configurez :

| Champ                | Valeur                |
|----------------------|-----------------------|
| **Framework Preset** | `Next.js`             |
| **Root Directory**   | `frontend/backoffice` |
| **Build Command**    | `npm run build`       |
| **Output Directory** | `.next`               |

4. Dans **Environment Variables**, ajoutez :
    - `NEXT_PUBLIC_API_URL` = `https://stemadeleine-api.onrender.com`

5. Cliquez sur **"Deploy"**

### C. Configurer le sous-domaine

1. Une fois déployé, allez dans **"Settings"** → **"Domains"**
2. Ajoutez : `backoffice.stemadeleine.fr`
3. Configurez le DNS (CNAME vers Vercel)

**✅ Votre backoffice est en ligne !**

---

## 📋 ÉTAPE 7 : Vérifications finales

### Tests à effectuer :

- [ ] L'API répond : `curl https://stemadeleine-api.onrender.com/api/public/health`
- [ ] Le site principal charge : `https://stemadeleine.fr`
- [ ] Le backoffice charge : `https://backoffice.stemadeleine.fr`
- [ ] L'authentification fonctionne (login/logout)
- [ ] Les formulaires de contact fonctionnent (reCAPTCHA)
- [ ] Les images s'affichent (Supabase Storage)
- [ ] Les paiements HelloAsso fonctionnent

### En cas de problème :

1. **API ne répond pas** : Vérifiez les logs dans Render Dashboard
2. **Erreur CORS** : Vérifiez que les URLs sont bien dans CorsConfig.java
3. **Erreur de DB** : Vérifiez les credentials Supabase
4. **Images ne s'affichent pas** : Vérifiez les credentials S3
5. **Cold start lent** : Normal sur le plan gratuit de Render (30s au 1er démarrage)

---

## 🎉 FÉLICITATIONS !

Votre stack complète est déployée :

- 🟢 **API** : https://stemadeleine-api.onrender.com
- 🟢 **Site** : https://stemadeleine.fr
- 🟢 **Backoffice** : https://backoffice.stemadeleine.fr
- 🟢 **Database** : Supabase

---

## 📊 Monitoring et Maintenance

### Render (API)

- Dashboard : https://dashboard.render.com
- Logs en temps réel disponibles
- Redéploiement automatique à chaque push sur `main`

### Vercel (Frontends)

- Dashboard : https://vercel.com/dashboard
- Logs et analytics disponibles
- Redéploiement automatique à chaque push

### Supabase (Database)

- Dashboard : https://supabase.com/dashboard
- Monitoring de la DB
- Backups automatiques

---

## 💰 Coûts

### Plan actuel (Gratuit)

- Render Free : 750h/mois (suffisant pour 1 service)
- Vercel Hobby : Illimité pour projets personnels
- Supabase Free : 500MB DB, 1GB Storage

### Upgrade recommandé pour production

- Render Starter : $7/mois (pas de cold start, meilleure perf)
- Vercel Pro : $20/mois (analytics avancés, support)
- Supabase Pro : $25/mois (plus d'espace, meilleure perf)

**Total estimé pour production :** ~$50/mois

---

## 🆘 Support

- Documentation Render : https://render.com/docs
- Documentation Vercel : https://vercel.com/docs
- Documentation Supabase : https://supabase.com/docs
- Documentation Spring Boot : https://spring.io/guides
- Documentation Next.js : https://nextjs.org/docs

