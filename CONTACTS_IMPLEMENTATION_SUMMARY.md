# Résumé des modifications - Page Contacts Backoffice

## ✅ Modifications Backend

### 1. Modèle Contact

**Fichier:** `backend/api/src/main/java/com/stemadeleine/api/model/Contact.java`

- ✅ Ajout du champ `isRead` (Boolean) pour traquer le statut de lecture

### 2. DTO Contact

**Fichier:** `backend/api/src/main/java/com/stemadeleine/api/dto/ContactDto.java`

- ✅ Ajout du champ `isRead` dans le DTO

### 3. Service Contact

**Fichier:** `backend/api/src/main/java/com/stemadeleine/api/service/ContactService.java`

- ✅ Ajout de la méthode `markAsRead(UUID contactId, Boolean isRead)`

### 4. Controller Contact

**Fichier:** `backend/api/src/main/java/com/stemadeleine/api/controller/ContactController.java`

- ✅ Ajout de l'endpoint `PUT /api/contacts/{contactId}/read?isRead={true|false}`
- ✅ Mise à jour de `convertToDto()` pour inclure `isRead`

### 5. Migration Base de Données

**Fichier:** `backend/api/src/main/resources/db/migration/V6__add_is_read_to_contacts.sql`

- ✅ Création de la migration pour ajouter la colonne `is_read` à la table `contacts`

---

## ✅ Modifications Frontend

### 1. Hook Custom

**Fichier:** `frontend/backoffice/src/hooks/useContactOperations.js`

- ✅ Création du hook avec les méthodes:
    - `getAllContacts()`
    - `getContactById(id)`
    - `markContactAsRead(id, isRead)`
    - `deleteContact(id)`
    - `linkContactToUser(contactId, userId)`
    - `unlinkContactFromUser(contactId)`

### 2. Composant CardList (Générique)

**Fichier:** `frontend/backoffice/src/components/CardList.jsx`

- ✅ Nouveau composant pour afficher des listes de cartes
- ✅ Gère l'affichage d'un message quand la liste est vide
- ✅ Réutilisable pour d'autres listes (users, payments, etc.)

### 3. Composant Card (Générique)

**Fichier:** `frontend/backoffice/src/components/Card.jsx`

- ✅ Nouveau composant carte cliquable avec chevron
- ✅ Gère les états hover
- ✅ Réutilisable pour tout type de contenu

### 4. Composant ContactCard (Spécifique)

**Fichier:** `frontend/backoffice/src/components/ContactCard.jsx`

- ✅ Carte spécialisée pour afficher un contact
- ✅ Indicateur visuel lu/non lu (icône enveloppe)
- ✅ Background bleu pour les messages non lus
- ✅ Badge pour les utilisateurs liés
- ✅ Aperçu du message (2 lignes max)

### 5. Composant Title (Mise à jour)

**Fichier:** `frontend/backoffice/src/components/Title.jsx`

- ✅ Ajout du support pour un badge (pour afficher le nombre de messages non lus)
- ⚠️ Badge retiré de la page Contacts au profit de la Sidebar

### 6. Contexte Contacts (Nouveau)

**Fichier:** `frontend/backoffice/src/contexts/ContactsContext.jsx`

- ✅ Création du contexte global pour gérer le nombre de messages non lus
- ✅ Provider avec `refreshUnreadCount()` pour mettre à jour le compteur
- ✅ Rafraîchissement automatique toutes les 30 secondes
- ✅ Hook `useContactsContext()` pour accéder au contexte

### 7. Layout Principal (Mise à jour)

**Fichier:** `frontend/backoffice/src/app/layout.js`

- ✅ Ajout du `ContactsProvider` pour rendre le contexte disponible globalement

### 8. Sidebar (Mise à jour)

**Fichier:** `frontend/backoffice/src/components/Sidebar.jsx`

- ✅ Intégration du badge de messages non lus sur l'item "Demandes"
- ✅ Badge rouge avec le nombre de messages non lus
- ✅ Mise à jour automatique via le contexte

### 9. Scène Contacts (Liste)

**Fichier:** `frontend/backoffice/src/scenes/Contacts.jsx`

- ✅ Remplacement complet du code (était un copié/collé de Payments)
- ✅ Utilisation des nouveaux composants Card
- ✅ Affichage de la liste des contacts
- ✅ Marquage automatique comme "lu" au clic avec envoi de requête API
- ✅ Rafraîchissement du compteur non lu dans la Sidebar après marquage
- ✅ Filtre: Tous / Non lus / Lus
- ✅ Bouton d'actualisation

### 10. Scène EditContact (Détail)

**Fichier:** `frontend/backoffice/src/scenes/EditContact.jsx`

- ✅ Nouveau composant pour afficher le détail d'un contact
- ✅ **BackButton intégré dans le Title** pour navigation vers la liste
- ✅ **Boutons de navigation Précédent/Suivant en bas du contenu**
- ✅ **Bouton Supprimer en rouge** (variant danger)
- ✅ Marquage automatique comme "lu" à l'ouverture avec envoi de requête API
- ✅ Rafraîchissement du compteur non lu dans la Sidebar
- ✅ Navigation intelligente : boutons désactivés si pas de contact précédent/suivant
- ✅ **Marquage automatique comme lu lors de la navigation** si contact non lu
- ✅ Bouton pour basculer lu/non lu manuellement
- ✅ Affichage de toutes les informations du contact
- ✅ Badge de statut (lu/non lu)
- ✅ Lien mailto pour l'email
- ✅ Affichage de l'utilisateur lié (si existant)

**Structure UI :**

```
[← Retour]
[Titre: Contact: John Doe]
[Marquer comme lu] [Supprimer (rouge)]
┌─────────────────────────┐
│ [Contenu du contact]    │
├─────────────────────────┤
│ [Précédent] [Suivant]   │
└─────────────────────────┘
```

### 11. Composant Utilities (Mise à jour)

**Fichier:** `frontend/backoffice/src/components/Utilities.jsx`

- ✅ Ajout du support de la propriété `disabled` pour les boutons d'action
- ✅ Ajout du support de la propriété `variant` (primary, secondary, danger, ghost)
- ✅ Permet de désactiver les boutons Précédent/Suivant quand nécessaire
- ✅ Permet d'afficher le bouton Supprimer en rouge (variant danger)

### 12. Composant BackButton (Nouveau)

**Fichier:** `frontend/backoffice/src/components/BackButton.jsx`

- ✅ Nouveau composant réutilisable pour le bouton "Retour"
- ✅ Navigation intelligente (URL spécifique ou router.back())
- ✅ Style minimaliste avec icône flèche
- ✅ Intégrable dans toutes les pages Edit

### 13. Composant NavigationButtons (Nouveau)

**Fichier:** `frontend/backoffice/src/components/NavigationButtons.jsx`

- ✅ Composant spécialisé pour Précédent/Suivant
- ✅ Boutons de largeur égale
- ✅ Icône chevron positionnée correctement (gauche pour Précédent, droite pour Suivant)
- ✅ État disabled géré automatiquement
- ✅ Positionné en bas du contenu avec bordure supérieure

### 14. Composant Title (Nouvelle mise à jour)

**Fichier:** `frontend/backoffice/src/components/Title.jsx`

- ✅ Support pour `showBackButton` et `backTo`
- ✅ Affiche le BackButton au-dessus du titre quand activé
- ✅ Réutilisable pour toutes les pages Edit

### 15. Page Contact Détail

**Fichier:** `frontend/backoffice/src/app/contacts/[id]/page.js`

- ✅ Création de la page pour la route dynamique `/contacts/[id]`

---

## 📝 Documentation

### Fichier créé

**Fichier:** `frontend/backoffice/CARD_COMPONENTS.md`

- ✅ Documentation complète des nouveaux composants
- ✅ Exemples d'utilisation
- ✅ Guide pour réutiliser ces composants sur d'autres pages

---

## 🎯 Fonctionnalités Implémentées

### ✅ Gestion des Contacts

1. **Liste des contacts** avec style moderne (cartes)
2. **Indicateur visuel** pour les messages non lus (icône + background bleu)
3. **Badge dans la Sidebar** affichant le nombre de messages non lus sur "Demandes"
4. **Rafraîchissement automatique** du compteur toutes les 30 secondes
5. **Filtre** : Tous / Non lus / Lus
6. **Marquage automatique comme lu** lors du clic avec envoi de requête API
7. **Page de détail** avec toutes les informations
8. **Navigation entre contacts** avec boutons Précédent/Suivant
9. **Marquage automatique lors de la navigation** si contact non lu
10. **Basculer le statut** lu/non lu manuellement
11. **Suppression** d'un contact
12. **Navigation** fluide entre liste et détail

### ✅ Composants Réutilisables

- `CardList` : Liste générique de cartes (réutilisable pour Users, Payments, etc.)
- `Card` : Carte cliquable générique avec chevron
- `ContactCard` : Carte spécialisée pour contacts
- `BackButton` : Bouton retour réutilisable (intégrable dans Title)
- `NavigationButtons` : Boutons Précédent/Suivant pour navigation entre items
- `ContactsContext` : Contexte global pour le compteur de messages non lus
- **Amélioration de Utilities** : Support des variants pour boutons colorés
- Possibilité de créer des cartes spécialisées (UserCard, PaymentCard, etc.)

---

## 🚀 Prochaines Étapes

### Pour tester :

1. **Démarrer l'API** : `npm run api`
2. **Démarrer le backoffice** : `npm run dev` (dans frontend/backoffice)
3. Naviguer vers `/contacts` dans le backoffice
4. Vérifier que les contacts s'affichent correctement
5. Cliquer sur un contact pour voir le détail
6. Tester les filtres et le marquage lu/non lu

### Pour appliquer ce style aux autres pages :

1. Créer des composants de cartes spécialisés (ex: `UserCard.jsx`, `PaymentCard.jsx`)
2. Remplacer les composants `ListPayments` et `ListUser` par `CardList` + carte spécialisée
3. Adapter les scènes `Payments.jsx` et `Users.jsx` pour utiliser le nouveau style

---

## ⚠️ Notes Importantes

- ✅ **Pas touché** à `ListPayments.jsx` ni `ListUser.jsx` comme demandé
- ✅ **Respect des conventions** du projet (hooks axiosClient, Heroicons, etc.)
- ✅ **Langue** : Logs et commentaires en anglais, textes utilisateur en français
- ✅ **Migration SQL** créée pour la colonne `is_read`

---

## 📋 Checklist Migration Base de Données

Avant de lancer l'API, s'assurer que :

- [ ] Docker est démarré
- [ ] La base de données PostgreSQL est accessible
- [ ] Flyway va automatiquement exécuter la migration V6

Si besoin de reset complet : `npm run api:reset`

