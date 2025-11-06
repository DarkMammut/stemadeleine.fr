# Guide d'utilisation - Formulaire de Contact

## 📋 Ce qui a été implémenté

### ✅ Frontend (ContactPageContent.jsx)

1. **Intégration axiosClient** : Utilisation du hook `useAxiosClient()` selon vos directives
2. **Requête POST** : Envoi vers `/api/public/contact` avec les bonnes données
3. **Gestion des erreurs** : Affichage d'erreurs spécifiques selon le type d'erreur
4. **État de chargement** : Bouton désactivé et texte "Envoi en cours..." pendant la soumission
5. **Validation** : Maintien de la validation existante côté client

### ✅ Backend (PublicController.java)

La route POST `/api/public/contact` est déjà implémentée et :

- Accepte un `CreateContactRequest` avec validation
- Crée un `Contact` en base de données
- Lie automatiquement à un utilisateur existant si trouvé
- Retourne un statut HTTP 201 en cas de succès

## 🔧 Structure des données envoyées

```javascript
const contactData = {
  firstName: "Jean",      // string, requis, max 100 chars
  lastName: "Dupont",     // string, requis, max 100 chars
  email: "jean@test.com", // string, requis, email valide, max 255 chars
  subject: "Sujet",       // string, requis, max 200 chars
  message: "Message..."   // string, requis, max 2000 chars
};
```

## 🚀 Comment tester

### 1. Démarrer l'API

```bash
cd stemadeleine.fr
npm run api
```

### 2. Démarrer le frontend

```bash
npm run dev
```

### 3. Tester le formulaire

- Aller sur la page Contact
- Remplir tous les champs
- Cocher la case RGPD
- Cliquer sur "Envoyer le message"

## 🔍 Gestion des erreurs

Le formulaire gère différents types d'erreurs :

- **400 Bad Request** : "Veuillez vérifier les informations saisies."
- **500+ Server Error** : "Erreur serveur. Veuillez réessayer plus tard."
- **Timeout** : "Délai d'attente dépassé. Veuillez réessayer."
- **Autres** : "Une erreur est survenue. Veuillez réessayer."

## 📝 Logs de debug

Les logs sont activés pour suivre le processus :

- Form validation success/failure
- API call success
- API call errors avec détails

## ⚡ Points importants

1. **axiosClient hook** : Toujours utilisé comme demandé
2. **CORS** : Configuré dans le PublicController pour localhost:3000
3. **Validation** : Double validation (client + serveur)
4. **UX** : Loading state et messages d'erreur clairs
5. **Modal de succès** : Conservé tel quel après soumission réussie

## 🧪 Tests

Un fichier de test `ContactPageContent.test.jsx` a été créé pour :

- Tester l'envoi de données correctes à l'API
- Vérifier la gestion des erreurs
- S'assurer que l'UI réagit correctement

Le formulaire est maintenant entièrement fonctionnel avec votre API backend ! 🎉
