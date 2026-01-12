# 🚀 Déploiement Rapide - Guide Complet
## 🎯 Vue d'ensemble
Votre projet comporte 3 composants :
1. **API Backend** (Java Spring Boot) → Render avec Docker
2. **Site Public** (Next.js) → Vercel (recommandé) ou Render
3. **Backoffice** (Next.js) → Vercel (recommandé) ou Render
4. **Base de données** → Supabase (déjà configuré)
---
## 📋 Étape 1 : Préparer le Repository
### Supprimer les fichiers .env du Git
```bash
cd /Users/seb/Documents/SteMadeleine/stemadeleine.fr
# Supprimer les .env du repository (mais les garder localement)
git rm --cached .env 2>/dev/null || true
git rm --cached frontend/stemadeleine/.env 2>/dev/null || true
git rm --cached frontend/backoffice/.env 2>/dev/null || true
git rm --cached backend/api/.env 2>/dev/null || true
# Vérifier que .gitignore est correct
echo "Vérification du .gitignore..."
grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore
grep -q "^\.env\.local$" .gitignore || echo ".env.local" >> .gitignore
# Commiter les changements
git add .gitignore
git commit -m "chore: remove .env files from git and improve .gitignore"
git push origin main
```
---
## 🔧 Étape 2 : Déployer l'API Backend sur Render
### Option A : Via Blueprint (Automatique) ⭐
1. Allez sur https://render.com
2. Créez un compte ou connectez-vous
3. Cliquez sur **"New +"** → **"Blueprint"**
4. Connectez votre repository GitHub : `stemadeleine.fr`
5. Render détectera le fichier `render.yaml`
6. Remplissez les variables d'environnement (voir ci-dessous)
7. Cliquez sur **"Apply"**
### Option B : Via Formulaire Web Service (Manuel)
1. Allez sur https://render.com
2. Cliquez sur **"New +"** → **"Web Service"**
3. Connectez votre repository GitHub
4. Remplissez le formulaire :
**Informations de Base :**
```
Name:               stemadeleine-api
Language:           Docker
Branch:             main
Region:             Frankfurt (EU Central)
Root Directory:     backend/api
Dockerfile Path:    Dockerfile
```
**Variables d'Environnement :**
Cliquez sur "Add Environment Variable" pour chacune :
```bash
# Base de données Supabase
SUPABASE_DB_URL=jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres
SUPABASE_DB_USER=postgres.xxxxx
SUPABASE_DB_PASSWORD=votre_mot_de_passe
# Stockage S3/Supabase
S3_ACCESS_KEY_ID=votre_access_key
S3_SECRET_ACCESS_KEY=votre_secret_key
S3_BUCKET=medias-prod
S3_REGION=eu-west-1
S3_ENDPOINT=https://xxxxx.supabase.co/storage/v1/s3
# JWT Secret
JWT_SECRET_KEY=votre_clé_générée_avec_openssl
# HelloAsso
HELLOASSO_CLIENT_ID=votre_client_id
HELLOASSO_CLIENT_SECRET=votre_client_secret
# reCAPTCHA
RECAPTCHA_SECRET_KEY=votre_clé_secrète
# Spring Profile
SPRING_PROFILES_ACTIVE=prod
```
5. Cliquez sur **"Create Web Service"**
### 🔑 Comment obtenir vos valeurs
**Supabase Database :**
1. https://supabase.com/dashboard → votre projet
2. Settings → Database → Connection string (Session mode)
**S3/Storage :**
1. Supabase Dashboard → Settings → API
2. Créez un "Access Token" pour S3
**JWT Secret :**
```bash
openssl rand -base64 64
```
**HelloAsso :**
1. https://api.helloasso.com/
2. Créez une application
**reCAPTCHA :**
1. https://www.google.com/recaptcha/admin
2. Créez un site reCAPTCHA v2
---
## 🌐 Étape 3 : Déployer le Site Public sur Vercel
1. Allez sur https://vercel.com
2. Connectez-vous avec GitHub
3. Cliquez sur **"Add New..."** → **"Project"**
4. Importez votre repository : `stemadeleine.fr`
5. Configurez :
   - **Framework Preset** : Next.js
   - **Root Directory** : `frontend/stemadeleine`
6. Ajoutez les variables d'environnement :
   ```
   NEXT_PUBLIC_API_URL=https://stemadeleine-api.onrender.com
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=votre_clé_site_recaptcha
   ```
7. Cliquez sur **"Deploy"**
---
## 🔐 Étape 4 : Déployer le Backoffice sur Vercel
1. Sur Vercel, cliquez sur **"Add New..."** → **"Project"**
2. Importez à nouveau votre repository
3. Configurez :
   - **Framework Preset** : Next.js
   - **Root Directory** : `frontend/backoffice`
4. Ajoutez les variables d'environnement :
   ```
   NEXT_PUBLIC_API_URL=https://stemadeleine-api.onrender.com
   BACKEND_URL=https://stemadeleine-api.onrender.com
   ```
5. Cliquez sur **"Deploy"**
---
## 🌍 Étape 5 : Configuration DNS
### Pour le site principal (stemadeleine.fr)
Dans votre gestionnaire DNS (OVH, Cloudflare, etc.) :
```
Type: CNAME
Name: @
Value: [votre-projet-vercel].vercel.app
```
Puis dans Vercel :
- Settings → Domains → Add Domain → `stemadeleine.fr`
### Pour le backoffice (backoffice.stemadeleine.fr)
Dans votre gestionnaire DNS :
```
Type: CNAME
Name: backoffice
Value: [votre-backoffice-vercel].vercel.app
```
Puis dans Vercel :
- Settings → Domains → Add Domain → `backoffice.stemadeleine.fr`
---
## ✅ Étape 6 : Vérification
### Tester l'API
```bash
curl https://stemadeleine-api.onrender.com/api/public/health
```
Réponse attendue : `{ "status": "UP" }`
### Tester le site public
Ouvrez : https://stemadeleine.fr (ou l'URL Vercel temporaire)
### Tester le backoffice
Ouvrez : https://backoffice.stemadeleine.fr (ou l'URL Vercel temporaire)
---
## 🔄 Étape 7 : Mettre à jour le CORS
Mettez à jour vos contrôleurs Java pour autoriser les nouvelles URLs :
```java
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://stemadeleine.fr",
    "https://backoffice.stemadeleine.fr",
    "https://stemadeleine-api.onrender.com"
})
```
Puis commitez et poussez :
```bash
git add .
git commit -m "feat: update CORS for production URLs"
git push origin main
```
Render redéploiera automatiquement l'API !
---
## 📊 Surveillance et Logs
### Render (API Backend)
- Dashboard : https://dashboard.render.com
- Logs en temps réel
- Métriques : CPU, mémoire, requêtes
### Vercel (Frontends)
- Dashboard : https://vercel.com/dashboard
- Analytics
- Logs de déploiement
### Supabase (Base de données)
- Dashboard : https://supabase.com/dashboard
- Logs SQL
- Métriques de performance
---
## 🚨 En cas de problème
### L'API ne démarre pas sur Render
1. Vérifiez les logs dans le dashboard Render
2. Vérifiez que toutes les variables d'environnement sont définies
3. Vérifiez la connexion à Supabase
### Le frontend ne se connecte pas à l'API
1. Vérifiez `NEXT_PUBLIC_API_URL` dans Vercel
2. Vérifiez le CORS dans l'API
3. Testez l'API directement avec curl
### Cold Start sur Render (plan gratuit)
- L'API s'endort après 15 min d'inactivité
- Le premier accès prend ~30 secondes
- Solution : passer au plan payant ($7/mois)
---
## 💰 Coûts Estimés
| Service    | Plan        | Prix       |
|------------|-------------|------------|
| Render     | Free        | 0€         |
| Vercel     | Hobby       | 0€         |
| Supabase   | Free        | 0€         |
| **Total**  |             | **0€/mois**|
Pour un site professionnel :
- Render Starter : $7/mois
- Vercel Pro : $20/mois
- Supabase Pro : $25/mois
- **Total** : ~**52€/mois**
---
## 🎉 Félicitations !
Votre application est maintenant en production ! 🚀
- ✅ API Backend déployée sur Render
- ✅ Site public déployé sur Vercel
- ✅ Backoffice déployé sur Vercel
- ✅ Base de données sur Supabase
- ✅ DNS configurés
- ✅ HTTPS activé automatiquement
---
## 📞 Support
Pour toute question :
1. Consultez les logs dans les dashboards
2. Vérifiez la documentation officielle
3. Contactez le support des services respectifs
