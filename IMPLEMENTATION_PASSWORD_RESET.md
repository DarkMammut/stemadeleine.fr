# ✅ Implémentation du système de réinitialisation de mot de passe

## 📋 Résumé

J'ai implémenté un système complet de réinitialisation de mot de passe avec envoi d'emails par templates. Voici ce qui a
été ajouté :

## 🎯 Backend (Spring Boot)

### 1. Dépendances ajoutées (pom.xml)

- `spring-boot-starter-mail` : Envoi d'emails
- `spring-boot-starter-thymeleaf` : Templates HTML

### 2. Nouveau modèle

- **PasswordResetToken** : Stocke les tokens de réinitialisation
    - Token unique (UUID)
    - Expiration (1 heure)
    - Usage unique
    - Lié au compte utilisateur

### 3. Migration Flyway

- **V9__create_password_reset_tokens_table.sql** : Création de la table

### 4. Nouveaux DTOs

- **ForgotPasswordRequest** : Demande de réinitialisation (email)
- **ResetPasswordRequest** : Réinitialisation (token + nouveau mot de passe)

### 5. Services

- **EmailService** : Gestion complète de l'envoi d'emails
    - Emails simples (texte brut)
    - Emails avec templates HTML (Thymeleaf)
    - Méthodes prédéfinies : reset password, welcome, notification
    - Envoi asynchrone (@Async)

- **PasswordResetService** : Gestion des réinitialisations
    - Génération de tokens
    - Validation de tokens
    - Changement de mot de passe
    - Nettoyage automatique des tokens expirés (tâche planifiée quotidienne)

### 6. Templates d'email (Thymeleaf)

- **password-reset-email.html** : Email de réinitialisation
- **welcome-email.html** : Email de bienvenue
- **notification-email.html** : Notifications génériques

### 7. Endpoints API (AuthController)

- `POST /api/auth/forgot-password` : Demande de réinitialisation
- `POST /api/auth/reset-password` : Réinitialisation avec token
- `GET /api/auth/validate-reset-token` : Validation d'un token

### 8. Configuration

- Activation de @EnableAsync et @EnableScheduling
- Ajout des variables d'environnement pour SMTP
- Configuration dans application.properties

## 🎨 Frontend (Next.js)

### 1. Composants

- **ForgotPasswordForm.jsx** : Formulaire de demande de réinitialisation
- **ResetPasswordForm.jsx** : Formulaire de nouveau mot de passe
    - Validation automatique du token
    - Gestion des états (loading, error, success)
    - Affichage/masquage du mot de passe
    - Redirection automatique après succès

### 2. Pages

- **/auth/forgot-password** : Page de demande
- **/auth/reset-password** : Page de réinitialisation

### 3. Routes API (Proxy Next.js)

- `/api/auth/forgot-password` : Proxy vers le backend
- `/api/auth/reset-password` : Proxy vers le backend
- `/api/auth/validate-reset-token` : Proxy vers le backend

### 4. Modifications

- **LoginForm.jsx** : Bouton "Mot de passe oublié" connecté
- **middleware.js** : Routes de réinitialisation ajoutées comme publiques

## 📧 Système d'emails modulaire

Le système d'emails a été conçu pour être **réutilisable** pour d'autres fonctionnalités :

### Exemples d'utilisation

```java
// Email simple
emailService.sendSimpleEmail(
    "user@example.com",
            "Sujet",
            "Message"
);

// Email avec template personnalisé
Map<String, Object> variables = Map.of(
        "userName", "Jean",
        "customVariable", "valeur"
);
emailService.

sendTemplatedEmail(
    "user@example.com",
            "Sujet",
            "mon-template",
    variables
    );

// Email de bienvenue
emailService.

sendWelcomeEmail("user@example.com","Jean");

// Notification
emailService.

sendNotification("user@example.com","Titre","Message");
```

### Créer un nouveau template

1. Créer un fichier HTML dans `src/main/resources/templates/`
2. Utiliser la syntaxe Thymeleaf : `th:text="${variable}"`
3. Ajouter une méthode dans EmailService si besoin

## 🔒 Sécurité

- ✅ Tokens uniques et sécurisés (UUID)
- ✅ Expiration automatique (1 heure)
- ✅ Usage unique (marqué comme utilisé après réinitialisation)
- ✅ Nettoyage automatique quotidien
- ✅ Ne révèle pas si un email existe
- ✅ HTTPS uniquement (via proxy Next.js)
- ✅ Endpoints publics bien configurés

## ⚙️ Configuration requise

### Variables d'environnement à ajouter

```bash
# Backend (.env ou Render)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password  # Mot de passe d'application Gmail
MAIL_FROM=noreply@stemadeleine.fr
MAIL_FROM_NAME=Sainte Madeleine
FRONTEND_URL=https://backoffice-stemadeleine.onrender.com
JWT_COOKIE_SECURE=true  # En production
```

### Pour Gmail

1. Activer la validation en 2 étapes
2. Générer un mot de passe d'application : https://myaccount.google.com/apppasswords
3. Utiliser ce mot de passe pour MAIL_PASSWORD

## 📚 Documentation

- **EMAIL_SYSTEM.md** : Documentation complète du système d'emails
- **PASSWORD_RESET.md** : Documentation du système de réinitialisation (frontend)
- **.env.example** : Mis à jour avec les nouvelles variables

## 🚀 Déploiement

### Étapes

1. **Configurer les variables d'environnement** sur Render :
    - MAIL_HOST
    - MAIL_PORT
    - MAIL_USERNAME
    - MAIL_PASSWORD (mot de passe d'application)
    - MAIL_FROM
    - MAIL_FROM_NAME
    - FRONTEND_URL

2. **Déployer le backend** :
    - La migration Flyway créera automatiquement la table
    - Le service EmailService sera actif

3. **Déployer le frontend** :
    - Les nouvelles pages seront accessibles
    - Les routes publiques sont configurées

4. **Tester** :
    - Aller sur /auth/login
    - Cliquer sur "Mot de passe oublié ?"
    - Saisir un email
    - Vérifier la réception de l'email
    - Cliquer sur le lien et réinitialiser

## 🧪 Tests

### Test manuel complet

1. **Demande de réinitialisation**
    - ✓ Accéder à /auth/forgot-password
    - ✓ Saisir un email existant
    - ✓ Vérifier le message de confirmation
    - ✓ Vérifier la réception de l'email

2. **Réinitialisation**
    - ✓ Cliquer sur le lien dans l'email
    - ✓ Vérifier que le token est validé
    - ✓ Saisir un nouveau mot de passe
    - ✓ Vérifier la redirection vers /auth/login
    - ✓ Se connecter avec le nouveau mot de passe

3. **Cas limites**
    - ✓ Email inexistant (message générique)
    - ✓ Token expiré (>1h)
    - ✓ Token déjà utilisé
    - ✓ Token invalide
    - ✓ Mots de passe non identiques

## 📈 Améliorations futures possibles

- [ ] Rate limiting sur les demandes de réinitialisation
- [ ] Captcha sur le formulaire de demande
- [ ] Email de confirmation après changement de mot de passe
- [ ] Force indicator pour le mot de passe
- [ ] Historique des mots de passe (éviter réutilisation)
- [ ] Support de plusieurs langues dans les templates
- [ ] Statistiques d'envoi d'emails
- [ ] Logs détaillés des réinitialisations

## 🎉 Résultat

Vous avez maintenant :

- ✅ Un système complet de réinitialisation de mot de passe
- ✅ Un système d'envoi d'emails modulaire et réutilisable
- ✅ Des templates HTML professionnels
- ✅ Une interface utilisateur intuitive
- ✅ Une sécurité robuste
- ✅ Une documentation complète

Le système est prêt à être utilisé et peut être facilement étendu pour d'autres fonctionnalités (notifications,
confirmations, newsletters, etc.).
