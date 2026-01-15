# ⚡ Guide Rapide - SSL Supabase + Render

## 🚫 Sur Supabase Dashboard : NE RIEN FAIRE

### ❌ N'activez PAS "Enforce SSL on incoming connections"

- Cette option rejetterait les connexions et pourrait bloquer votre app
- Le Session Pooler gère déjà le SSL automatiquement

### ❌ Ne téléchargez PAS le certificat SSL

- Pas nécessaire pour le pooler
- Le paramètre `sslmode=require` dans l'URL suffit

---

## ✅ Configuration Render - Résumé Ultra-Rapide

### Formulaire Web Service

| Champ                    | Valeur                   |
|--------------------------|--------------------------|
| **Name**                 | `stemadeleine-api`       |
| **Language**             | `Docker` ⚠️              |
| **Branch**               | `main`                   |
| **Region**               | `Frankfurt (EU Central)` |
| **Root Directory**       | `backend/api`            |
| **Docker Build Context** | `backend/api`            |
| **Health Check Path**    | `/actuator/health`       |

### Variable d'environnement DATABASE_URL

```
DATABASE_URL=jdbc:postgresql://aws-1-eu-west-3.pooler.supabase.com:6543/postgres?user=postgres.eahwfewbtyndxbqfifuh&password=Lajarrie17220&sslmode=require
```

**Points clés** :

- ✅ Port **6543** (Transaction Pooler, IPv4-compatible)
- ✅ Host : `aws-1-eu-west-3.pooler.supabase.com` (Transaction Pooler officiel)
- ✅ Username complet : `postgres.eahwfewbtyndxbqfifuh`
- ✅ `sslmode=require` active le SSL automatiquement
- ❌ Ne mettez PAS de variables séparées (SUPABASE_DB_URL, etc.)

---

## 🎯 Checklist 5 secondes

- [ ] Language = **Docker** (pas Java)
- [ ] Port = **6543** dans DATABASE_URL
- [ ] `sslmode=require` dans DATABASE_URL
- [ ] Health Check = `/actuator/health`
- [ ] Sur Supabase : **RIEN à configurer** pour le SSL

---

## 🚀 C'est tout !

Cliquez sur **"Create Web Service"** et Render s'occupe du reste.

Le SSL fonctionne automatiquement grâce à :

1. Le **Session Pooler de Supabase** (port 6543)
2. Le paramètre **`sslmode=require`** dans votre URL
3. Aucune configuration manuelle nécessaire

---

## 🔍 Test rapide

Une fois déployé, testez :

```
https://votre-app.onrender.com/actuator/health
```

Devrait retourner : `{"status":"UP"}` ✅

---

## 📖 Documentation complète

- `RENDER_FORM_VALUES.md` - Tous les détails du formulaire
- `RENDER_SSL_CONFIGURATION.md` - Configuration SSL complète et diagnostic

