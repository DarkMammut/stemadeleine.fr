# ⚡ Solution : Forcer Flyway à appliquer les migrations

## 🎯 Situation

✅ Table `flyway_schema_history` existe (Flyway a démarré)  
❌ Aucune autre table (migrations pas appliquées)

## 🔍 Cause

Le paramètre `baseline-on-migrate=true` a créé la table Flyway mais n'a pas exécuté les migrations car :

- Soit la baseline a été créée au lieu de migrer
- Soit une erreur a empêché les migrations

## ✅ Solution 1 : Créer l'extension et redéployer (RECOMMANDÉ)

### Étape 1 : Dans Supabase SQL Editor

Exécutez ce SQL pour créer l'extension nécessaire :

```sql
-- Créer l'extension UUID
CREATE
EXTENSION IF NOT EXISTS "uuid-ossp";

-- Supprimer la table Flyway pour forcer une nouvelle migration
DROP TABLE IF EXISTS flyway_schema_history CASCADE;
```

⚠️ **Pourquoi supprimer la table ?**
Parce que Flyway pense que la base est déjà à jour. En la supprimant, Flyway repartira de zéro et appliquera toutes les
migrations.

### Étape 2 : Redéployer sur Render

1. Allez sur Render Dashboard
2. Cliquez sur **"Manual Deploy"** → **"Clear build cache & deploy"**
3. Attendez 5-10 minutes
4. Surveillez les logs pour voir :

```
Flyway Community Edition
Migrating schema "public" to version "1 - init schema"
Migrating schema "public" to version "2 - insert admin account"
...
Successfully applied 8 migrations to schema "public"
```

### Étape 3 : Vérifier dans Supabase

Allez dans **Database** → **Tables**, vous devriez voir :

- ✅ `users`
- ✅ `accounts`
- ✅ `pages`
- ✅ `sections`
- ✅ `media`
- ✅ Et toutes les autres tables

---

## ✅ Solution 2 : Forcer la migration via variable d'environnement

Si la Solution 1 ne fonctionne pas, essayez ceci :

### Étape 1 : Dans Render, ajouter une variable temporaire

Allez dans **Environment** et ajoutez :

```
SPRING_FLYWAY_CLEAN_DISABLED=false
SPRING_FLYWAY_CLEAN_ON_VALIDATION_ERROR=true
```

⚠️ **Attention** : Cette option SUPPRIME toutes les tables et recrée le schéma. À utiliser uniquement sur une base
vide !

### Étape 2 : Redéployer

Manual Deploy → Clear build cache & deploy

### Étape 3 : SUPPRIMER ces variables après le déploiement

Une fois que les tables sont créées, **supprimez ces 2 variables** pour la sécurité !

---

## ✅ Solution 3 : Migration manuelle (si tout le reste échoue)

### Étape 1 : Vérifier l'état actuel

Exécutez dans Supabase SQL Editor :

```sql
SELECT *
FROM flyway_schema_history;
```

Si la table est vide ou contient seulement une ligne "baseline", supprimez-la :

```sql
DROP TABLE flyway_schema_history CASCADE;
```

### Étape 2 : Créer l'extension

```sql
CREATE
EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Étape 3 : Exécuter manuellement V1

1. Ouvrez le fichier : `backend/api/src/main/resources/db/migration/V1__init_schema.sql`
2. Copiez TOUT le contenu
3. Collez dans Supabase SQL Editor
4. Exécutez

### Étape 4 : Exécuter V2 à V8

Faites de même pour chaque fichier de migration :

- `V2__insert_admin_account.sql`
- `V3__insert_initial_pages.sql`
- `V4__insert_initial_organization.sql`
- `V5__create_contacts_table.sql`
- `V6__add_is_read_to_contacts.sql`
- `V7__add_detail_page_url_to_newsletters.sql`
- `V8__create_newsletter_news_links_table.sql`

### Étape 5 : Recréer l'historique Flyway

Exécutez ce SQL pour que Flyway sache que les migrations sont appliquées :

```sql
-- Créer la table flyway_schema_history
CREATE TABLE flyway_schema_history
(
    installed_rank INTEGER       NOT NULL PRIMARY KEY,
    version        VARCHAR(50),
    description    VARCHAR(200)  NOT NULL,
    type           VARCHAR(20)   NOT NULL,
    script         VARCHAR(1000) NOT NULL,
    checksum       INTEGER,
    installed_by   VARCHAR(100)  NOT NULL,
    installed_on   TIMESTAMP     NOT NULL DEFAULT NOW(),
    execution_time INTEGER       NOT NULL,
    success        BOOLEAN       NOT NULL
);

-- Enregistrer toutes les migrations comme appliquées
INSERT INTO flyway_schema_history
VALUES (1, '1', 'init schema', 'SQL', 'V1__init_schema.sql', NULL, CURRENT_USER, NOW(), 0, TRUE),
       (2, '2', 'insert admin account', 'SQL', 'V2__insert_admin_account.sql', NULL, CURRENT_USER, NOW(), 0, TRUE),
       (3, '3', 'insert initial pages', 'SQL', 'V3__insert_initial_pages.sql', NULL, CURRENT_USER, NOW(), 0, TRUE),
       (4, '4', 'insert initial organization', 'SQL', 'V4__insert_initial_organization.sql', NULL, CURRENT_USER, NOW(),
        0, TRUE),
       (5, '5', 'create contacts table', 'SQL', 'V5__create_contacts_table.sql', NULL, CURRENT_USER, NOW(), 0, TRUE),
       (6, '6', 'add is read to contacts', 'SQL', 'V6__add_is_read_to_contacts.sql', NULL, CURRENT_USER, NOW(), 0,
        TRUE),
       (7, '7', 'add detail page url to newsletters', 'SQL', 'V7__add_detail_page_url_to_newsletters.sql', NULL,
        CURRENT_USER, NOW(), 0, TRUE),
       (8, '8', 'create newsletter news links table', 'SQL', 'V8__create_newsletter_news_links_table.sql', NULL,
        CURRENT_USER, NOW(), 0, TRUE);
```

---

## 🎯 Quelle solution choisir ?

### ✅ Solution 1 : Si votre base est VIDE

**La plus simple** : Supprimer la table flyway et redéployer.

### ✅ Solution 2 : Si la Solution 1 ne fonctionne pas

**Plus agressive** : Clean + redéploiement.

### ✅ Solution 3 : Si vous voulez garder le contrôle

**Plus longue** : Migration manuelle SQL par SQL.

---

## 🚀 Action recommandée MAINTENANT

### Commencez par la Solution 1 (la plus simple)

1. **Ouvrez Supabase SQL Editor**
2. **Exécutez** :

```sql
CREATE
EXTENSION IF NOT EXISTS "uuid-ossp";
DROP TABLE IF EXISTS flyway_schema_history CASCADE;
```

3. **Allez sur Render** → **Manual Deploy** → **Clear build cache & deploy**
4. **Attendez 10 minutes**
5. **Vérifiez les logs** : cherchez "Successfully applied 8 migrations"
6. **Vérifiez Supabase** : Database → Tables → Vous devriez voir toutes les tables

**Durée totale** : 15 minutes

---

## ✅ Résultat attendu

Après cette solution, vous aurez :

- ✅ 15+ tables créées dans Supabase
- ✅ Un utilisateur admin (email: `admin@example.com`)
- ✅ Des pages initiales
- ✅ Une organisation de base
- ✅ Flyway qui fonctionne pour les futures migrations

---

## 📊 Debug : Vérifier l'état actuel

Si vous voulez d'abord voir l'état exact de votre base, exécutez le fichier :

```
backend/api/check-flyway-status.sql
```

Il vous dira :

- Contenu de flyway_schema_history
- Extensions PostgreSQL installées
- Tables existantes
- Types ENUM créés

---

**Prochaine étape** : Exécutez la Solution 1 maintenant ! 🚀

