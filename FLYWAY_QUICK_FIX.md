# ⚡ ACTION RAPIDE - Activer les migrations Flyway

## 🎯 Problème

✅ Connexion à Supabase fonctionne  
❌ Tables non créées → Flyway n'a pas migré

## 🚀 Solution en 3 étapes (5 minutes)

### Étape 1 : Préparer Supabase (2 minutes)

1. **Allez dans Supabase Dashboard**  
   https://supabase.com/dashboard

2. **Sélectionnez votre projet** : `Ste Madeleine`

3. **Cliquez sur "SQL Editor"** (menu gauche)

4. **Créez une nouvelle requête** (bouton "+ New query")

5. **Copiez-collez ce SQL** :

```sql
-- Créer l'extension UUID nécessaire pour Flyway
CREATE
EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vérifier que ça a fonctionné
SELECT *
FROM pg_extension
WHERE extname = 'uuid-ossp';
```

6. **Cliquez sur "Run"** (ou Ctrl+Enter)

7. **Vous devriez voir** :

```
oid      | extname   | extowner | extnamespace | ...
---------|-----------|----------|--------------|----
(1 row)
```

✅ **C'est bon !** L'extension est créée.

---

### Étape 2 : Redéployer sur Render (5 minutes)

1. **Allez dans Render Dashboard**  
   https://dashboard.render.com

2. **Cliquez sur votre Web Service** : `stemadeleine-api`

3. **Cliquez sur "Manual Deploy"** (en haut à droite)

4. **Sélectionnez "Clear build cache & deploy"**

5. **Attendez 5-10 minutes** que le déploiement se termine

6. **Surveillez les logs** et cherchez :

```
Flyway Community Edition
Successfully validated X migrations
Migrating schema "public" to version "1 - init schema"
Successfully applied X migrations
```

✅ **Si vous voyez ça, c'est gagné !**

---

### Étape 3 : Vérifier les tables (1 minute)

1. **Retournez dans Supabase Dashboard**

2. **Cliquez sur "Database"** → **"Tables"** (menu gauche)

3. **Vous devriez voir ces tables** :
    - ✅ `users`
    - ✅ `accounts`
    - ✅ `pages`
    - ✅ `sections`
    - ✅ `modules`
    - ✅ `media`
    - ✅ `contents`
    - ✅ `fields`
    - ✅ `contacts`
    - ✅ `payments`
    - ✅ `organizations`
    - ✅ `address`
    - ✅ `flyway_schema_history` (table de versioning Flyway)

4. **Cliquez sur la table `accounts`**

5. **Vous devriez voir 1 ligne** :
    - Email : `admin@example.com` (créé par la migration V2)
    - Role : `ROLE_ADMIN`

✅ **Parfait ! Les migrations ont fonctionné !**

---

## 🎉 Résultat attendu

Après ces 3 étapes, votre API pourra :

- ✅ Créer des utilisateurs
- ✅ S'authentifier
- ✅ Gérer les pages
- ✅ Uploader des médias
- ✅ Tout le reste !

---

## 🆘 Si ça ne fonctionne pas

### Erreur dans les logs Render : "permission denied"

**Cause** : L'utilisateur PostgreSQL n'a pas les droits pour créer l'extension.

**Solution** : Exécutez ce SQL dans Supabase en tant qu'admin :

```sql
-- Donner les permissions CREATE sur le schéma public
GRANT
CREATE
ON SCHEMA public TO postgres;
GRANT ALL
ON SCHEMA public TO postgres;

-- Vérifier les permissions
SELECT has_schema_privilege('postgres', 'public', 'CREATE') AS can_create,
       has_schema_privilege('postgres', 'public', 'USAGE')  AS can_use;
```

### Erreur dans les logs : "Flyway failed to initialize"

**Cause** : Problème de connexion ou de configuration.

**Solution** : Vérifiez que `DATABASE_URL` dans Render contient bien :

```
jdbc:postgresql://aws-1-eu-west-3.pooler.supabase.com:6543/postgres?user=postgres.eahwfewbtyndxbqfifuh&password=Lajarrie17220&sslmode=require
```

### Les tables ne sont toujours pas créées

**Solution de dernier recours** : Exécutez manuellement les migrations dans Supabase.

1. **Téléchargez ce fichier** : `backend/api/src/main/resources/db/migration/V1__init_schema.sql`
2. **Ouvrez-le dans un éditeur de texte**
3. **Copiez tout le contenu**
4. **Allez dans Supabase SQL Editor**
5. **Collez et exécutez le SQL**
6. **Faites de même pour V2, V3, V4, etc.**

---

## 📊 Diagnostic complet

Si vous voulez un diagnostic complet, exécutez ce fichier dans Supabase SQL Editor :

```
backend/api/supabase-flyway-diagnostic.sql
```

Il vous dira exactement quel est le problème.

---

## ✅ Checklist

- [ ] Extension uuid-ossp créée dans Supabase
- [ ] Redéploiement Render lancé
- [ ] Logs Render montrent "Flyway... Successfully applied X migrations"
- [ ] Tables visibles dans Supabase Dashboard
- [ ] Table `accounts` contient 1 ligne (admin)
- [ ] Votre API peut créer des utilisateurs

**Une fois ces 6 points validés, c'est terminé ! 🎉**

