# 🔒 Guide de Sécurité - Fichiers d'environnement

## ⚠️ PROBLÈME RÉSOLU

Les fichiers `.env` contenant des informations sensibles ont été **retirés du repository GitHub**.

## Actions effectuées

### 1. Amélioration des règles `.gitignore`
Tous les fichiers `.gitignore` ont été mis à jour pour ignorer explicitement :
- `.env`
- `.env.local`
- `.env.development`
- `.env.production`
- `.env.test`
- `.env*.local`
- **SAUF** `.env.example` qui peut être commité

### 2. Suppression des fichiers du tracking Git
Les fichiers suivants ont été retirés du tracking Git (mais conservés localement) :
- `.env` (racine)
- `backend/api/.env.local`
- `backend/api/.env.production`
- `frontend/backoffice/.env.local`
- `frontend/backoffice/.env.production`
- `frontend/stemadeleine/.env`

### 3. Création de fichiers `.env.example`
Des fichiers d'exemple ont été créés pour documenter les variables nécessaires :
- `backend/api/.env.example`
- `frontend/backoffice/.env.example`
- `frontend/stemadeleine/.env.example`

## 🚨 Prochaines étapes CRITIQUES

### 1. Révoquer les secrets exposés
**IMPORTANT** : Les secrets qui étaient dans les fichiers `.env` sur GitHub doivent être considérés comme compromis. Vous devez :

- [ ] **Changer TOUS les mots de passe de base de données**
- [ ] **Régénérer les clés JWT/secrets**
- [ ] **Révoquer et régénérer les clés API tierces** (si présentes)
- [ ] **Changer les credentials email** (si présents)
- [ ] **Régénérer les tokens d'accès** (si présents)

### 2. Pousser les changements sur GitHub
```bash
git push origin <votre-branche>
```

### 3. Vérifier l'historique Git (optionnel mais recommandé)
Les anciens commits contiennent toujours les fichiers `.env`. Pour un nettoyage complet, vous pourriez utiliser :
- `git filter-repo` (recommandé)
- `BFG Repo-Cleaner`

⚠️ **Attention** : Nettoyer l'historique Git nécessite un force push et peut causer des problèmes si d'autres personnes ont cloné le repo.

### 4. Configurer les variables d'environnement en production
Pour le déploiement, utilisez :
- Variables d'environnement du serveur/plateforme
- Secrets GitHub (pour CI/CD)
- Services de gestion de secrets (AWS Secrets Manager, HashiCorp Vault, etc.)

**Ne jamais commiter de vrais secrets dans Git !**

## 📋 Checklist de vérification

- [x] Fichiers `.gitignore` mis à jour
- [x] Fichiers `.env` retirés du tracking Git
- [x] Fichiers `.env.example` créés
- [ ] Commit et push effectués
- [ ] Secrets compromis révoqués et régénérés
- [ ] Variables d'environnement configurées en production
- [ ] Équipe informée des changements

## 🔍 Vérification future

Pour vérifier qu'aucun fichier `.env` n'est tracké :
```bash
git ls-files | grep '\.env'
```

Cette commande ne devrait retourner que les fichiers `.env.example`.

## 📚 Bonnes pratiques

1. **Ne jamais commiter** de fichiers `.env` contenant de vraies valeurs
2. **Toujours utiliser** des fichiers `.env.example` pour la documentation
3. **Configurer** les secrets via des variables d'environnement en production
4. **Régénérer** immédiatement tout secret exposé
5. **Vérifier** régulièrement avec `git status` avant de commiter

---

**Date de résolution** : 8 janvier 2026

