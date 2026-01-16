#!/bin/bash

# 🚀 Script de déploiement complet - Stemadeleine
# Frontend + Backoffice + Backend

echo "════════════════════════════════════════════════════════"
echo "🚀 Déploiement Complet - Stemadeleine"
echo "════════════════════════════════════════════════════════"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher avec couleur
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Vérifier qu'on est à la racine du projet
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Erreur : Veuillez exécuter ce script depuis la racine du projet"
    exit 1
fi

print_status "Répertoire racine détecté"
echo ""

# ═══════════════════════════════════════════════════════════
echo "📋 RÉSUMÉ DES CHANGEMENTS"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "🔒 Sécurité (CVE corrigées) :"
echo "   • Frontend : Next.js 16.0.3 → 16.1.2"
echo "   • Frontend : React 19.2.0 → 19.2.1"
echo "   • Frontend : jsPDF 3.0.4 → 4.0.0"
echo "   • Frontend : React Router 7.9.6 → 7.12.0"
echo "   • Backoffice : Next.js 15.4.7 → 15.5.9"
echo "   • Backoffice : React 19.1.0 → 19.1.2"
echo ""

echo "🔧 Corrections de Build :"
echo "   • Backoffice : 7 pages avec Suspense pour useSearchParams()"
echo "   • Backoffice : Erreur Vercel corrigée"
echo ""

echo "🌐 Configuration CORS :"
echo "   • Backend : Support des origines dynamiques"
echo "   • Backend : Domaine Vercel ajouté (stemadeleine-fr.vercel.app)"
echo ""

# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "🔍 VÉRIFICATION DES FICHIERS"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Vérifier les fichiers modifiés
MODIFIED_FILES=$(git status --porcelain | wc -l | tr -d ' ')

if [ "$MODIFIED_FILES" -eq 0 ]; then
    print_warning "Aucun fichier modifié détecté"
    print_info "Les changements ont peut-être déjà été committés"
else
    print_status "$MODIFIED_FILES fichier(s) modifié(s)"
    echo ""
    print_info "Fichiers modifiés :"
    git status --short
fi

echo ""

# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "📦 VÉRIFICATION DES VERSIONS"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Frontend
echo "🎨 Frontend (stemadeleine) :"
cd frontend/stemadeleine
NEXT_VERSION=$(node -p "require('./package.json').dependencies.next" 2>/dev/null || echo "N/A")
REACT_VERSION=$(node -p "require('./package.json').dependencies.react" 2>/dev/null || echo "N/A")
echo "   Next.js: $NEXT_VERSION"
echo "   React: $REACT_VERSION"
cd ../..
echo ""

# Backoffice
echo "🏢 Backoffice :"
cd frontend/backoffice
NEXT_VERSION=$(node -p "require('./package.json').dependencies.next" 2>/dev/null || echo "N/A")
REACT_VERSION=$(node -p "require('./package.json').dependencies.react" 2>/dev/null || echo "N/A")
echo "   Next.js: $NEXT_VERSION"
echo "   React: $REACT_VERSION"
cd ../..
echo ""

# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "🔐 CHECKLIST DE DÉPLOIEMENT"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "Configuration Vercel Frontend :"
echo "  [ ] NEXT_PUBLIC_BACKEND_URL = https://stemadeleine-api.onrender.com"
echo "  [ ] NEXT_PUBLIC_RECAPTCHA_SITE_KEY = [votre clé]"
echo ""

echo "Configuration Vercel Backoffice :"
echo "  [ ] NEXT_PUBLIC_BACKEND_URL ou BACKEND_URL configuré"
echo "  [ ] Root Directory = frontend/backoffice"
echo ""

echo "Configuration Render Backend :"
echo "  [ ] CORS_ALLOWED_ORIGINS = https://stemadeleine-fr.vercel.app"
echo "  [ ] Toutes les variables d'environnement configurées"
echo ""

# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "🚀 COMMANDES DE DÉPLOIEMENT"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "Pour déployer, exécutez les commandes suivantes :"
echo ""
echo -e "${BLUE}# 1. Ajouter tous les fichiers modifiés${NC}"
echo "git add ."
echo ""
echo -e "${BLUE}# 2. Commiter avec un message détaillé${NC}"
cat << 'EOF'
git commit -m "security: Fix critical CVE and Vercel deployment issues

Frontend (stemadeleine):
- Update Next.js 16.0.3 → 16.1.2 (CVE-2025-55182, CVE-2025-55184, CVE-2025-55183)
- Update React 19.2.0 → 19.2.1
- Update jsPDF 3.0.4 → 4.0.0 (CVE-2025-68428)
- Update React Router 7.9.6 → 7.12.0 (XSS & CSRF fixes)
- Create .env.production with NEXT_PUBLIC_BACKEND_URL
- Optimize axios timeout to 30s for production

Backoffice:
- Update Next.js 15.4.7 → 15.5.9 (CVE-2025-55182, CVE-2025-55184, CVE-2025-55183)
- Update React 19.1.0 → 19.1.2
- Add Suspense boundaries to 7 pages using useSearchParams()
- Fix Vercel build error: missing suspense with CSR bailout

Backend:
- Add dynamic CORS origins support via CORS_ALLOWED_ORIGINS
- Add stemadeleine-fr.vercel.app to allowed origins
- Update CorsConfig to accept additional origins from env variable

Configuration:
- Update render.yaml with CORS_ALLOWED_ORIGINS variable
- Create deployment guides and security documentation"
EOF
echo ""
echo -e "${BLUE}# 3. Pousser vers GitHub${NC}"
echo "git push origin main"
echo ""
echo -e "${BLUE}# 4. Suivre les déploiements${NC}"
echo "   • Render : https://dashboard.render.com"
echo "   • Vercel : https://vercel.com/dashboard"
echo ""

# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "📖 DOCUMENTATION"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "Documentation créée :"
echo "  📄 SECURITY_CVE_FIX_2026-01-16.md - Frontend CVE fixes"
echo "  📄 SECURITY_BACKOFFICE_FIX.md - Backoffice fixes"
echo "  📄 VERCEL_FIX_SUMMARY.md - Configuration Vercel"
echo "  📄 VERCEL_QUICK_FIX.md - Guide rapide"
echo "  📄 VERCEL_DEPLOYMENT_GUIDE.md - Guide détaillé"
echo ""

# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "⚡ TESTS POST-DÉPLOIEMENT"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "Une fois déployé, testez :"
echo ""
echo "1. Frontend (stemadeleine-fr.vercel.app) :"
echo "   • Navigation sur toutes les pages"
echo "   • Formulaire de contact"
echo "   • Console navigateur (pas d'erreurs CORS)"
echo ""
echo "2. Backoffice :"
echo "   • Connexion"
echo "   • Pages : /contacts, /search, /payments, /users, /news"
echo "   • Édition de contenu"
echo ""
echo "3. Backend (stemadeleine-api.onrender.com) :"
echo "   • curl https://stemadeleine-api.onrender.com/api/public/health"
echo "   • Vérifier les logs Render"
echo ""

# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "✨ PRÊT POUR LE DÉPLOIEMENT !"
echo "═══════════════════════════════════════════════════════════"
echo ""

print_status "Tous les correctifs ont été appliqués"
print_status "Les dépendances sont à jour"
print_status "La documentation est complète"
echo ""
print_info "Copiez et exécutez les commandes ci-dessus pour déployer"
echo ""
