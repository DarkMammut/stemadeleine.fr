# Guide d'installation reCAPTCHA - Protection du formulaire de contact

## 📋 Vue d'ensemble

Ce guide vous explique comment configurer la protection reCAPTCHA pour votre formulaire de contact. Cette protection
empêche les soumissions automatisées (bots) tout en permettant aux utilisateurs légitimes d'envoyer leurs messages.

## 🔧 Installation

### 1. Installation de la dépendance frontend

```bash
cd frontend/frontoffice
npm install react-google-recaptcha
```

### 2. Configuration Google reCAPTCHA

1. **Aller sur Google reCAPTCHA Console** : https://www.google.com/recaptcha/admin
2. **Créer un nouveau site** :
    - Label du site : "stemadeleine.fr - Contact Form"
    - Type de reCAPTCHA : **reCAPTCHA v2** ("Je ne suis pas un robot")
    - Domaines :
        - `localhost` (pour le développement)
        - `stemadeleine.fr` (pour la production)
3. **Récupérer les clés** :
    - **Clé du site** (Site Key) : À utiliser côté frontend
    - **Clé secrète** (Secret Key) : À utiliser côté backend

## 🔐 Configuration des variables d'environnement

### Frontend (.env)

```bash
# Frontend Environment Variables
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_RECAPTCHA_SITE_KEY=6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Backend (variables d'environnement Docker/Système)

```bash
# Ajouter à vos variables d'environnement
RECAPTCHA_SECRET_KEY=6LcYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
```

## 🏗️ Architecture implémentée

### Backend (Spring Boot)

1. **RecaptchaService** : Service de validation des tokens reCAPTCHA
2. **CreateContactRequest** : DTO modifié pour inclure le token reCAPTCHA
3. **PublicController** : Validation reCAPTCHA avant création du contact
4. **RestTemplate** : Configuration pour les appels à l'API Google

### Frontend (React)

1. **ReCaptcha** : Composant wrapper réutilisable
2. **ContactPageContent** : Intégration reCAPTCHA dans le formulaire
3. **Validation** : Le bouton reste désactivé tant que reCAPTCHA n'est pas validé

## 🔍 Fonctionnement

### Côté utilisateur

1. L'utilisateur remplit le formulaire
2. Il coche la case "Je ne suis pas un robot"
3. Google peut demander un défi supplémentaire (images, etc.)
4. Une fois validé, le bouton "Envoyer" devient actif
5. Le formulaire envoie le token reCAPTCHA avec les données

### Côté serveur

1. Réception des données + token reCAPTCHA
2. Validation du token auprès de Google
3. Si valide : création du contact
4. Si invalide : rejet avec erreur 400

## 🧪 Tests de fonctionnement

### Tests positifs

1. **Utilisateur normal** :
    - Remplit le formulaire
    - Valide reCAPTCHA
    - ✅ Message envoyé avec succès

### Tests négatifs

1. **Sans reCAPTCHA** :
    - Remplit le formulaire
    - Ne valide pas reCAPTCHA
    - ❌ Bouton reste désactivé

2. **Token invalide** :
    - Manipulation du token côté client
    - ❌ Erreur 400 "Invalid reCAPTCHA verification"

3. **Token expiré** :
    - Attendre l'expiration (5 minutes)
    - ❌ reCAPTCHA se reset automatiquement

## 🔧 Gestion des erreurs

### Frontend

- **Erreur reCAPTCHA** : "Erreur reCAPTCHA. Veuillez recharger la page et réessayer."
- **Token expiré** : Reset automatique du composant
- **Erreur réseau** : Gestion dans axiosClient avec messages appropriés

### Backend

- **Token invalide** : HTTP 400 avec message d'erreur
- **Erreur API Google** : Log d'erreur, validation échoue
- **Token manquant** : Validation échoue automatiquement

## 📊 Monitoring et logs

### Backend

```java
// Logs de succès
log.info("Contact created successfully - ID: {}",savedContact.getId());

// Logs d'erreur reCAPTCHA
        log.

warn("Invalid reCAPTCHA token for contact from {}",request.getEmail());
        log.

error("Error validating reCAPTCHA token: {}",e.getMessage());
```

### Frontend

```javascript
// Debug en développement
console.log("Contact form submitted successfully");
console.error("Form validation failed");
```

## 🚀 Déploiement

### Production

1. **Configurer les domaines** dans Google reCAPTCHA Console
2. **Définir les variables d'environnement** :
    - `RECAPTCHA_SECRET_KEY` (backend)
    - `REACT_APP_RECAPTCHA_SITE_KEY` (frontend)
3. **Tester le formulaire** en production

### Sécurité

- ✅ **Clés secrètes** : Jamais dans le code source
- ✅ **Validation côté serveur** : Obligatoire même avec validation client
- ✅ **HTTPS** : En production pour sécuriser les échanges
- ✅ **Rate limiting** : Considérer l'ajout d'une limite de requêtes

## 🎭 Expérience utilisateur

### Avantages

- **Protection efficace** contre les bots
- **Interface familière** pour les utilisateurs
- **Validation en temps réel** avec feedback visuel
- **Reset automatique** en cas d'expiration

### Inconvénients potentiels

- **Latence supplémentaire** (chargement Google)
- **Barrière d'accessibilité** pour certains utilisateurs
- **Dépendance externe** (service Google)

## 🛠️ Maintenance

### Surveillance

- **Taux de validation** : Surveiller les logs d'erreur reCAPTCHA
- **Performance** : Temps de réponse du formulaire
- **Accessibilité** : Retours utilisateurs sur les difficultés

### Mises à jour

- **API Google** : Suivre les changements de l'API reCAPTCHA
- **Dépendances** : Maintenir react-google-recaptcha à jour
- **Configuration** : Renouveler les clés si nécessaire

---

**Votre formulaire de contact est maintenant sécurisé contre les bots ! 🛡️**
