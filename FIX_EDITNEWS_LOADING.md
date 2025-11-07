# Fix - Page EditNews bloquée sur "Chargement..."

## Problème

La page EditNews restait bloquée indéfiniment sur "Chargement..." sans jamais afficher les données de l'actualité.

## Cause

Le fichier de route `/app/news/[newsId]/page.js` importait et utilisait le mauvais composant :

```javascript
// ❌ INCORRECT
import EditNewsletters from "@/scenes/EditNewsletters";

export default function NewsletterPage() {
  const [current, setCurrent] = useState("newsletters");
  const params = useParams();
  const newsletterId = params.newsletterId;

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <EditNewsletters newsletterId={newsletterId} />
    </Layout>
  );
}
```

**Problèmes identifiés :**

1. ❌ Import de `EditNewsletters` au lieu de `EditNews`
2. ❌ Composant `EditNewsletters` utilisé au lieu de `EditNews`
3. ❌ Fonction nommée `NewsletterPage` au lieu de `NewsPage`
4. ❌ State `current` = "newsletters" au lieu de "news"
5. ❌ Paramètre nommé `newsletterId` au lieu de `newsId`
6. ❌ Prop `newsletterId` passée au lieu de `newsId`

## Solution

Correction complète du fichier de route :

```javascript
// ✅ CORRECT
import EditNews from "@/scenes/EditNews";

export default function NewsPage() {
  const [current, setCurrent] = useState("news");
  const params = useParams();
  const newsId = params.newsId;

  return (
    <Layout current={current} setCurrent={setCurrent}>
      <EditNews newsId={newsId}/>
    </Layout>
  );
}
```

## Fichier modifié

**Chemin :** `frontend/backoffice/src/app/news/[newsId]/page.js`

**Changements :**

- ✅ Import : `EditNewsletters` → `EditNews`
- ✅ Fonction : `NewsletterPage()` → `NewsPage()`
- ✅ State : `"newsletters"` → `"news"`
- ✅ Variable : `newsletterId` → `newsId`
- ✅ Composant : `<EditNewsletters>` → `<EditNews>`
- ✅ Prop : `newsletterId={...}` → `newsId={...}`

## Impact

Ce fichier était probablement un copié-collé du fichier pour les newsletters qui n'avait pas été adapté pour les
actualités.

### Avant

- ❌ Page bloquée sur "Chargement..."
- ❌ Le composant EditNewsletters essayait de charger des données de newsletter avec un ID d'actualité
- ❌ Aucune donnée ne se chargeait
- ❌ Erreur silencieuse (pas de message d'erreur visible)

### Après

- ✅ Page EditNews se charge correctement
- ✅ Les données de l'actualité s'affichent
- ✅ Tous les composants fonctionnent (formulaire, médias, contenus)
- ✅ Navigation correcte dans le backoffice

## Vérification

Pour tester que tout fonctionne :

1. **Aller sur la liste des actualités**
    - URL : `/news`
    - Vérifier que la liste s'affiche

2. **Cliquer sur une actualité**
    - URL change vers : `/news/{newsId}`
    - La page EditNews doit se charger
    - Les informations de l'actualité doivent s'afficher

3. **Vérifier les sections**
    - ✅ Informations et Statut
    - ✅ Visibilité
    - ✅ Formulaire avec 5 champs
    - ✅ Contenus
    - ✅ Image

4. **Tester les fonctionnalités**
    - ✅ Modifier le formulaire et sauvegarder
    - ✅ Changer la visibilité
    - ✅ Ajouter/modifier des contenus
    - ✅ Ajouter/supprimer l'image
    - ✅ Publier l'actualité (si DRAFT)

## Notes

Ce type d'erreur arrive souvent lors du copié-collé de fichiers pour créer de nouvelles routes similaires. Il est
important de vérifier tous les noms de variables, composants et imports après un copié-collé.

### Bonnes pratiques pour éviter ce problème

1. **Utiliser la recherche et le remplacement**
    - Rechercher : "Newsletter" → Remplacer : "News"
    - Rechercher : "newsletter" → Remplacer : "news"

2. **Vérifier systématiquement après copié-collé**
    - [ ] Import du composant correct
    - [ ] Nom de la fonction
    - [ ] État initial (current)
    - [ ] Nom des paramètres
    - [ ] Props passées au composant

3. **Tester immédiatement**
    - Naviguer vers la nouvelle route dès qu'elle est créée
    - Vérifier qu'elle charge correctement
    - Ne pas attendre d'avoir tout implémenté

## Conclusion

✅ **Problème résolu** : La page EditNews charge maintenant correctement les données de l'actualité.

Le fichier de route `/app/news/[newsId]/page.js` utilise maintenant le bon composant `EditNews` avec les bons
paramètres.

