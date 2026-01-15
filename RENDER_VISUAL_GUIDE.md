# 🎨 Guide Visuel - Supabase SSL & Render

## 📍 Navigation Supabase Dashboard

### Où trouver les informations SSL

1. **Connectez-vous** à https://supabase.com/dashboard
2. **Sélectionnez** votre projet `Ste Madeleine` (eahwfewbtyndxbqfifuh)
3. **Cliquez** sur l'icône ⚙️ "Settings" (en bas à gauche)
4. **Cliquez** sur "Database"

Vous verrez plusieurs sections :

---

### Section "Connection string"

Vous y trouverez plusieurs URLs :

#### 1. **URI (Connection pooling)** ✅ **C'EST CELLE-CI QU'IL FAUT UTILISER**

```
postgresql://postgres.eahwfewbtyndxbqfifuh:[PASSWORD]@db.eahwfewbtyndxbqfifuh.supabase.co:6543/postgres
```

**Détails** :

- Port : `6543` ← Session Pooler (IPv4-compatible)
- User : `postgres.eahwfewbtyndxbqfifuh` ← Avec le suffixe du projet
- Host : `db.eahwfewbtyndxbqfifuh.supabase.co`

#### 2. **URI (Direct connection)** ❌ **NE PAS UTILISER avec Render**

```
postgresql://postgres:[PASSWORD]@db.eahwfewbtyndxbqfifuh.supabase.co:5432/postgres
```

**Détails** :

- Port : `5432` ← Connexion directe (IPv6 seulement)
- User : `postgres` ← Sans suffixe
- ❌ Ne fonctionne PAS avec Render (IPv4-only)

---

### Section "SSL Configuration"

Vous y verrez :

#### Option 1 : "Enforce SSL on incoming connections"

```
[ ] Enforce SSL on incoming connections
    Reject non-SSL connections to your database
```

**❌ NE PAS COCHER cette case !**

**Pourquoi ?**

- Le Session Pooler gère déjà le SSL automatiquement
- Activer cette option pourrait bloquer certaines connexions légitimes
- Le paramètre `sslmode=require` dans votre URL suffit

#### Option 2 : "Download certificate"

```
📄 SSL Certificate
   Use this certificate when connecting to your database
   to prevent snooping and man-in-the-middle attacks.

   [Download certificate]
```

**❌ NE PAS télécharger le certificat !**

**Pourquoi ?**

- JDBC avec `sslmode=require` utilise les certificats système
- Pas besoin de certificat manuel pour le pooler
- Le certificat est utile seulement pour des connexions très spécifiques

---

### Conversion vers JDBC

Supabase vous donne :

```
postgresql://postgres.eahwfewbtyndxbqfifuh:Lajarrie17220@db.eahwfewbtyndxbqfifuh.supabase.co:6543/postgres
```

Vous devez convertir en :

```
jdbc:postgresql://db.eahwfewbtyndxbqfifuh.supabase.co:6543/postgres?user=postgres.eahwfewbtyndxbqfifuh&password=Lajarrie17220&sslmode=require
```

**Étapes de conversion** :

1. Ajoutez `jdbc:` au début
2. Déplacez le username après `?user=`
3. Déplacez le password après `&password=`
4. Ajoutez `&sslmode=require` à la fin

---

## 📍 Navigation Render Dashboard

### Créer un Web Service

1. **Connectez-vous** à https://dashboard.render.com
2. **Cliquez** sur "New +" (en haut à droite)
3. **Sélectionnez** "Web Service"

---

### Écran 1 : Connect a repository

```
┌─────────────────────────────────────────┐
│ Connect a repository                     │
│                                          │
│ [GitHub icon] Connect account            │
│                                          │
│ Your repositories:                       │
│ ○ stemadeleine/stemadeleine.fr          │ ← Sélectionnez ce repo
│                                          │
│ [Connect]                                │
└─────────────────────────────────────────┘
```

**Cliquez** sur votre repository, puis "Connect"

---

### Écran 2 : Configure Web Service

#### Section "Name & Region"

```
Name *
┌─────────────────────────────────────────┐
│ stemadeleine-api                         │ ← Votre choix de nom
└─────────────────────────────────────────┘

Region *
┌─────────────────────────────────────────┐
│ Frankfurt (EU Central)              [▼] │ ← Choisir cette région
└─────────────────────────────────────────┘
```

#### Section "Branch & Environment"

```
Branch *
┌─────────────────────────────────────────┐
│ main                                [▼] │ ← Votre branche principale
└─────────────────────────────────────────┘

Environment *
┌─────────────────────────────────────────┐
│ Docker                              [▼] │ ← ⚠️ IMPORTANT : Choisir Docker !
└─────────────────────────────────────────┘
```

**Options visibles** :

- Docker ✅
- Elixir
- Go
- Node
- Python 3
- Ruby
- Rust

**❌ Java n'est PAS dans la liste** → Utilisez Docker

#### Section "Root Directory"

```
Root Directory
┌─────────────────────────────────────────┐
│ backend/api                              │ ← Chemin vers votre Dockerfile
└─────────────────────────────────────────┘
```

#### Section "Docker"

```
Docker Build Context Directory
┌─────────────────────────────────────────┐
│ backend/api                              │ ← Même chemin que Root Directory
└─────────────────────────────────────────┘

Docker Command (optional)
┌─────────────────────────────────────────┐
│                                          │ ← Laisser VIDE (utilise ENTRYPOINT)
└─────────────────────────────────────────┘
```

---

### Section "Advanced"

Cliquez sur **"Advanced"** pour déplier :

#### Health Check Path

```
Health Check Path
┌─────────────────────────────────────────┐
│ /actuator/health                         │ ← Endpoint Spring Boot Actuator
└─────────────────────────────────────────┘
```

#### Auto-Deploy

```
☑ Auto-Deploy
  Automatically deploy when you push to your branch
```

**✅ Laissez coché** pour déployer automatiquement à chaque push

---

### Section "Environment Variables"

Cliquez sur **"Add Environment Variable"** pour chaque variable :

```
┌─────────────────────────────────────────────────────────────┐
│ Environment Variables                                        │
│                                                              │
│ Key                        Value                             │
│ ┌──────────────────┐     ┌──────────────────────────────┐  │
│ │ DATABASE_URL     │     │ jdbc:postgresql://aws-1-e... │  │
│ └──────────────────┘     └──────────────────────────────┘  │
│                                                              │
│ [+ Add Environment Variable]                                │
└─────────────────────────────────────────────────────────────┘
```

**Ajoutez une par une** :

1. DATABASE_URL
2. JWT_SECRET_KEY
3. S3_ACCESS_KEY_ID
4. S3_SECRET_ACCESS_KEY
5. S3_BUCKET
6. S3_REGION
7. S3_ENDPOINT
8. HELLOASSO_CLIENT_ID
9. HELLOASSO_CLIENT_SECRET
10. RECAPTCHA_SECRET_KEY

---

### Section "Instance Type"

```
Instance Type
┌─────────────────────────────────────────┐
│ ○ Free                                  │ ← Commence avec celui-ci
│   $0/month • Sleeps after 15min          │
│                                          │
│ ○ Starter                                │
│   $7/month • 0.1 CPU • 512 MB            │
└─────────────────────────────────────────┘
```

**Free** : Gratuit mais s'endort après 15 min (30 sec de réveil)
**Starter** : $7/mois, toujours actif

---

### Bouton final

```
┌─────────────────────────────────────────┐
│                                          │
│        [Create Web Service]              │ ← Cliquez ici !
│                                          │
└─────────────────────────────────────────┘
```

---

## 📊 Écran de déploiement

Après avoir cliqué sur "Create Web Service", vous verrez :

```
┌─────────────────────────────────────────────────────────────┐
│ stemadeleine-api                                             │
│                                                              │
│ Status: ⏳ Building...                                       │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Logs                                                     │ │
│ │                                                          │ │
│ │ ==> Cloning repository...                               │ │
│ │ ==> Building Docker image...                            │ │
│ │ ==> Downloading dependencies from Maven Central...      │ │
│ │ ==> Building with Maven...                              │ │
│ │ ==> [INFO] Building api 0.0.1-SNAPSHOT                  │ │
│ │ ==> [INFO] BUILD SUCCESS                                │ │
│ │ ==> Starting container...                                │ │
│ │ ==> Flyway: Successfully initialized                     │ │
│ │ ==> Started ApiApplication in 12.456 seconds            │ │
│ │ ==> Tomcat started on port 8080                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Status: ✅ Live                                              │
│                                                              │
│ 🌐 https://stemadeleine-api.onrender.com                    │
└─────────────────────────────────────────────────────────────┘
```

**Durée** : 5-10 minutes pour le premier déploiement

---

## ✅ Vérification du succès

### 1. Dans Render

Status doit afficher : **✅ Live**

### 2. Testez l'URL

Ouvrez dans votre navigateur :

```
https://stemadeleine-api.onrender.com/actuator/health
```

Réponse attendue :

```json
{
  "status": "UP"
}
```

### 3. Testez votre API

```
https://stemadeleine-api.onrender.com/api/public/pages
```

Devrait retourner la liste de vos pages.

---

## 🔍 Diagnostic visuel

### Si le status est "❌ Failed"

1. **Cliquez** sur l'onglet "Logs"
2. **Cherchez** les mots-clés :
    - `Error`
    - `Exception`
    - `Failed`
    - `Connection`

### Erreurs communes

#### ❌ "The connection attempt failed"

```
Error creating bean...
Unable to obtain connection from database: 
The connection attempt failed.
```

**Solution** : Vérifiez votre `DATABASE_URL`

- Port = `6543` (pas 5432)
- Username = `postgres.eahwfewbtyndxbqfifuh` (avec suffixe)

#### ❌ "url must start with jdbc"

```
'url' must start with "jdbc"
```

**Solution** : Votre DATABASE_URL doit commencer par `jdbc:postgresql://`

#### ❌ "Health check failed"

```
Health check on /actuator/health failed
```

**Solution** : L'application ne démarre pas. Regardez les logs complets.

---

## 📚 Aide supplémentaire

Consultez :

- `RENDER_SSL_SUMMARY.md` - Résumé de la configuration
- `RENDER_FORM_VALUES.md` - Valeurs exactes pour le formulaire
- `RENDER_SSL_CONFIGURATION.md` - Guide SSL complet

Bonne chance ! 🚀

