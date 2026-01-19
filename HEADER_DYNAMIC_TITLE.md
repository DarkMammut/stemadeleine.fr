# ✨ Header - Nom de l'organisation dynamique et cliquable

## 🎯 Modifications effectuées

Le Header du backoffice affiche maintenant le nom de l'organisation de manière dynamique et est cliquable pour revenir à
la page d'accueil.

---

## 🔧 Changements apportés

### 1. Récupération du nom de l'organisation

**État ajouté** :

```javascript
const [organizationName, setOrganizationName] = useState("Les Amis de Sainte Madeleine de la Jarrie");
```

**useEffect pour charger le nom** :

```javascript
useEffect(() => {
    const fetchOrganizationName = async () => {
        try {
            const res = await fetch('/api/public/organization/info');
            if (res.ok) {
                const data = await res.json();
                if (data.name) {
                    setOrganizationName(data.name);
                }
            }
        } catch (error) {
            console.error('Failed to fetch organization name:', error);
        }
    };
    fetchOrganizationName();
}, []);
```

### 2. Titre cliquable (Desktop)

**Avant ❌** :

```javascript
<div className="hidden md:flex">
    <div className="text-white font-semibold">
        <span className="block">Les Amis de Sainte</span>
        <span className="block">Madeleine de la Jarrie</span>
    </div>
</div>
```

**Après ✅** :

```javascript
<button
    onClick={() => router.push("/")}
    className="hidden md:flex shrink-0 mr-4 hover:opacity-80 transition-opacity cursor-pointer"
    aria-label="Retour à l'accueil"
>
    <div
        className="text-white font-semibold leading-tight text-xs md:text-sm lg:text-base max-w-[20vw] lg:max-w-none">
    <span className="line-clamp-2 lg:line-clamp-1">
      {organizationName}
    </span>
    </div>
</button>
```

### 3. Menu mobile cliquable

**Avant ❌** :

```javascript
<Dialog.Title>
    <span className="block">Les Amis de Sainte</span>
    <span className="block">Madeleine de la Jarrie</span>
</Dialog.Title>
```

**Après ✅** :

```javascript
<button
    onClick={() => {
        router.push("/");
        setMobileOpen(false);
    }}
    className="hover:opacity-80 transition-opacity cursor-pointer"
    aria-label="Retour à l'accueil"
>
    <Dialog.Title className="text-white font-semibold leading-tight text-sm line-clamp-2">
        {organizationName}
    </Dialog.Title>
</button>
```

---

## 🎨 Gestion responsive

### Taille du texte

- **Petit écran (md)** : `text-xs md:text-sm` (12px → 14px)
- **Écran moyen** : `md:text-sm` (14px)
- **Grand écran (lg)** : `lg:text-base` (16px)

### Largeur et retour à la ligne

- **Écran moyen (md)** : `max-w-[20vw]` (1/5 de l'écran) + `line-clamp-2` (max 2 lignes)
- **Grand écran (lg)** : `lg:max-w-none` (pas de limite) + `lg:line-clamp-1` (1 seule ligne)

### Comportement

```
┌─────────────────────────────────────────┐
│  Petit écran (< md)                     │
│  → Titre caché (masqué par le burger)  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Écran moyen (md)                       │
│  → Max 1/5 de l'écran de largeur        │
│  → Max 2 lignes                         │
│  → text-sm (14px)                       │
│                                         │
│  Exemple si nom long :                  │
│  Les Amis de Sainte                     │
│  Madeleine de la Jarrie                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Grand écran (lg)                       │
│  → Pas de limite de largeur             │
│  → 1 seule ligne                        │
│  → text-base (16px)                     │
│                                         │
│  Les Amis de Sainte Madeleine de la...  │
└─────────────────────────────────────────┘
```

---

## ✨ Fonctionnalités

### 1. Nom dynamique

- ✅ Le nom est récupéré depuis l'API `/api/public/organization/info`
- ✅ Fallback vers "Les Amis de Sainte Madeleine de la Jarrie" si l'API échoue
- ✅ Mis à jour automatiquement quand modifié dans Organization.jsx

### 2. Cliquable

- ✅ **Desktop** : Clic sur le titre → redirige vers `/`
- ✅ **Mobile** : Clic sur le titre → redirige vers `/` et ferme le menu

### 3. Effet visuel

- ✅ Hover : `hover:opacity-80` (effet de transparence)
- ✅ Transition fluide : `transition-opacity`
- ✅ Curseur pointeur : `cursor-pointer`

### 4. Accessibilité

- ✅ `aria-label="Retour à l'accueil"`
- ✅ Bouton sémantique (`<button>`)
- ✅ Focus visible

---

## 🧪 Tests

### Test 1 : Nom par défaut

```
1. Ouvrir le backoffice
2. Vérifier que le header affiche le nom par défaut
3. ✅ "Les Amis de Sainte Madeleine de la Jarrie"
```

### Test 2 : Nom personnalisé

```
1. Aller dans Settings → Organization
2. Changer le nom de l'organisation
3. Sauvegarder
4. Rafraîchir la page
5. ✅ Le nouveau nom s'affiche dans le header
```

### Test 3 : Responsive

```
# Écran moyen (md)
1. Réduire la fenêtre à ~768px
2. ✅ Titre visible avec max 2 lignes
3. ✅ Largeur limitée à 1/5 de l'écran

# Grand écran (lg)
1. Agrandir la fenêtre à >1024px
2. ✅ Titre sur une seule ligne
3. ✅ Pas de limite de largeur
```

### Test 4 : Cliquable

```
# Desktop
1. Cliquer sur le titre
2. ✅ Redirige vers /

# Mobile
1. Ouvrir le menu burger
2. Cliquer sur le titre
3. ✅ Redirige vers / et ferme le menu
```

### Test 5 : Effet hover

```
1. Survoler le titre
2. ✅ Opacité réduite (80%)
3. ✅ Transition fluide
4. ✅ Curseur pointeur
```

---

## 📝 Fichier modifié

`frontend/backoffice/src/components/ui/Header.jsx`

---

## 🎯 Résultat

**Le header affiche maintenant :**

- ✅ Le nom de l'organisation (dynamique)
- ✅ Responsive (taille et nombre de lignes adaptatifs)
- ✅ Cliquable (redirection vers `/`)
- ✅ Effet hover élégant
- ✅ Accessible

**Éditable depuis :**

- Settings → Organization → Nom de l'organisation

---

**Parfait pour votre backoffice !** ✨
