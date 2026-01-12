# 🔐 Comment récupérer le mot de passe de la base de données Supabase

Vous avez la connection string :
`postgresql://postgres:[YOUR-PASSWORD]@db.eahwfewbtyndxbqfifuh.supabase.co:5432/postgres`

Mais vous ne connaissez pas le mot de passe ? Voici comment le récupérer.

---

## ✅ MÉTHODE RECOMMANDÉE : Réinitialiser le mot de passe

C'est la méthode la plus simple et la plus sûre (surtout si vos credentials ont été exposées sur GitHub).

### Étapes :

1. **Ouvrez votre navigateur** et allez sur :
   ```
   https://supabase.com/dashboard/project/eahwfewbtyndxbqfifuh/settings/database
   ```

2. **Connectez-vous** si ce n'est pas déjà fait

3. **Dans la section "Database Password"**, cliquez sur le bouton **"Reset database password"**

4. **Copiez le nouveau mot de passe** qui s'affiche (il ressemble à quelque chose comme :
   `eP9kL2mN5qX8wZ3vY6bT1cF4gH7jR0sA`)

5. **Sauvegardez-le immédiatement** dans un endroit sûr (gestionnaire de mots de passe recommandé)

6. **IMPORTANT** : Après avoir cliqué sur "Reset", l'ancien mot de passe ne fonctionnera plus. Assurez-vous de bien
   copier le nouveau !

---

## 📧 Alternative : Chercher dans vos emails

Si vous ne voulez pas réinitialiser le mot de passe, cherchez dans vos emails :

1. **Ouvrez votre client email** (Gmail, Outlook, etc.)

2. **Cherchez** :
    - Expéditeur : `noreply@supabase.io` ou `@supabase.com`
    - Mots-clés : "password", "database", "credentials", "eahwfewbtyndxbqfifuh"
    - Date : Autour de la création de votre projet

3. **L'email contient** probablement :
    - Le mot de passe de la base de données
    - L'URL de connexion
    - Les informations du projet

---

## 🔍 Vérifier si le mot de passe est déjà quelque part

Vérifiez si vous ne l'avez pas déjà stocké :

1. **Gestionnaire de mots de passe** (1Password, LastPass, Bitwarden, etc.)
2. **Fichiers locaux** (recherchez `SUPABASE_DB_PASSWORD` dans votre projet)
3. **Notes personnelles** (Notion, Evernote, Apple Notes, etc.)

---

## ⚙️ Une fois le mot de passe récupéré

### Configurez vos fichiers .env locaux

Ajoutez ces 3 lignes dans `/backend/api/.env.local` :

```bash
SUPABASE_DB_URL=jdbc:postgresql://db.eahwfewbtyndxbqfifuh.supabase.co:5432/postgres
SUPABASE_DB_USER=postgres.eahwfewbtyndxbqfifuh
SUPABASE_DB_PASSWORD=VOTRE_MOT_DE_PASSE_ICI
```

### Pour Render

Utilisez exactement ces valeurs dans les variables d'environnement :

| Variable               | Valeur                                                                |
|------------------------|-----------------------------------------------------------------------|
| `SUPABASE_DB_URL`      | `jdbc:postgresql://db.eahwfewbtyndxbqfifuh.supabase.co:5432/postgres` |
| `SUPABASE_DB_USER`     | `postgres.eahwfewbtyndxbqfifuh`                                       |
| `SUPABASE_DB_PASSWORD` | Le mot de passe que vous avez récupéré                                |

---

## 🧪 Tester la connexion

Une fois configuré, testez que ça fonctionne :

```bash
cd backend/api
./mvnw spring-boot:run
```

Si la connexion fonctionne, vous verrez dans les logs :

```
HikariPool-1 - Starting...
HikariPool-1 - Start completed.
```

Si ça ne fonctionne pas, vous verrez :

```
java.sql.SQLException: FATAL: password authentication failed
```

---

## ❓ Toujours bloqué ?

Si vous ne retrouvez pas votre mot de passe et que vous ne pouvez pas le réinitialiser :

1. **Vérifiez que vous êtes bien connecté avec le bon compte Supabase** (celui qui a créé le projet)
2. **Contactez le support Supabase** : https://supabase.com/support
3. **En dernier recours** : Créez un nouveau projet Supabase (mais vous perdrez vos données)

---

## 🔒 Après avoir récupéré le mot de passe

**NE LE COMMITEZ PAS SUR GIT !**

Vérifiez que votre `.gitignore` contient bien :

```
.env
.env.local
.env.production
.env.*.local
```

Pour supprimer les mots de passe de l'historique Git, consultez `SECURITY_ENV_FIX.md`.

