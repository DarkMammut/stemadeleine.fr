# 📧 Système d'envoi d'emails

## Vue d'ensemble

Le système d'envoi d'emails est configuré pour envoyer des emails HTML avec templates Thymeleaf. Il est utilisé pour la
réinitialisation de mot de passe et peut être étendu pour d'autres fonctionnalités.

## Configuration

### Variables d'environnement

Ajoutez ces variables dans votre fichier `.env` ou dans la configuration de Render :

```properties
# Configuration Email (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre-email@gmail.com
MAIL_PASSWORD=votre-mot-de-passe-application
MAIL_FROM=noreply@stemadeleine.fr
MAIL_FROM_NAME=Sainte Madeleine
# URL du frontend (pour les liens dans les emails)
FRONTEND_URL=https://backoffice-stemadeleine.onrender.com
```

### Configuration Gmail

Pour utiliser Gmail SMTP :

1. Activer la validation en 2 étapes sur votre compte Google
2. Générer un "Mot de passe d'application" : https://myaccount.google.com/apppasswords
3. Utiliser ce mot de passe pour `MAIL_PASSWORD`

### Configuration avec d'autres fournisseurs SMTP

Pour utiliser un autre fournisseur (SendGrid, Mailgun, etc.) :

```properties
# Exemple SendGrid
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=votre-api-key-sendgrid
# Exemple Mailgun
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=postmaster@votre-domaine.mailgun.org
MAIL_PASSWORD=votre-mot-de-passe-mailgun
```

## Utilisation

### Service EmailService

Le service `EmailService` fournit plusieurs méthodes :

#### 1. Envoyer un email simple (texte brut)

```java

@Autowired
private EmailService emailService;

emailService.

sendSimpleEmail(
    "destinataire@example.com",
            "Sujet de l'email",
            "Corps du message en texte brut"
);
```

#### 2. Envoyer un email avec template

```java
Map<String, Object> variables = Map.of(
        "userName", "Jean Dupont",
        "customVariable", "valeur"
);

emailService.

sendTemplatedEmail(
    "destinataire@example.com",
            "Sujet de l'email",
            "nom-du-template", // sans extension .html
    variables
    );
```

#### 3. Méthodes prédéfinies

##### Email de réinitialisation de mot de passe

```java
emailService.sendPasswordResetEmail(
    "user@example.com",
            "https://backoffice.example.com/reset-password?token=abc123",
            "Jean"
);
```

##### Email de bienvenue

```java
emailService.sendWelcomeEmail(
    "user@example.com",
            "Jean Dupont"
);
```

##### Email de notification

```java
emailService.sendNotification(
    "user@example.com",
            "Titre de la notification",
            "Message de la notification"
);
```

## Templates disponibles

Les templates sont situés dans `src/main/resources/templates/` :

### 1. `password-reset-email.html`

- **Utilisé pour** : Réinitialisation de mot de passe
- **Variables** :
    - `userName` : Nom de l'utilisateur
    - `resetLink` : Lien de réinitialisation complet

### 2. `welcome-email.html`

- **Utilisé pour** : Email de bienvenue lors de la création de compte
- **Variables** :
    - `userName` : Nom de l'utilisateur

### 3. `notification-email.html`

- **Utilisé pour** : Notifications génériques
- **Variables** :
    - `title` : Titre de la notification
    - `message` : Message de la notification

## Créer un nouveau template

1. Créer un fichier `.html` dans `src/main/resources/templates/`
2. Utiliser la syntaxe Thymeleaf pour les variables dynamiques :

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Mon Template</title>
    <style>
        /* Vos styles CSS inline */
    </style>
</head>
<body>
<h1>Bonjour <span th:text="${userName}">Utilisateur</span> !</h1>
<p th:text="${customMessage}">Message par défaut</p>
<a th:href="${actionLink}">Cliquez ici</a>
</body>
</html>
```

3. Ajouter une méthode dans `EmailService` pour utiliser ce template :

```java
public void sendCustomEmail(String to, String userName, String message, String link) {
    Map<String, Object> variables = Map.of(
            "userName", userName,
            "customMessage", message,
            "actionLink", link
    );

    sendTemplatedEmail(
            to,
            "Sujet de l'email",
            "mon-template", // nom du fichier sans .html
            variables
    );
}
```

## Système de réinitialisation de mot de passe

### Fonctionnement

1. **Demande de réinitialisation** (`POST /api/auth/forgot-password`)
    - L'utilisateur saisit son email
    - Un token unique est généré (UUID)
    - Le token est stocké en base avec une expiration de 1 heure
    - Un email avec un lien est envoyé

2. **Validation du token** (`GET /api/auth/validate-reset-token`)
    - Vérifie si le token existe
    - Vérifie si le token n'est pas expiré
    - Vérifie si le token n'a pas déjà été utilisé

3. **Réinitialisation** (`POST /api/auth/reset-password`)
    - Valide le token
    - Change le mot de passe
    - Marque le token comme utilisé

### Sécurité

- Les tokens expirent après 1 heure
- Un token ne peut être utilisé qu'une seule fois
- Les anciens tokens sont automatiquement supprimés chaque jour à 2h du matin
- Pour des raisons de sécurité, on ne révèle jamais si un email existe ou non

## Tâches planifiées

### Nettoyage automatique des tokens expirés

Une tâche s'exécute automatiquement tous les jours à 2h du matin pour supprimer les tokens expirés :

```java

@Scheduled(cron = "0 0 2 * * ?")
@Transactional
public void cleanupExpiredTokens() {
    // Supprime les tokens dont la date d'expiration est dépassée
}
```

## Emails asynchrones

Tous les emails sont envoyés de manière asynchrone (annotation `@Async`) pour ne pas bloquer les requêtes HTTP.

## Tests

Pour tester l'envoi d'emails en développement :

1. Utiliser un service de "fake SMTP" comme [Mailtrap](https://mailtrap.io/)
2. Configurer les variables d'environnement avec les credentials Mailtrap
3. Les emails seront capturés par Mailtrap au lieu d'être réellement envoyés

## Dépannage

### Erreur "Authentication failed"

Vérifiez :

- Le `MAIL_USERNAME` et `MAIL_PASSWORD` sont corrects
- Si vous utilisez Gmail, vous utilisez un mot de passe d'application et non votre mot de passe principal
- La validation en 2 étapes est activée sur Gmail

### Erreur "Connection timeout"

Vérifiez :

- Le `MAIL_HOST` et `MAIL_PORT` sont corrects
- Votre serveur peut accéder au SMTP (pas de firewall qui bloque)
- Le port 587 (STARTTLS) ou 465 (SSL) est ouvert

### Les emails vont dans les spams

Pour éviter cela :

- Configurer SPF, DKIM et DMARC sur votre domaine
- Utiliser un service SMTP professionnel (SendGrid, Mailgun, etc.)
- Utiliser un domaine vérifié pour l'email expéditeur
