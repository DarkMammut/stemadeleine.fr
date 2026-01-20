# 🌐 Site Principal - Guide Complet

Site web public pour la paroisse Sainte-Madeleine de la Jarrie, développé avec Next.js.

---

## 🚀 Démarrage

### Installation

```bash
cd frontend/stemadeleine
npm install
```

### Développement

```bash
npm run dev
```

Accès : http://localhost:3000

### Build de Production

```bash
npm run build
npm run start
```

---

## 🏗️ Architecture

### Structure des Dossiers

```
frontend/stemadeleine/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── page.tsx            # Page d'accueil
│   │   ├── actualites/         # Page des actualités
│   │   ├── contact/            # Formulaire de contact
│   │   ├── adhesion/           # Formulaire d'adhésion
│   │   └── ...                 # Autres pages
│   ├── components/             # Composants réutilisables
│   ├── utils/                  # Utilitaires
│   └── styles/                 # Styles globaux
└── public/                     # Fichiers statiques
```

### Technologies

- **Framework** : Next.js 15 (App Router)
- **UI** : React 18, Tailwind CSS
- **Icônes** : Heroicons
- **HTTP** : Axios
- **Protection** : Google reCAPTCHA v2

---

## 🎨 Fonctionnalités Principales

### 1. Page d'Accueil

- Hero section avec image
- Présentation de l'association
- Actualités récentes
- Appel à l'action (adhésion, don)

### 2. Actualités

- Liste des actualités publiées
- Filtrage par catégorie
- Pagination
- Vue détaillée d'une actualité

### 3. Formulaire de Contact

Formulaire protégé par reCAPTCHA pour éviter le spam.

#### Champs du formulaire

```typescript
interface ContactForm {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    recaptchaToken: string;
}
```

#### Validation reCAPTCHA

```javascript
import ReCAPTCHA from 'react-google-recaptcha';

const [recaptchaToken, setRecaptchaToken] = useState(null);

<ReCAPTCHA
    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
    onChange={(token) => setRecaptchaToken(token)}
/>
```

### 4. Formulaire d'Adhésion

- Informations personnelles
- Type d'adhésion (individuel, couple, famille)
- Montant de l'adhésion
- Redirection vers HelloAsso pour le paiement

### 5. Dons

- Formulaire de don ponctuel ou récurrent
- Intégration HelloAsso
- Suivi des dons

---

## 🔐 Configuration reCAPTCHA

### 1. Créer un Site reCAPTCHA

1. Allez sur https://www.google.com/recaptcha/admin
2. Créez un nouveau site :
    - **Label** : stemadeleine.fr - Contact Form
    - **Type** : reCAPTCHA v2 ("Je ne suis pas un robot")
    - **Domaines** : `localhost`, `stemadeleine.fr`
3. Récupérez les clés :
    - **Clé du site** (Site Key) : pour le frontend
    - **Clé secrète** (Secret Key) : pour le backend

### 2. Configuration Frontend

Créez un fichier `.env.local` :

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3. Installation

```bash
npm install react-google-recaptcha
```

### 4. Utilisation

```javascript
import ReCAPTCHA from 'react-google-recaptcha';

function ContactForm() {
    const [token, setToken] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            alert('Veuillez valider le reCAPTCHA');
            return;
        }

        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                ...formData,
                recaptchaToken: token
            })
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Champs du formulaire */}

            <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                onChange={setToken}
            />

            <button disabled={!token}>Envoyer</button>
        </form>
    );
}
```

---

## 🌐 Configuration

### Variables d'Environnement

#### Développement Local (`.env.local`)

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=votre_clé_publique_recaptcha
```

#### Production (Vercel)

```bash
NEXT_PUBLIC_BACKEND_URL=https://stemadeleine-api.onrender.com
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=votre_clé_publique_recaptcha
```

---

## 🎨 Composants Personnalisés

### Header Dynamique

Le header affiche le titre de la page courante.

```typescript
// app/actualites/page.tsx
export const metadata = {
    title: 'Actualités - Sainte-Madeleine'
};
```

### Footer

Footer avec liens utiles, mentions légales et informations de contact.

### Layout

Layout principal avec header et footer automatiquement appliqués à toutes les pages.

---

## 🔌 Intégration Backend

### Client Axios

Configuration centralisée dans `utils/axiosClient.js` :

```javascript
import axios from 'axios';

const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosClient;
```

### Exemples d'Appels API

#### Récupérer les Actualités

```javascript
import axiosClient from '@/utils/axiosClient';

const getNews = async () => {
    try {
        const response = await axiosClient.get('/api/public/news');
        return response.data;
    } catch (error) {
        console.error('Erreur:', error);
        throw error;
    }
};
```

#### Envoyer un Message de Contact

```javascript
const sendContact = async (formData) => {
  try {
    const response = await axiosClient.post('/api/public/contact', {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message,
      recaptchaToken: formData.recaptchaToken
    });
    return response.data;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};
```

---

## 📱 Responsive Design

Le site est entièrement responsive avec Tailwind CSS :

```javascript
// Mobile-first approach
<div className="
  w-full           // Mobile
  md:w-1/2         // Tablette
  lg:w-1/3         // Desktop
">
  Contenu
</div>
```

### Breakpoints Tailwind

- `sm` : 640px
- `md` : 768px
- `lg` : 1024px
- `xl` : 1280px
- `2xl` : 1536px

---

## 🎯 SEO et Performance

### Métadonnées

Définissez les métadonnées dans chaque page :

```typescript
// app/actualites/page.tsx
export const metadata = {
  title: 'Actualités - Sainte-Madeleine',
  description: 'Découvrez les dernières actualités de la paroisse',
  keywords: 'actualités, paroisse, église'
};
```

### Images Optimisées

Utilisez le composant `Image` de Next.js :

```javascript
import Image from 'next/image';

<Image
    src="/images/hero.jpg"
    alt="Description"
    width={800}
    height={600}
    priority // Pour les images above-the-fold
/>
```

### Lazy Loading

Les images et composants lourds sont automatiquement lazy-loadés par Next.js.

---

## 🐛 Débogage

### Vérifier les Variables d'Environnement

```javascript
console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
console.log('reCAPTCHA Key:', process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);
```

### Tester le Backend

Dans la console du navigateur :

```javascript
fetch('https://stemadeleine-api.onrender.com/api/public/health')
    .then(r => r.json())
    .then(console.log)
    .catch(console.error);
```

### Erreurs CORS

Si vous rencontrez des erreurs CORS :

1. Vérifiez que le backend autorise votre domaine dans `CORS_ALLOWED_ORIGINS`
2. Vérifiez que `NEXT_PUBLIC_BACKEND_URL` est correct
3. Vérifiez les logs du backend sur Render

---

## 🚀 Déploiement sur Vercel

### 1. Connecter le Repository

1. Allez sur https://vercel.com
2. Cliquez sur "New Project"
3. Importez votre repository GitHub
4. Sélectionnez le dossier `frontend/stemadeleine`

### 2. Configuration

**Root Directory** : `frontend/stemadeleine`  
**Framework Preset** : Next.js  
**Build Command** : `npm run build`  
**Output Directory** : `.next`

### 3. Variables d'Environnement

Ajoutez dans Vercel > Project Settings > Environment Variables :

```
NEXT_PUBLIC_BACKEND_URL=https://stemadeleine-api.onrender.com
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=votre_clé_publique
```

### 4. Domaine Personnalisé

1. Dans Project Settings > Domains
2. Ajoutez `stemadeleine.fr`
3. Configurez les DNS selon les instructions Vercel
4. Attendez la propagation DNS (quelques minutes à 48h)

### 5. SSL/TLS

Vercel active automatiquement le SSL avec Let's Encrypt.

---

## 🔄 Mise à Jour

Pour déployer des modifications :

```bash
git add .
git commit -m "feat: description des modifications"
git push origin main
```

Vercel redéploie automatiquement à chaque push sur `main`.

---

## 📚 Documentation Complémentaire

- **[DEPLOYMENT.md](../../DEPLOYMENT.md)** - Guide de déploiement complet
- **[BACKOFFICE.md](../../BACKOFFICE.md)** - Guide du backoffice
- **[API.md](../../API.md)** - Guide de l'API backend

---

## 🎨 Personnalisation

### Couleurs

Les couleurs sont définies dans `tailwind.config.js` :

```javascript
module.exports = {
    theme: {
        extend: {
            colors: {
                primary: '#1976d2',
                secondary: '#dc004e',
                // Ajoutez vos couleurs personnalisées
            }
        }
    }
}
```

### Polices

Utilisez le système de polices Next.js :

```javascript
import {Inter} from 'next/font/google';

const inter = Inter({subsets: ['latin']});

export default function RootLayout({children}) {
    return (
        <html lang="fr" className={inter.className}>
        <body>{children}</body>
        </html>
    );
}
```

---

**✅ Site principal prêt pour la production !**
