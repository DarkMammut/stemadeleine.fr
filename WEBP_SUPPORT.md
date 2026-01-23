# 🖼️ Support des formats d'images - WebP inclus

## ✅ Formats acceptés

Le système d'upload de médias accepte **TOUS les formats d'images standards**, y compris :

### Formats courants

- ✅ **PNG** (.png) - Recommandé pour les logos et illustrations avec transparence
- ✅ **JPEG/JPG** (.jpg, .jpeg) - Recommandé pour les photos
- ✅ **GIF** (.gif) - Animations et images simples
- ✅ **WebP** (.webp) - **Format moderne avec compression optimale** ⭐
- ✅ **SVG** (.svg) - Graphiques vectoriels (logos, icônes)
- ✅ **BMP** (.bmp) - Format bitmap (déconseillé, fichiers lourds)
- ✅ **TIFF** (.tiff, .tif) - Format haute qualité (fichiers lourds)

### Limite de taille

- **Maximum : 10 MB** par fichier
- Configuré dans `application.properties` : `spring.servlet.multipart.max-file-size=10MB`

## 🌟 Pourquoi WebP est recommandé ?

### Avantages du format WebP

1. **Compression supérieure** : 25-35% plus léger que JPEG/PNG à qualité égale
2. **Transparence** : Supporte l'alpha channel comme PNG
3. **Animation** : Peut remplacer les GIF avec une meilleure compression
4. **Support navigateur** : 95%+ des navigateurs modernes (2024+)

### Comparaison de taille (exemple)

- PNG : 1.2 MB
- JPEG : 450 KB
- **WebP : 280 KB** ⭐ (meilleure option)

### Outils de conversion

- **En ligne** : [Squoosh.app](https://squoosh.app/) (recommandé)
- **CLI** : `cwebp input.jpg -o output.webp`
- **Photoshop** : Plugin WebP
- **GIMP** : Support natif depuis v2.10

## 🔧 Configuration technique

### Frontend - Accept tous les formats

```javascript
// MediaManager.jsx, MediaEditor.jsx, MediaSelector.jsx
<input type="file" accept="image/*"/>
```

L'attribut `accept="image/*"` accepte automatiquement :

- Tous les types MIME commençant par `image/`
- Donc : `image/webp`, `image/png`, `image/jpeg`, `image/svg+xml`, etc.

### Backend - Pas de validation stricte

```java
// MediaService.java
public Media uploadMedia(MultipartFile file, String title, String altText) {
    // Accepte n'importe quel Content-Type
    // Stocke le type MIME tel quel : file.getContentType()
    media.setFileType(file.getContentType());
    // ...
}
```

**Note** : Le backend ne valide PAS le type de fichier. Il fait confiance au navigateur et stocke le type MIME envoyé.

## 📝 Recommandations d'utilisation

### Pour les photos

1. **WebP** (meilleur choix)
    - Taille réduite
    - Qualité excellente
    - `image/webp`

2. **JPEG** (alternative)
    - Largement supporté
    - Bon pour les photos
    - `image/jpeg`

### Pour les logos et illustrations

1. **SVG** (meilleur choix si vectoriel)
    - Taille ultra-réduite
    - Scalable à l'infini
    - `image/svg+xml`

2. **WebP** avec transparence (alternative)
    - Plus léger que PNG
    - Transparence supportée
    - `image/webp`

3. **PNG** (fallback)
    - Transparence alpha
    - Qualité maximale
    - `image/png`

### Pour les animations

1. **WebP animé** (meilleur choix)
    - 60-80% plus léger que GIF
    - Meilleure qualité
    - `image/webp`

2. **GIF** (fallback)
    - Supporté partout
    - Fichiers plus lourds
    - `image/gif`

## 🧪 Tests

### Test manuel

1. Télécharger une image WebP depuis [unsplash.com](https://unsplash.com) ou créer avec [Squoosh](https://squoosh.app)
2. Ouvrir le backoffice : https://dashboard.stemadeleine.fr
3. Aller dans Médias > Ajouter un média
4. Drag & drop le fichier `.webp`
5. ✅ Vérifier que l'upload fonctionne
6. ✅ Vérifier que l'image s'affiche correctement dans la bibliothèque

### Types MIME détectés automatiquement

Le navigateur envoie automatiquement le bon Content-Type :

- `.webp` → `image/webp`
- `.png` → `image/png`
- `.jpg` → `image/jpeg`
- `.gif` → `image/gif`
- `.svg` → `image/svg+xml`

## 🔒 Sécurité

### Validation côté serveur (future amélioration)

Actuellement, aucune validation stricte n'est faite. Pour améliorer la sécurité :

```java
// TODO: Ajouter validation des types MIME autorisés
private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
        "image/jpeg", "image/png", "image/gif",
        "image/webp", "image/svg+xml"
);

public Media uploadMedia(MultipartFile file, ...) {
    if (!ALLOWED_MIME_TYPES.contains(file.getContentType())) {
        throw new IllegalArgumentException("Format de fichier non supporté");
    }
    // ...
}
```

### Scan antivirus (production)

En production, considérer :

- Scan antivirus sur les fichiers uploadés
- Vérification du contenu réel vs extension
- Limitation des dimensions (pixels)
- Re-encodage des images pour éviter les payloads malveillants

## 📚 Références

- [WebP - Developers Google](https://developers.google.com/speed/webp)
- [Can I Use - WebP](https://caniuse.com/webp) - 96% de support navigateur
- [MDN - Image file types](https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types)
- [Spring Boot - File Upload](https://spring.io/guides/gs/uploading-files/)

## 📊 Support navigateur WebP

| Navigateur     | Version minimum | Support |
|----------------|-----------------|---------|
| Chrome         | 23+ (2012)      | ✅       |
| Firefox        | 65+ (2019)      | ✅       |
| Safari         | 14+ (2020)      | ✅       |
| Edge           | 18+ (2018)      | ✅       |
| Opera          | 12.1+ (2012)    | ✅       |
| Mobile Safari  | 14+ (2020)      | ✅       |
| Chrome Android | Toutes          | ✅       |

**Conclusion** : WebP est parfaitement supporté et **fortement recommandé** pour tous les nouveaux uploads ! 🎉

---
**Date** : 23 janvier 2026  
**Status** : ✅ WebP supporté nativement
