# 📋 Résumé - Configuration SSL Supabase pour Render

## ✅ CE QUE VOUS DEVEZ FAIRE

### Sur Render

1. **Dans le formulaire Web Service** :
    - Language : `Docker`
    - Root Directory : `backend/api`
    - Docker Build Context : `backend/api`
    - Health Check Path : `/actuator/health`

2. **Variable d'environnement** :
   ```
   DATABASE_URL=jdbc:postgresql://db.eahwfewbtyndxbqfifuh.supabase.co:6543/postgres?user=postgres.eahwfewbtyndxbqfifuh&password=Lajarrie17220&sslmode=require
   ```

   **IMPORTANT** :
    - Port : `6543` (Session Pooler, compatible IPv4)
    - Username : `postgres.eahwfewbtyndxbqfifuh` (avec le suffixe)
    - SSL : `sslmode=require` (active le SSL automatiquement)

### Sur Supabase

**❌ RIEN À FAIRE** concernant le SSL !

- N'activez PAS "Enforce SSL on incoming connections"
- Ne téléchargez PAS le certificat SSL
- Le pooler gère tout automatiquement

---

## ❌ CE QUE VOUS NE DEVEZ PAS FAIRE

### Sur Render

- ❌ Ne choisissez PAS "Java" comme language (choisissez "Docker")
- ❌ Ne mettez PAS le port 5432 (utilisez 6543)
- ❌ Ne créez PAS de variables séparées comme :
    - `SUPABASE_DB_URL`
    - `SUPABASE_DB_USER`
    - `SUPABASE_DB_PASSWORD`
- ❌ N'utilisez PAS juste `postgres` comme username (il faut le suffixe `.eahwfewbtyndxbqfifuh`)

### Sur Supabase

- ❌ N'activez PAS "Enforce SSL" (pas nécessaire et peut causer des problèmes)
- ❌ Ne téléchargez PAS le certificat (pas utilisé avec JDBC)

---

## 🔍 Pourquoi le port 6543 et pas 5432 ?

**Render est une plateforme IPv4-only**, mais Supabase utilise IPv6 par défaut sur le port 5432.

**Solutions** :

1. ✅ **Utiliser le Session Pooler** (port 6543) - Gratuit, compatible IPv4
2. ❌ Acheter le support IPv4 de Supabase - Payant

**Autres plateformes IPv4-only** :

- Vercel
- GitHub Actions
- Retool

---

## 🔐 Comment le SSL fonctionne-t-il ?

```
Votre App (Render) 
    ↓
    ↓ HTTPS/TLS (géré par `sslmode=require`)
    ↓
Session Pooler Supabase (port 6543)
    ↓
    ↓ Connexion sécurisée interne
    ↓
Base PostgreSQL Supabase
```

Le paramètre `sslmode=require` dans votre URL JDBC force l'utilisation de SSL/TLS pour chiffrer la connexion entre votre
application et le pooler Supabase.

**Vous n'avez besoin de rien configurer manuellement !**

---

## 📝 Liste complète des variables d'environnement Render

Copiez-collez cette liste dans Render :

```
DATABASE_URL=jdbc:postgresql://aws-1-eu-west-3.pooler.supabase.com:6543/postgres?user=postgres.eahwfewbtyndxbqfifuh&password=Lajarrie17220&sslmode=require

JWT_SECRET_KEY=B9F5AC8D37E4F2C1D6A0E8B3F7C4D1A9E2B5F8C3A6D9E0B7F4C1A8D5E2B9F6C3A7D0E4B1F8C5A2E9D6B3F7C0A4E1B8D5F2C9A6E3B0D7F4A1C8E5B2F9D6C3A0E7B4F1

S3_ACCESS_KEY_ID=8e63ae45988dfc0755a1136c5b77a6c0
S3_SECRET_ACCESS_KEY=1a85134618d6a7542b87a875eb23c663fb296bc2f08e0fece1c0902a34d78b6f
S3_BUCKET=medias-prod
S3_REGION=eu-west-3
S3_ENDPOINT=https://eahwfewbtyndxbqfifuh.supabase.co/storage/v1/s3

HELLOASSO_CLIENT_ID=5f742ced506f4344b3d1cc4bc0af1e8c
HELLOASSO_CLIENT_SECRET=L8MGUHDqhQh7emERRYsFiF087oRU/x8v

RECAPTCHA_SECRET_KEY=VOTRE_VRAIE_CLE_RECAPTCHA
```

---

## 🧪 Test avant déploiement (optionnel)

Testez en local avec la nouvelle configuration :

```bash
cd backend/api
./mvnw spring-boot:run
```

Si vous voyez dans les logs :

```
✅ Flyway successfully initialized
✅ Migrated to version X.X
✅ Started ApiApplication in X seconds
```

C'est bon ! Vous pouvez déployer sur Render.

---

## 🚀 Prêt à déployer !

1. Allez sur https://dashboard.render.com
2. Créez un nouveau Web Service
3. Remplissez le formulaire selon `RENDER_FORM_VALUES.md`
4. Ajoutez les variables d'environnement ci-dessus
5. Cliquez sur "Create Web Service"
6. Attendez 5-10 minutes

**Votre API sera disponible sur** : `https://stemadeleine-api.onrender.com`

---

## 📚 Documentation

- **Guide rapide** : `RENDER_QUICK_SSL_GUIDE.md` (2 minutes)
- **Formulaire détaillé** : `RENDER_FORM_VALUES.md` (10 minutes)
- **Configuration SSL complète** : `RENDER_SSL_CONFIGURATION.md` (diagnostic)

---

## ✅ Checklist finale

- [ ] Language = Docker
- [ ] Port = 6543 dans DATABASE_URL
- [ ] Username = postgres.eahwfewbtyndxbqfifuh (avec suffixe)
- [ ] sslmode=require dans DATABASE_URL
- [ ] Health Check = /actuator/health
- [ ] S3_BUCKET = medias-prod (pas medias-dev)
- [ ] RECAPTCHA_SECRET_KEY = vraie clé (pas la clé de test)
- [ ] Sur Supabase : SSL Enforce = NON activé

**Tout est prêt !** 🎉

