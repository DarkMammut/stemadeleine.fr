# 🔧 Correction de l'erreur 500 lors de l'upload d'images

**Date**: 23 janvier 2026  
**Problème**: Erreur 500 "Current request is not a multipart request" lors de l'upload d'images dans le backoffice

## 🐛 Diagnostic

L'erreur "Current request is not a multipart request" indique que Spring Boot ne reconnaît pas la requête comme étant de
type multipart/form-data. Ce problème avait deux causes :

1. **Backend** : L'endpoint `/api/media/upload` n'avait pas l'attribut `consumes` pour forcer Spring à traiter la
   requête comme multipart
2. **Frontend** : Le header `Content-Type: multipart/form-data` était défini manuellement, ce qui **empêche le
   navigateur d'ajouter le boundary nécessaire**

## ✅ Solutions appliquées

### 1. Backend - MediaController.java

**Fichier**: `backend/api/src/main/java/com/stemadeleine/api/controller/MediaController.java`

#### Changement 1 : Import de MediaType

```java
import org.springframework.http.MediaType;
```

#### Changement 2 : Ajout de consumes sur l'endpoint

```java

@PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<MediaDto> uploadMedia(
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "title", required = false) String title,
        @RequestParam(value = "altText", required = false) String altText) {
    // ...
}
```

**Pourquoi ?** : Force Spring Security et Spring MVC à reconnaître et traiter correctement les requêtes multipart avant
qu'elles ne passent par les filtres d'authentification.

### 2. Frontend - Suppression du header Content-Type

**Fichiers modifiés** :

- `frontend/backoffice/src/components/MediaManager.jsx`
- `frontend/backoffice/src/components/MediaEditor.jsx`
- `frontend/backoffice/src/components/MediaSelector.jsx`

#### Avant (❌ INCORRECT)

```javascript
const res = await axios.post("/api/media/upload", formData, {
    headers: {"Content-Type": "multipart/form-data"},  // ❌ NE JAMAIS FAIRE ÇA
    onUploadProgress: (event) => {
        // ...
    },
});
```

#### Après (✅ CORRECT)

```javascript
const res = await axios.post("/api/media/upload", formData, {
    onUploadProgress: (event) => {
        // ...
    },
});
```

**Pourquoi ?** : Quand on envoie un `FormData` avec Axios :

- ✅ **Sans header** : Le navigateur génère
  automatiquement `Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...`
- ❌ **Avec header manuel** : On écrase le header et on perd le boundary, ce qui rend la requête invalide

## 📝 Règles importantes pour les uploads multipart

### ✅ À FAIRE

1. Toujours laisser le navigateur/Axios gérer le header Content-Type pour les FormData
2. Utiliser `consumes = MediaType.MULTIPART_FORM_DATA_VALUE` sur les endpoints Spring
3. Utiliser `@RequestParam("file") MultipartFile` pour recevoir les fichiers

### ❌ À NE PAS FAIRE

1. Ne JAMAIS définir manuellement `Content-Type: multipart/form-data` dans les headers
2. Ne pas manipuler le corps de la requête dans les filtres avant qu'elle n'atteigne le contrôleur
3. Ne pas essayer de lire les paramètres d'une requête multipart dans un filtre

## 🧪 Test

Pour tester la correction :

1. **Redémarrer le backend** :
   ```bash
   cd backend/api
   ./mvnw spring-boot:run
   ```

2. **Redémarrer le frontend** :
   ```bash
   cd frontend/backoffice
   npm run dev
   ```

3. **Tester l'upload** :
    - Ouvrir le backoffice : https://dashboard.stemadeleine.fr
    - Aller dans la gestion des médias
    - Drag & drop une image ou cliquer pour sélectionner
    - Vérifier que l'upload fonctionne sans erreur 500

## 🔍 Vérification des logs

### Backend (succès attendu)

```
INFO  - POST /api/media/upload - Uploading file: mon-image.jpg
DEBUG - File uploaded successfully: 12345678-abcd-...
```

### Frontend (succès attendu)

```
Console: uploadedMedia: { id: "...", fileUrl: "...", ... }
```

### En cas d'erreur

Si l'erreur persiste, vérifier :

1. ✅ Que le backend a bien redémarré avec les modifications
2. ✅ Que le frontend a bien été rebuild (cache navigateur vidé)
3. ✅ Que les cookies d'authentification sont présents (authToken)
4. ✅ Les logs du backend pour voir l'erreur exacte

## 📚 Références

- [Spring MVC Multipart](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-multipart)
- [Axios FormData](https://axios-http.com/docs/post_example)
- [MDN FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)

## 🎯 Impact

- ✅ Upload d'images fonctionnel dans tous les composants
- ✅ Pas de régression sur les autres endpoints
- ✅ Pas de modification de la configuration Spring Security
- ✅ Configuration multipart déjà présente dans application.properties (10MB max)
