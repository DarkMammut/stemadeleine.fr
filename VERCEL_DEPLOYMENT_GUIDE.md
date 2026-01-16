# 🚀 Guide de Déploiement Vercel - Stemadeleine

## 📋 Problème Résolu

### Modifications apportées :

1. ✅ Timeout harmonisé à 30 secondes pour tous les clients axios
2. ✅ Fichier `.env.production` créé avec `NEXT_PUBLIC_BACKEND_URL`
3. ✅ Configuration CORS du backend mise à jour pour supporter des origines dynamiques

---

## 🔧 Configuration Vercel

### 1. Variables d'Environnement à configurer sur Vercel

Dans **Project Settings > Environment Variables**, ajoutez :

| Variable                         | Valeur                                  | Environment                      |
|----------------------------------|-----------------------------------------|----------------------------------|
| `NEXT_PUBLIC_BACKEND_URL`        | `https://stemadeleine-api.onrender.com` | Production, Preview, Development |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | `votre_clé_publique_recaptcha`          | Production, Preview, Development |

### 2. Configuration Render (Backend)

Dans votre service **stemadeleine-api** sur Render, ajoutez la variable d'environnement :

| Variable               | Valeur                                 | Description                     |
|------------------------|----------------------------------------|---------------------------------|
| `CORS_ALLOWED_ORIGINS` | `https://stemadeleine-xxxx.vercel.app` | URL de votre déploiement Vercel |

**Comment trouver votre URL Vercel :**

1. Allez sur votre projet Vercel
2. Dans l'onglet "Deployments", copiez l'URL de votre déploiement
3. Format typique : `https://stemadeleine-[hash].vercel.app`

**Note :** Si vous avez plusieurs environnements (preview, production), vous pouvez les séparer par des virgules :

```
https://stemadeleine-xxxx.vercel.app,https://stemadeleine-preview-yyyy.vercel.app
```

---

## 🔍 Vérification

### 1. Tester la connexion au backend

Ouvrez la console du navigateur sur votre site Vercel et tapez :

```javascript
fetch('https://stemadeleine-api.onrender.com/api/public/health')
    .then(r => r.json())
    .then(console.log)
    .catch(console.error)
```

Si vous voyez une erreur CORS, c'est que l'URL Vercel n'est pas dans la liste des origines autorisées.

### 2. Vérifier les logs Vercel

Dans Vercel > Deployments > [Votre déploiement] > Function Logs

Recherchez les erreurs liées à `NEXT_PUBLIC_BACKEND_URL` ou `axios`.

### 3. Vérifier les logs Render

Dans Render > stemadeleine-api > Logs

Recherchez les erreurs CORS comme :

```
CORS policy: No 'Access-Control-Allow-Origin' header
```

---

## 🐛 Résolution des Problèmes Courants

### Problème 1 : Erreur CORS

**Symptôme :**

```
Access to fetch at 'https://stemadeleine-api.onrender.com' from origin 'https://stemadeleine-xxx.vercel.app' 
has been blocked by CORS policy
```

**Solution :**

1. Copiez l'URL exacte de votre site Vercel (visible dans l'erreur)
2. Ajoutez-la dans la variable d'environnement `CORS_ALLOWED_ORIGINS` sur Render
3. Attendez que Render redéploie automatiquement (quelques minutes)

### Problème 2 : 404 sur les endpoints

**Symptôme :** Toutes les requêtes retournent 404

**Solution :**

- Vérifiez que `NEXT_PUBLIC_BACKEND_URL` est bien définie sur Vercel
- Assurez-vous qu'il n'y a pas de `/` final dans l'URL
- Redéployez sur Vercel après avoir ajouté/modifié les variables

### Problème 3 : Timeout

**Symptôme :** Les requêtes échouent après 30 secondes

**Solution :**

- Le backend Render (plan gratuit) s'endort après 15 minutes d'inactivité
- Le premier appel peut prendre 30-60 secondes pour réveiller le service
- C'est normal, les appels suivants seront rapides

---

## 🎯 Checklist de Déploiement

- [ ] Variables d'environnement configurées sur Vercel
- [ ] Variable `CORS_ALLOWED_ORIGINS` configurée sur Render
- [ ] Backend Render redéployé et opérationnel
- [ ] Test de l'endpoint `/api/public/health` réussi
- [ ] Formulaire de contact fonctionne
- [ ] Pas d'erreurs CORS dans la console navigateur
- [ ] Logs Vercel vérifiés (pas d'erreurs critiques)
- [ ] Logs Render vérifiés (backend répond correctement)

---

## 📞 Support

Si le problème persiste :

1. Vérifiez les logs Vercel et Render
2. Testez l'endpoint backend directement dans le navigateur
3. Vérifiez que le backend est bien réveillé (plan gratuit)

---

## 🎉 Prochaines Étapes

Une fois le déploiement réussi :

1. Configurez votre domaine personnalisé sur Vercel
2. Mettez à jour le CORS avec votre domaine final
3. Testez tous les formulaires et fonctionnalités
4. Configurez les redirections DNS si nécessaire
