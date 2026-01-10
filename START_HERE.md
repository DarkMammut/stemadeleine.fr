# 🚀 Guide de Déploiement - Stemadeleine.fr

## 📖 Vue d'ensemble

Ce projet contient :

- **Backend API** : Spring Boot (Java 21) - à déployer sur **Render**
- **Frontend principal** : Next.js - à déployer sur **Vercel**
- **Backoffice** : Next.js - à déployer sur **Vercel**
- **Base de données** : PostgreSQL sur **Supabase**

---

## 🎯 Démarrage Rapide

### Pour voir l'aide-mémoire :

```bash
./help.sh
```

### Étapes essentielles :

1. **Nettoyer les .env de Git** (URGENT !)
   ```bash
   ./clean-env-files.sh
   git commit -m "chore: remove .env files"
   git push origin main
   ```

2. **Générer une clé JWT**
   ```bash
   ./generate-jwt-secret.sh
   ```

3. **Suivre la checklist complète**
   Ouvrez `DEPLOYMENT_CHECKLIST.md` pour le guide complet

---

## 📚 Documentation

| Fichier                      | Description                                             |
|------------------------------|---------------------------------------------------------|
| `DEPLOYMENT_CHECKLIST.md`    | ✨ **Guide complet** - Suivez ce fichier étape par étape |
| `RENDER_FORM_VALUES.md`      | Valeurs à copier/coller dans le formulaire Render       |
| `RENDER_DEPLOYMENT_GUIDE.md` | Guide détaillé spécifique à Render                      |
| `backend/api/.env.example`   | Liste des variables d'environnement requises            |
| `backend/api/README.md`      | Documentation de l'API                                  |

---

## 🛠️ Scripts Utiles

| Script                        | Usage                              |
|-------------------------------|------------------------------------|
| `./help.sh`                   | Affiche l'aide-mémoire             |
| `./clean-env-files.sh`        | Nettoie les .env du repository Git |
| `./generate-jwt-secret.sh`    | Génère une clé JWT sécurisée       |
| `backend/api/render-build.sh` | Build Maven pour Render            |
| `backend/api/render-start.sh` | Démarre l'API sur Render           |

---

## 🎯 Configuration Render (Copier/Coller)

```
Name:            stemadeleine-api
Language:        Java
Branch:          main
Region:          Frankfurt (EU Central)
Root Directory:  backend/api
Build Command:   ./render-build.sh
Start Command:   ./render-start.sh
```

### Variables d'environnement requises :

Voir le fichier `RENDER_FORM_VALUES.md` pour la liste complète avec explications.

---

## 🔗 URLs après déploiement

- **API** : `https://stemadeleine-api.onrender.com`
- **Site principal** : `https://stemadeleine.fr`
- **Backoffice** : `https://backoffice.stemadeleine.fr`

### Test de l'API :

```bash
curl https://stemadeleine-api.onrender.com/api/public/health
```

Réponse attendue :

```json
{
  "status": "UP",
  "service": "stemadeleine-api"
}
```

---

## 📦 Identifiants à Récupérer

### Supabase

1. https://supabase.com/dashboard
2. Settings → Database (pour URL, user, password)
3. Settings → API (pour S3 Access Key)

### HelloAsso

1. https://api.helloasso.com/
2. Client ID et Client Secret

### Google reCAPTCHA

1. https://www.google.com/recaptcha/admin
2. Clé secrète (Secret Key)

---

## ✅ Checklist Rapide

- [ ] Nettoyer les .env de Git
- [ ] Générer une clé JWT
- [ ] Récupérer identifiants Supabase
- [ ] Récupérer identifiants HelloAsso
- [ ] Récupérer clé reCAPTCHA
- [ ] Déployer l'API sur Render
- [ ] Tester l'API
- [ ] Déployer le frontend sur Vercel
- [ ] Déployer le backoffice sur Vercel
- [ ] Tests finaux

---

## 🆘 Support

- **Render** : https://render.com/docs
- **Vercel** : https://vercel.com/docs
- **Supabase** : https://supabase.com/docs
- **Spring Boot** : https://spring.io/guides
- **Next.js** : https://nextjs.org/docs

---

## 💰 Coûts Estimés

### Plan Gratuit

- Render Free : 750h/mois
- Vercel Hobby : Illimité
- Supabase Free : 500MB DB
- **Total : 0€/mois**

### Production (Recommandé)

- Render Starter : $7/mois
- Vercel Pro : $20/mois
- Supabase Pro : $25/mois
- **Total : ~52$/mois (~50€/mois)**

---

## 🎉 Prêt à Déployer !

**Commencez maintenant :**

```bash
./help.sh
```

Puis suivez le guide dans `DEPLOYMENT_CHECKLIST.md`

Bonne chance ! 🚀

