# 🔐 Système de réinitialisation de mot de passe - Frontend

## Vue d'ensemble

Le système de réinitialisation de mot de passe permet aux utilisateurs de récupérer l'accès à leur compte en recevant un
lien par email.

## Pages

### 1. `/auth/forgot-password` - Demande de réinitialisation

Page permettant de saisir son email pour recevoir un lien de réinitialisation.

**Composant** : `ForgotPasswordForm.jsx`

**Fonctionnalités** :

- Formulaire de saisie d'email
- Validation côté client
- Message de confirmation (ne révèle pas si l'email existe)
- Lien de retour vers la page de connexion

**Flux utilisateur** :

1. L'utilisateur saisit son email
2. Clic sur "Envoyer le lien de réinitialisation"
3. Message de confirmation s'affiche
4. Email envoyé (si le compte existe)

### 2. `/auth/reset-password?token=...` - Réinitialisation

Page permettant de définir un nouveau mot de passe avec un token valide.

**Composant** : `ResetPasswordForm.jsx`

**Fonctionnalités** :

- Validation automatique du token au chargement
- Formulaire de saisie du nouveau mot de passe
- Confirmation du mot de passe
- Affichage/masquage du mot de passe
- Validation côté client (min 6 caractères)
- Redirection automatique vers la page de connexion après succès

**États d'affichage** :

- **Chargement** : Validation du token en cours
- **Token invalide** : Affichage d'un message d'erreur avec option de demander un nouveau lien
- **Formulaire** : Saisie du nouveau mot de passe
- **Succès** : Confirmation et redirection automatique

**Flux utilisateur** :

1. L'utilisateur clique sur le lien dans l'email
2. Le token est automatiquement validé
3. Si valide : formulaire de nouveau mot de passe
4. Si invalide : message d'erreur + possibilité de redemander un lien
5. Saisie et confirmation du nouveau mot de passe
6. Message de succès et redirection vers `/auth/login`

## Intégration dans le LoginForm

Le bouton "Mot de passe oublié ?" dans `LoginForm.jsx` redirige vers `/auth/forgot-password`.

```javascript
const handleForgotPassword = () => {
    router.push("/auth/forgot-password");
};
```

## Routes API (Proxy)

### POST `/api/auth/forgot-password`

Demande de réinitialisation de mot de passe.

**Body** :

```json
{
  "email": "user@example.com"
}
```

**Réponse** :

```json
{
  "message": "Si cet email existe, un lien de réinitialisation a été envoyé"
}
```

### POST `/api/auth/reset-password`

Réinitialisation du mot de passe avec un token.

**Body** :

```json
{
  "token": "uuid-token",
  "newPassword": "nouveau-mot-de-passe"
}
```

**Réponse succès** :

```json
{
  "message": "Mot de passe réinitialisé avec succès"
}
```

**Réponse erreur** :

```json
{
  "message": "Token invalide ou expiré"
}
```

### GET `/api/auth/validate-reset-token?token=...`

Validation d'un token de réinitialisation.

**Query params** :

- `token` : Le token à valider

**Réponse** :

```json
{
  "valid": true
}
```

## Configuration du middleware

Les routes de réinitialisation sont configurées comme publiques dans `middleware.js` :

```javascript
const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password'
];
```

## Sécurité

### Côté frontend

1. **Ne révèle pas si l'email existe** : Message générique après la demande
2. **Validation du token** : Vérification immédiate lors de l'accès à la page
3. **Validation du mot de passe** : Minimum 6 caractères
4. **Confirmation** : L'utilisateur doit saisir le mot de passe deux fois
5. **HTTPS uniquement** : Les requêtes passent par le proxy Next.js

### Côté backend (rappel)

1. **Token unique** : UUID v4
2. **Expiration** : 1 heure
3. **Usage unique** : Le token est marqué comme utilisé après réinitialisation
4. **Nettoyage automatique** : Les tokens expirés sont supprimés quotidiennement

## Personnalisation

### Modifier la durée d'expiration

Éditer `PasswordResetService.java` :

```java
// Changer 1 heure en 2 heures par exemple
LocalDateTime expiryDate = LocalDateTime.now().plusHours(2);
```

### Modifier le délai de redirection après succès

Éditer `ResetPasswordForm.jsx` :

```javascript
// Changer 3 secondes en 5 secondes par exemple
setTimeout(() => {
    router.push("/auth/login");
}, 5000);
```

### Personnaliser les messages

Les messages sont définis directement dans les composants :

- `ForgotPasswordForm.jsx` : Messages de la page de demande
- `ResetPasswordForm.jsx` : Messages de la page de réinitialisation

## Tests

### Test manuel

1. **Demande de réinitialisation** :
    - Aller sur `/auth/forgot-password`
    - Saisir un email valide
    - Vérifier la réception de l'email
    - Vérifier que le lien est correct

2. **Réinitialisation** :
    - Cliquer sur le lien dans l'email
    - Vérifier que le token est validé
    - Saisir un nouveau mot de passe
    - Vérifier la redirection
    - Se connecter avec le nouveau mot de passe

3. **Token expiré/invalide** :
    - Essayer d'utiliser un lien ancien (>1h)
    - Essayer d'utiliser un lien déjà utilisé
    - Vérifier les messages d'erreur

## Améliorations futures possibles

- [ ] Ajouter un captcha sur la demande de réinitialisation
- [ ] Limiter le nombre de demandes par IP/email (rate limiting)
- [ ] Envoyer un email de confirmation après changement de mot de passe
- [ ] Ajouter une force indicator pour le mot de passe
- [ ] Historique des mots de passe pour éviter la réutilisation
