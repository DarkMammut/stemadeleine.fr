# Site Principal - Stemadeleine.fr

Site web public de la paroisse Sainte-Madeleine de la Jarrie, développé avec Next.js 15.

---

## 🚀 Démarrage

```bash
npm install
npm run dev
```

**URL** : http://localhost:3000

---

## 📚 Documentation Complète

Pour la documentation complète, consultez :

**[../../STEMADELEINE.md](../../STEMADELEINE.md)** - Guide complet du site principal

---

## 🎨 Fonctionnalités

- ✅ Page d'accueil avec présentation de l'association
- ✅ Actualités de la paroisse
- ✅ Formulaire de contact (protégé reCAPTCHA v2)
- ✅ Formulaire d'adhésion
- ✅ Dons en ligne (HelloAsso)
- ✅ Design responsive avec Tailwind CSS

---

## 🔐 Configuration reCAPTCHA

Variables d'environnement (`.env.local`) :

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=votre_clé_publique_recaptcha
```

---

## 🚀 Production

**URL** : https://stemadeleine.fr

Variables d'environnement sur Vercel :

```
NEXT_PUBLIC_BACKEND_URL=https://stemadeleine-api.onrender.com
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=votre_clé_publique
```

---

## 📦 Build

```bash
npm run build
npm run start
```

---

**✅ Pour plus de détails, consultez [STEMADELEINE.md](../../STEMADELEINE.md)**
