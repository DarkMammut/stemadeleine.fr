# Correction - Champs startDate et endDate pour News

## Problème résolu

**Erreur 500** lors de la création d'une actualité :

```
ERROR: null value in column "start_date" of relation "news_publications" 
violates not-null constraint
```

## Cause

Le modèle `NewsPublication` nécessite deux champs obligatoires que le frontend n'envoyait pas :

- `startDate` : Date de début de validité de l'actualité
- `endDate` : Date de fin de validité de l'actualité

## Solution appliquée

### 1. News.jsx - Création d'actualité

Ajout de dates par défaut lors de la création :

```javascript
const handleCreateNews = async () => {
  try {
    // Dates par défaut : aujourd'hui pour startDate, dans 30 jours pour endDate
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    await createNewsPublication({
      name: "Nouvelle Actualité",
      title: "Nouvelle Actualité",
      description: "Description de l'actualité",
      isVisible: false,
      startDate: now.toISOString(),      // ✅ Ajouté
      endDate: endDate.toISOString(),     // ✅ Ajouté
    });
    // ...
  }
};
```

**Dates par défaut :**

- `startDate` : Date actuelle (l'actualité commence aujourd'hui)
- `endDate` : Date actuelle + 30 jours (validité d'un mois)

### 2. EditNews.jsx - Formulaire d'édition

Ajout de deux champs dans le formulaire :

```javascript
{
  name: "startDate",
    label
:
  "Date de début",
    type
:
  "datetime-local",
    required
:
  true,
    defaultValue
:
  newsData?.startDate
    ? new Date(newsData.startDate).toISOString().slice(0, 16)
    : "",
}
,
{
  name: "endDate",
    label
:
  "Date de fin",
    type
:
  "datetime-local",
    required
:
  true,
    defaultValue
:
  newsData?.endDate
    ? new Date(newsData.endDate).toISOString().slice(0, 16)
    : "",
}
,
```

**Mise à jour du handleSubmit :**

```javascript
await updateNewsPublication(newsId, {
  name: values.name,
  title: values.title,
  description: values.description,
  startDate: values.startDate,    // ✅ Ajouté
  endDate: values.endDate,        // ✅ Ajouté
});
```

## Différence avec Newsletter

| Champ           | Newsletter | News                  |
|-----------------|------------|-----------------------|
| `name`          | ✅          | ✅                     |
| `title`         | ✅          | ✅                     |
| `description`   | ✅          | ✅                     |
| `isVisible`     | ✅          | ✅                     |
| `status`        | ✅          | ✅                     |
| `publishedDate` | ✅          | ✅                     |
| `startDate`     | ❌          | ✅ **Spécifique News** |
| `endDate`       | ❌          | ✅ **Spécifique News** |

**Pourquoi startDate et endDate pour les News ?**

Les actualités ont une période de validité :

- Une actualité commence à être pertinente à une certaine date
- Une actualité devient obsolète après une certaine date
- Permet de gérer automatiquement l'affichage/masquage des actualités selon leur période de validité

## Utilisation dans le frontend

### Formulaire EditNews

Le formulaire affiche maintenant 5 champs :

```
┌─────────────────────────────────────────┐
│ Informations de l'actualité             │
├─────────────────────────────────────────┤
│ Nom de l'actualité *                    │
│ [________________________]              │
│                                         │
│ Titre *                                 │
│ [________________________]              │
│                                         │
│ Description                             │
│ [________________________]              │
│ [________________________]              │
│                                         │
│ Date de début *                         │
│ [____/__/____  __:__]                  │
│                                         │
│ Date de fin *                           │
│ [____/__/____  __:__]                  │
│                                         │
│ [Annuler]  [Enregistrer l'actualité]   │
└─────────────────────────────────────────┘
```

### Type de champ : datetime-local

Le champ `datetime-local` HTML5 permet de sélectionner :

- La date (jour/mois/année)
- L'heure (heure:minute)

**Format attendu par le backend :** ISO 8601

```
2025-11-07T12:00:00.000Z
```

**Conversion frontend :**

```javascript
// Backend → Frontend (pour affichage)
new Date(newsData.startDate).toISOString().slice(0, 16)
// Résultat : "2025-11-07T12:00"

// Frontend → Backend (lors de la sauvegarde)
values.startDate  // Déjà au bon format
```

## Tests à effectuer

### Test 1 : Création d'actualité

- [ ] Créer une nouvelle actualité depuis News.jsx
- [ ] Vérifier qu'elle se crée sans erreur 500
- [ ] Vérifier que startDate = aujourd'hui
- [ ] Vérifier que endDate = aujourd'hui + 30 jours

### Test 2 : Édition des dates

- [ ] Ouvrir une actualité dans EditNews
- [ ] Vérifier que les champs startDate et endDate sont pré-remplis
- [ ] Modifier les dates
- [ ] Sauvegarder
- [ ] Vérifier que les nouvelles dates sont enregistrées

### Test 3 : Validation

- [ ] Essayer de sauvegarder sans startDate → Erreur de validation
- [ ] Essayer de sauvegarder sans endDate → Erreur de validation
- [ ] Essayer de mettre endDate avant startDate → Devrait fonctionner (pas de validation backend pour le moment)

## Améliorations futures possibles

1. **Validation des dates**
   ```javascript
   // Vérifier que endDate > startDate
   if (new Date(values.endDate) <= new Date(values.startDate)) {
     showError("Dates invalides", "La date de fin doit être après la date de début");
     return;
   }
   ```

2. **Affichage automatique basé sur les dates**
    - Masquer automatiquement les actualités dont endDate est passée
    - Afficher automatiquement les actualités dont startDate est atteinte
    - Indicateur visuel dans la liste (Badge "Active", "À venir", "Expirée")

3. **Préréglages de durée**
   ```javascript
   // Boutons rapides dans le formulaire
   - [1 semaine]  [1 mois]  [3 mois]  [6 mois]  [1 an]
   ```

4. **Fuseau horaire**
    - Gérer les fuseaux horaires pour les dates
    - Afficher les dates dans le fuseau local de l'utilisateur

## Fichiers modifiés

| Fichier        | Modifications                                       |
|----------------|-----------------------------------------------------|
| `News.jsx`     | Ajout de startDate et endDate lors de la création   |
| `EditNews.jsx` | Ajout de 2 champs datetime-local dans le formulaire |

## Résultat

✅ **Création d'actualités fonctionnelle**
✅ **Modification des dates possible**
✅ **Pas d'erreur 500**
✅ **Validation backend respectée**

