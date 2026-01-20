# 🚀 Guide de Déploiement - Stemadeleine.fr

Guide complet pour déployer l'application Stemadeleine.fr en production.

---

## 📋 Architecture de Déploiement

- **Backend API** : Render.com (Docker)
- **Backoffice** : Vercel (Next.js)
- **Site Principal** : Vercel (Next.js)
- **Base de Données** : Supabase (PostgreSQL)
- **Stockage Médias** : Supabase Storage (S3-compatible)

---

## 🔧 1. Configuration du Backend (Render.com)

### Configuration du Service

| Champ               | Valeur                   |
|---------------------|--------------------------|
| **Name**            | `stemadeleine-api`       |
| **Language**        | `Docker`                 |
| **Branch**          | `main`                   |
| **Region**          | `Frankfurt (EU Central)` |
| **Root Directory**  | `backend/api`            |
| **Dockerfile Path** | `Dockerfile`             |

⚠️ **Important** : Avec Docker, pas besoin de Build Command ni Start Command.

### Variables d'Environnement Backend

#### Base de Données (Supabase)

```
SUPABASE_DB_URL=jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres
SUPABASE_DB_USER=postgres.xxxxx
SUPABASE_DB_PASSWORD=votre_mot_de_passe
```

**Obtenir ces valeurs** :

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet → `Settings` → `Database`
3. Utilisez les informations de connexion (mode **Session**, pas Transaction)

#### Stockage S3 (Supabase Storage)

```
S3_ACCESS_KEY_ID=votre_access_key_id
S3_SECRET_ACCESS_KEY=votre_secret_access_key
S3_BUCKET=medias-prod
S3_REGION=eu-west-1
S3_ENDPOINT=https://xxxxx.supabase.co/storage/v1/s3
```

#### Sécurité

```
JWT_SECRET_KEY=votre_clé_secrète_256_bits
JWT_COOKIE_SECURE=true
```

**Générer une clé JWT** :

```bash
openssl rand -base64 64
```

#### CORS

```
CORS_ALLOWED_ORIGINS=https://stemadeleine.fr,https://dashboard.stemadeleine.fr
```

#### HelloAsso (Paiements)

```
HELLOASSO_CLIENT_ID=votre_client_id
HELLOASSO_CLIENT_SECRET=votre_client_secret
```

**Obtenir ces valeurs** : https://api.helloasso.com/

#### Google reCAPTCHA

```
RECAPTCHA_SECRET_KEY=votre_clé_secrète_recaptcha
```

**Obtenir cette valeur** : https://www.google.com/recaptcha/admin (reCAPTCHA v2)

### Déploiement Backend

1. Créez un compte sur https://render.com
2. Créez un nouveau Web Service
3. Connectez votre repository GitHub
4. Configurez les valeurs ci-dessus
5. Ajoutez toutes les variables d'environnement
6. Déployez

**URL finale** : `https://stemadeleine-api.onrender.com`

**Test** : `https://stemadeleine-api.onrender.com/api/public/health`

---

## 🌐 2. Configuration du Site Principal (Vercel)

### Variables d'Environnement Vercel (stemadeleine.fr)

```
NEXT_PUBLIC_BACKEND_URL=https://stemadeleine-api.onrender.com
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=votre_clé_publique_recaptcha
```

### Configuration reCAPTCHA

1. Allez sur https://www.google.com/recaptcha/admin
2. Créez un site reCAPTCHA v2
3. Domaines : `localhost`, `stemadeleine.fr`
4. Récupérez la **Clé du site** (Site Key) pour `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`

### Déploiement Vercel

1. Connectez votre repository GitHub sur https://vercel.com
2. Sélectionnez le dossier `frontend/stemadeleine`
3. Ajoutez les variables d'environnement
4. Déployez
5. Configurez le domaine personnalisé `stemadeleine.fr`

---

## 🔐 3. Configuration du Backoffice (Vercel)

### Variables d'Environnement Vercel (dashboard.stemadeleine.fr)

```
NEXT_PUBLIC_BACKEND_URL=https://stemadeleine-api.onrender.com
NEXT_PUBLIC_API_URL=https://stemadeleine-api.onrender.com
```

### Protection des Routes

Le middleware Next.js protège automatiquement toutes les routes sauf :

- `/` (landing page)
- `/auth/login` (page de connexion)

### Déploiement Backoffice

1. Sur Vercel, créez un nouveau projet
2. Sélectionnez le dossier `frontend/backoffice`
3. Ajoutez les variables d'environnement
4. Déployez
5. Configurez le domaine personnalisé `dashboard.stemadeleine.fr`

---

## 🔍 4. Vérifications Post-Déploiement

### Backend

- [ ] `https://stemadeleine-api.onrender.com/api/public/health` retourne un statut OK
- [ ] Les logs Render ne montrent pas d'erreurs CORS
- [ ] La base de données Supabase est accessible
- [ ] Le stockage S3 fonctionne

### Site Principal

- [ ] Le site charge correctement sur `https://stemadeleine.fr`
- [ ] Le formulaire de contact fonctionne
- [ ] reCAPTCHA s'affiche et fonctionne
- [ ] Pas d'erreurs CORS dans la console

### Backoffice

- [ ] La landing page est accessible sur `https://dashboard.stemadeleine.fr`
- [ ] Le login fonctionne
- [ ] Le cookie `authToken` est créé avec `Secure=true` et `SameSite=None`
- [ ] Les routes protégées redirigent vers `/auth/login` si non authentifié
- [ ] Le bouton "Dev Login" n'est PAS visible en production

---

## 🐛 Résolution des Problèmes

### Erreur CORS

**Symptôme** :

```
Access to fetch at 'https://stemadeleine-api.onrender.com' has been blocked by CORS policy
```

**Solution** :

1. Vérifiez que `CORS_ALLOWED_ORIGINS` sur Render contient l'URL exacte de votre site
2. Format : `https://stemadeleine.fr,https://dashboard.stemadeleine.fr` (sans `/` final)
3. Attendez le redéploiement automatique

### Backend endormi (Render Free Tier)

**Symptôme** : Première requête très lente (30-60s)

**Explication** : Le plan gratuit Render met le service en veille après 15 minutes d'inactivité. Le premier appel le
réveille.

**Solution** : C'est normal. Les appels suivants seront rapides.

### Cookie non défini

**Symptôme** : Le login ne fonctionne pas

**Solutions** :

- Vérifiez que `JWT_COOKIE_SECURE=true` est défini sur Render
- Vérifiez que votre site utilise HTTPS
- Vérifiez les logs backend pour voir si le login réussit

### Timeout sur les requêtes

**Configuration actuelle** : 30 secondes de timeout pour tous les clients axios

Si le backend Render est endormi, la première requête peut timeout. Rechargez la page après quelques secondes.

---

## 📝 Checklist Complète de Déploiement

### Avant le Déploiement

- [ ] Supprimer les fichiers `.env` du repository Git
- [ ] Vérifier que `.gitignore` contient bien `.env` et `*.env`
- [ ] Tester l'application en local

### Backend (Render)

- [ ] Service créé et configuré avec Docker
- [ ] Toutes les variables d'environnement ajoutées
- [ ] Déploiement réussi
- [ ] Health check fonctionne
- [ ] Logs vérifiés (pas d'erreurs)

### Site Principal (Vercel)

- [ ] Projet créé et configuré
- [ ] Variables d'environnement ajoutées
- [ ] Déploiement réussi
- [ ] Domaine personnalisé configuré
- [ ] SSL actif
- [ ] Formulaire de contact testé

### Backoffice (Vercel)

- [ ] Projet créé et configuré
- [ ] Variables d'environnement ajoutées
- [ ] Déploiement réussi
- [ ] Domaine personnalisé configuré
- [ ] SSL actif
- [ ] Login testé
- [ ] Protection des routes vérifiée

### DNS

- [ ] `stemadeleine.fr` pointe vers Vercel (A record ou CNAME)
- [ ] `dashboard.stemadeleine.fr` pointe vers Vercel (CNAME)
- [ ] SSL/TLS actif sur les deux domaines

---

## 🔄 Mise à Jour du Code

Pour déployer de nouvelles modifications :

```bash
git add .
git commit -m "feat: description des modifications"
git push origin main
```

Vercel et Render redéploieront automatiquement.

---

## 📞 Support

- **Render** : https://render.com/docs
- **Vercel** : https://vercel.com/docs
- **Supabase** : https://supabase.com/docs
- **Next.js** : https://nextjs.org/docs

---

**✅ Votre application est maintenant déployée en production !**
