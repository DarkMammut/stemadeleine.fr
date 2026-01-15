# ✅ Configuration Finale - Prête pour Render

## 🎯 URL fournie par Supabase (Transaction Pooler)

Supabase vous donne cette URL JDBC :

```
jdbc:postgresql://aws-1-eu-west-3.pooler.supabase.com:6543/postgres?user=postgres.eahwfewbtyndxbqfifuh&password=[YOUR-PASSWORD]
```

## 🔑 URL complète à utiliser dans Render

```
DATABASE_URL=jdbc:postgresql://aws-1-eu-west-3.pooler.supabase.com:6543/postgres?user=postgres.eahwfewbtyndxbqfifuh&password=Lajarrie17220&sslmode=require
```

**Ce qui a été modifié** :

- ✅ `[YOUR-PASSWORD]` remplacé par `Lajarrie17220`
- ✅ `&sslmode=require` ajouté à la fin

---

## 📋 Variables d'environnement complètes pour Render

Copiez-collez ces 10 variables dans Render :

```env
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

## 🔧 Configuration formulaire Render

| Champ                    | Valeur                   |
|--------------------------|--------------------------|
| **Name**                 | `stemadeleine-api`       |
| **Language**             | `Docker` ⚠️ IMPORTANT    |
| **Branch**               | `main`                   |
| **Region**               | `Frankfurt (EU Central)` |
| **Root Directory**       | `backend/api`            |
| **Docker Build Context** | `backend/api`            |
| **Health Check Path**    | `/actuator/health`       |

---

## ✅ Checklist avant déploiement

- [ ] Language = **Docker** (pas Java)
- [ ] DATABASE_URL utilise **aws-1-eu-west-3.pooler.supabase.com**
- [ ] DATABASE_URL contient **&sslmode=require**
- [ ] S3_BUCKET = **medias-prod** (pas medias-dev)
- [ ] RECAPTCHA_SECRET_KEY = vraie clé (pas la clé de test)
- [ ] **10 variables d'environnement** au total

---

## 🚫 Sur Supabase : Ne rien faire concernant le SSL

- ❌ N'activez PAS "Enforce SSL on incoming connections"
- ❌ Ne téléchargez PAS le certificat SSL
- ✅ Le Transaction Pooler gère tout automatiquement

---

## 🚀 Prêt à déployer !

1. Allez sur https://dashboard.render.com
2. Créez un nouveau **Web Service**
3. Remplissez le formulaire avec les valeurs ci-dessus
4. Ajoutez les 10 variables d'environnement
5. Cliquez sur **"Create Web Service"**

**Durée** : 5-10 minutes

**URL finale** : `https://stemadeleine-api.onrender.com`

---

## 🧪 Tests après déploiement

### Test 1 : Health Check

```
https://stemadeleine-api.onrender.com/actuator/health
```

Doit retourner : `{"status":"UP"}` ✅

### Test 2 : API

```
https://stemadeleine-api.onrender.com/api/public/pages
```

Doit retourner la liste des pages ✅

---

## 📚 Documentation détaillée

Si besoin d'aide :

- **Guide rapide** : `RENDER_QUICK_SSL_GUIDE.md`
- **Index complet** : `RENDER_GUIDES_INDEX.md`
- **Diagnostic** : `RENDER_SSL_CONFIGURATION.md`

---

## 💡 Pourquoi Transaction Pooler ?

**Transaction Pooler** (aws-1-eu-west-3.pooler.supabase.com) :

- ✅ Compatible IPv4 (fonctionne avec Render)
- ✅ Optimisé pour les connexions courtes
- ✅ Parfait pour les migrations Flyway
- ✅ URL officielle fournie par Supabase

**Direct Connection** (db.eahwfewbtyndxbqfifuh.supabase.co:5432) :

- ❌ IPv6 uniquement
- ❌ Ne fonctionne PAS avec Render/Vercel/GitHub Actions
- ❌ Nécessite l'achat du support IPv4

---

## 🎉 C'est tout !

Tout est configuré et prêt. Il ne reste plus qu'à déployer ! 🚀

