# Système de Versioning des Newsletters - Explication

## Question initiale

> "Si on crée une nouvelle version de la newsletter, le contenu sera-t-il toujours attaché ?"

## Réponse : OUI ✅ (après correction)

## Problème identifié

Avant la correction, les contenus étaient liés à l'**ID de la NewsletterPublication** (qui change à chaque version) au
lieu du **newsletterId** (qui reste constant).

### Ancien système ❌

```java
// Création de contenu - INCORRECT
Content content = contentService.createContent(
        title,
        defaultBody,
        newsletter.getId(),  // ❌ ID de la publication (change à chaque version)
        currentUser
);

// Récupération - INCORRECT
List<Content> contents = contentService.getLatestContentsByOwner(
        newsletter.getId()  // ❌ Ne retrouve que les contenus de cette version
);
```

**Problème** : Si on crée NewsletterPublication v2, elle aura un nouvel `id`, donc :

- Les contenus créés pour v1 (avec `ownerId = id_v1`) ne seront pas visibles
- Il faudrait recréer tous les contenus pour chaque version ❌

---

## Solution implémentée ✅

Les contenus sont maintenant liés au **newsletterId** qui reste constant entre toutes les versions.

### Nouveau système ✅

```java
// Création de contenu - CORRECT
Content content = contentService.createContent(
        title,
        defaultBody,
        newsletter.getNewsletterId(),  // ✅ ID du module (constant)
        currentUser
);

// Récupération - CORRECT
List<Content> contents = contentService.getLatestContentsByOwner(
        newsletter.getNewsletterId()  // ✅ Retrouve tous les contenus du module
);
```

**Avantage** : Toutes les versions de la newsletter partagent les mêmes contenus ✅

---

## Architecture des données

### NewsletterPublication

```java

@Entity
@Table(name = "newsletter_publications")
public class NewsletterPublication {
    @Id
    private UUID id;  // Change à chaque version

    @Column(name = "newsletter_id", unique = true)
    private UUID newsletterId;  // ✅ CONSTANT - ID du module

    private String name;
    private String title;
    private String description;
    private PublishingStatus status;
    private OffsetDateTime publishedDate;

    @ManyToOne
    private Media media;

    @ManyToOne
    private User author;

    // Note: Les contenus sont liés via Content.ownerId = this.newsletterId
}
```

### Content

```java

@Entity
@Table(name = "contents")
public class Content {
    @Id
    private UUID id;  // ID unique de cette version de contenu

    private UUID contentId;  // ID logique du contenu (constant entre versions)

    private UUID ownerId;  // ✅ = newsletterId (constant)

    private Integer version;
    private String title;
    private JsonNode body;
    private Boolean isVisible;

    @ManyToMany
    private List<Media> medias;
}
```

---

## Scénario d'utilisation

### Création initiale

1. **Créer NewsletterPublication v1**
   ```
   id: 1234-5678-...
   newsletterId: abcd-efgh-...  ← CONSTANT
   title: "Newsletter Mars 2025"
   status: DRAFT
   ```

2. **Ajouter des contenus**
   ```
   Content 1:
     contentId: content-1
     ownerId: abcd-efgh-...  ← newsletterId
     title: "Introduction"
     
   Content 2:
     contentId: content-2
     ownerId: abcd-efgh-...  ← newsletterId
     title: "Article principal"
   ```

3. **Publier**
   ```
   status: PUBLISHED
   publishedDate: 2025-03-01
   ```

### Nouvelle version (correction après publication)

4. **Créer NewsletterPublication v2**
   ```
   id: 9999-8888-...  ← NOUVEAU
   newsletterId: abcd-efgh-...  ← MÊME QUE V1 ✅
   title: "Newsletter Mars 2025 (corrigée)"
   status: DRAFT
   ```

5. **Les contenus sont automatiquement disponibles !**
   ```
   GET /api/newsletter-publication/9999-8888-.../contents
   
   Retourne:
   - Content 1 (ownerId = abcd-efgh-...)  ✅
   - Content 2 (ownerId = abcd-efgh-...)  ✅
   ```

6. **Modifier un contenu** (crée une nouvelle version du contenu)
   ```
   Content 1 v2:
     id: nouveau-id
     contentId: content-1  ← même contentId
     ownerId: abcd-efgh-...  ← même ownerId
     version: 2  ← version incrémentée
     title: "Introduction (corrigée)"
   ```

7. **Publier la v2**
   ```
   status: PUBLISHED
   publishedDate: 2025-03-02
   ```

---

## Modifications apportées

### 1. NewsletterPublicationController.java

#### Création de contenu

```java
// Avant
Content content = contentService.createContent(title, defaultBody, newsletter.getId(), currentUser);

// Après
Content content = contentService.createContent(title, defaultBody, newsletter.getNewsletterId(), currentUser);
```

#### Récupération des contenus

```java
// Avant
List<Content> contents = contentService.getLatestContentsByOwner(newsletter.getId());

// Après
List<Content> contents = contentService.getLatestContentsByOwner(newsletter.getNewsletterId());
```

### 2. NewsletterPublication.java

**Supprimé** : La relation `@ManyToMany` avec Content

```java
// ❌ Supprimé car redondant et source de confusion
@ManyToMany
@JoinTable(name = "newsletter_content", ...)
private List<Content> contents;
```

**Ajouté** : Commentaire explicatif

```java
// Note: Contents are linked via Content.ownerId = this.newsletterId
// This allows contents to be shared across all versions of the same newsletter
// Use ContentService.getLatestContentsByOwner(newsletterId) to retrieve them
```

### 3. NewsletterPublicationMapper.java

```java
// Avant
.contents(publication.getContents() !=null?...:null)

// Après
var contents = contentService.getLatestContentsByOwner(publication.getNewsletterId());
.

contents(contents.stream().

map(contentMapper::toDto).

collect(Collectors.toList()))
```

---

## Avantages du nouveau système

| Aspect                   | Avant ❌                                      | Après ✅                                     |
|--------------------------|----------------------------------------------|---------------------------------------------|
| **Versioning**           | Contenus perdus à chaque nouvelle version    | Contenus partagés entre toutes les versions |
| **Cohérence**            | Relation ManyToMany inutile                  | Lien via ownerId (comme sections/modules)   |
| **Simplicité**           | 2 systèmes différents (ManyToMany + ownerId) | 1 seul système unifié (ownerId)             |
| **Migration de données** | Table `newsletter_content` à maintenir       | Pas de table de jointure nécessaire         |
| **Réutilisation**        | Impossible de réutiliser des contenus        | Contenus partagés automatiquement           |

---

## Migration des données existantes

Si vous avez déjà des newsletters en production avec l'ancien système :

```sql
-- 1. Vérifier les contenus existants
SELECT c.id, c.owner_id, np.id as publication_id, np.newsletter_id
FROM contents c
         JOIN newsletter_publications np ON c.owner_id = np.id;

-- 2. Migrer les ownerId pour pointer vers newsletterId
UPDATE contents c
SET owner_id = np.newsletter_id FROM newsletter_publications np
WHERE c.owner_id = np.id;

-- 3. Supprimer la table de jointure (si elle existe)
DROP TABLE IF EXISTS newsletter_content;
```

---

## Conclusion

✅ **OUI**, avec le nouveau système, les contenus restent attachés lorsqu'on crée une nouvelle version de la newsletter
car ils sont liés au `newsletterId` (constant) et non à l'`id` de la publication (variable).

Le système est maintenant cohérent avec le versioning des contenus (via `contentId` + `version`) et permet de :

- Créer plusieurs versions d'une newsletter
- Partager les contenus entre ces versions
- Modifier les contenus (crée de nouvelles versions de contenus)
- Publier plusieurs fois la même newsletter avec des corrections

