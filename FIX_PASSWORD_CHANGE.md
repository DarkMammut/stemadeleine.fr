# Fix : Bouton de modification de mot de passe en production

## Problème identifié

Erreur 500 lors de la modification de mot de passe avec le message :

```
{
  message: "Erreur de communication avec le serveur",
  error: "Response constructor: Invalid response status code 204"
}
```

## Cause racine

Le proxy Next.js (`frontend/backoffice/src/app/api/[...path]/route.js`) essayait de parser toutes les réponses backend
comme du JSON, y compris les réponses **204 No Content** qui n'ont pas de body.

Le backend retourne correctement un `204 No Content` après une modification de mot de passe réussie (comme défini dans
`AccountAdminController.java`), mais le proxy tentait de faire `NextResponse.json(data, { status: 204 })`, ce qui génère
l'erreur "Invalid response status code 204" car on ne peut pas créer une réponse JSON avec un status 204.

## Solution appliquée

### 1. Modification du proxy API (`/frontend/backoffice/src/app/api/[...path]/route.js`)

Ajout d'une vérification spéciale pour les réponses 204 No Content :

```javascript
// Handle 204 No Content responses (no body)
if (response.status === 204) {
    return new Response(null, {
        status: 204,
        headers: response.headers,
    });
}
```

Au lieu de créer une `NextResponse.json()`, on retourne une `Response` sans body, ce qui est conforme au standard HTTP
pour les codes 204.

### 2. Améliorations additionnelles

- **Validation du provider** : Le bouton de modification de mot de passe est maintenant désactivé pour les comptes
  non-locaux (Google, etc.)
- **Message informatif** : Un message explique que la modification n'est disponible que pour les comptes locaux
- **Nettoyage du code** : Suppression des console.log de debug

## Fichiers modifiés

1. `/frontend/backoffice/src/app/api/[...path]/route.js` - Correction du proxy
2. `/frontend/backoffice/src/scenes/EditAccount.jsx` - Validation du provider
3. `/frontend/backoffice/src/components/ChangePasswordModal.jsx` - Nettoyage
4. `/frontend/backoffice/src/hooks/useAccountOperations.js` - Nettoyage

## Test

Pour tester la correction :

1. Déployer le code sur Vercel
2. Se connecter au backoffice en production
3. Aller sur "Paramètres > Comptes"
4. Cliquer sur un compte local
5. Cliquer sur "Modifier le mot de passe (admin)"
6. Remplir le formulaire et soumettre
7. ✅ Le mot de passe devrait être modifié sans erreur 500

## Autres endpoints concernés

Cette correction bénéficie aussi à tous les endpoints qui retournent un 204 No Content :

- `DELETE /api/admin/accounts/{id}`
- `PUT /api/admin/accounts/{id}/active`
- Autres endpoints de modification sans réponse JSON

## Note technique

La réponse 204 No Content est la bonne pratique HTTP pour les opérations de modification réussies sans données à
retourner. Le proxy doit donc gérer ce cas spécifiquement.
