# ⚡ DÉPLOIEMENT RENDER - CHECKLIST 2 MINUTES

## ✅ Ce que vous devez copier-coller dans Render

### 1️⃣ DATABASE_URL

```
jdbc:postgresql://aws-1-eu-west-3.pooler.supabase.com:6543/postgres?user=postgres.eahwfewbtyndxbqfifuh&password=Lajarrie17220&sslmode=require
```

### 2️⃣ JWT_SECRET_KEY

```
B9F5AC8D37E4F2C1D6A0E8B3F7C4D1A9E2B5F8C3A6D9E0B7F4C1A8D5E2B9F6C3A7D0E4B1F8C5A2E9D6B3F7C0A4E1B8D5F2C9A6E3B0D7F4A1C8E5B2F9D6C3A0E7B4F1
```

### 3️⃣ S3_ACCESS_KEY_ID

```
8e63ae45988dfc0755a1136c5b77a6c0
```

### 4️⃣ S3_SECRET_ACCESS_KEY

```
1a85134618d6a7542b87a875eb23c663fb296bc2f08e0fece1c0902a34d78b6f
```

### 5️⃣ S3_BUCKET

```
medias-prod
```

### 6️⃣ S3_REGION

```
eu-west-3
```

### 7️⃣ S3_ENDPOINT

```
https://eahwfewbtyndxbqfifuh.supabase.co/storage/v1/s3
```

### 8️⃣ HELLOASSO_CLIENT_ID

```
5f742ced506f4344b3d1cc4bc0af1e8c
```

### 9️⃣ HELLOASSO_CLIENT_SECRET

```
L8MGUHDqhQh7emERRYsFiF087oRU/x8v
```

### 🔟 RECAPTCHA_SECRET_KEY

```
VOTRE_VRAIE_CLE_RECAPTCHA
```

⚠️ Remplacez par votre vraie clé reCAPTCHA production

---

## 📝 Configuration du formulaire

| Champ                | Valeur à mettre          |
|----------------------|--------------------------|
| Name                 | `stemadeleine-api`       |
| Language             | `Docker`                 |
| Branch               | `main`                   |
| Region               | `Frankfurt (EU Central)` |
| Root Directory       | `backend/api`            |
| Docker Build Context | `backend/api`            |
| Health Check Path    | `/actuator/health`       |

---

## 🚫 Sur Supabase

**NE RIEN FAIRE !**

- ❌ N'activez PAS "Enforce SSL"
- ❌ Ne téléchargez PAS le certificat

Tout est géré automatiquement.

---

## ✅ Checklist finale

Avant de cliquer sur "Create Web Service" :

- [ ] Language = **Docker** (pas Java)
- [ ] 10 variables d'environnement ajoutées
- [ ] DATABASE_URL commence par `jdbc:postgresql://aws-1-eu-west-3`
- [ ] S3_BUCKET = `medias-prod` (pas dev)
- [ ] Health Check Path = `/actuator/health`

---

## 🚀 PRÊT À DÉPLOYER !

Cliquez sur **"Create Web Service"** et attendez 5-10 minutes.

**URL finale** : `https://stemadeleine-api.onrender.com`

**Test** : `https://stemadeleine-api.onrender.com/actuator/health`

---

## 🆘 En cas de problème

Consultez : `RENDER_FINAL_CONFIG.md` ou `RENDER_GUIDES_INDEX.md`

