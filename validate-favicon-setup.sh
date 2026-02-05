#!/bin/bash

echo "🔍 Validation de la configuration du favicon dynamique"
echo "======================================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Fonction de vérification
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1 ${RED}MANQUANT${NC}"
        ((ERRORS++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1 ${RED}MANQUANT${NC}"
        ((ERRORS++))
    fi
}

echo -e "${BLUE}📁 Vérification des fichiers créés...${NC}"
echo ""

echo "Composants React :"
check_file "frontend/backoffice/src/components/DynamicFavicon.jsx"
check_file "frontend/stemadeleine/src/components/DynamicFavicon.tsx"

echo ""
echo "Layouts modifiés :"
check_file "frontend/backoffice/src/app/layout.js"
check_file "frontend/stemadeleine/src/app/layout.tsx"

echo ""
echo "Configuration :"
check_file "frontend/backoffice/.env.local"
check_file "frontend/stemadeleine/.env.local"

echo ""
echo "Documentation :"
check_file "FAVICON_GUIDE.md"
check_file "FIX_DYNAMIC_FAVICON.md"
check_file "FAVICON_FIXED.md"
check_file "FAVICON_SUMMARY.md"

echo ""
echo "Scripts :"
check_file "test-favicon.sh"
check_file "start-favicon-test.sh"

echo ""
echo -e "${BLUE}🔍 Vérification du contenu des fichiers...${NC}"
echo ""

# Vérifier que DynamicFavicon est importé dans les layouts
if grep -q "DynamicFavicon" "frontend/backoffice/src/app/layout.js"; then
    echo -e "${GREEN}✓${NC} DynamicFavicon importé dans le layout backoffice"
else
    echo -e "${RED}✗${NC} DynamicFavicon NON importé dans le layout backoffice"
    ((ERRORS++))
fi

if grep -q "DynamicFavicon" "frontend/stemadeleine/src/app/layout.tsx"; then
    echo -e "${GREEN}✓${NC} DynamicFavicon importé dans le layout stemadeleine"
else
    echo -e "${RED}✗${NC} DynamicFavicon NON importé dans le layout stemadeleine"
    ((ERRORS++))
fi

echo ""
echo -e "${BLUE}⚙️  Vérification des variables d'environnement...${NC}"
echo ""

# Vérifier .env.local du backoffice
if grep -q "NEXT_PUBLIC_BACKEND_URL" "frontend/backoffice/.env.local"; then
    echo -e "${GREEN}✓${NC} NEXT_PUBLIC_BACKEND_URL défini (backoffice)"
else
    echo -e "${YELLOW}⚠${NC} NEXT_PUBLIC_BACKEND_URL manquant (backoffice)"
    ((WARNINGS++))
fi

# Vérifier .env.local de stemadeleine
if grep -q "NEXT_PUBLIC_API_URL" "frontend/stemadeleine/.env.local"; then
    echo -e "${GREEN}✓${NC} NEXT_PUBLIC_API_URL défini (stemadeleine)"
else
    echo -e "${YELLOW}⚠${NC} NEXT_PUBLIC_API_URL manquant (stemadeleine)"
    ((WARNINGS++))
fi

echo ""
echo -e "${BLUE}🌐 Vérification de la disponibilité du backend...${NC}"
echo ""

if curl -s -f -o /dev/null "http://localhost:8080/api/public/organization/settings" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Backend accessible sur http://localhost:8080"

    # Vérifier si un favicon est défini
    FAVICON_ID=$(curl -s "http://localhost:8080/api/public/organization/settings" 2>/dev/null | grep -o '"faviconMedia":"[^"]*"' | cut -d'"' -f4)

    if [ -n "$FAVICON_ID" ] && [ "$FAVICON_ID" != "null" ]; then
        echo -e "${GREEN}✓${NC} Favicon défini dans la base de données : $FAVICON_ID"

        # Vérifier l'accès au média
        if curl -s -f -o /dev/null "http://localhost:8080/api/public/media/$FAVICON_ID" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} Média favicon accessible"
        else
            echo -e "${RED}✗${NC} Média favicon NON accessible"
            ((ERRORS++))
        fi
    else
        echo -e "${YELLOW}⚠${NC} Aucun favicon défini dans la base de données"
        echo "   → Uploadez un favicon depuis http://localhost:3001/settings"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠${NC} Backend non accessible sur http://localhost:8080"
    echo "   → Démarrez-le avec : cd backend/api && ./mvnw spring-boot:run"
    ((WARNINGS++))
fi

echo ""
echo -e "${BLUE}📦 Vérification des dépendances Node.js...${NC}"
echo ""

if [ -d "frontend/backoffice/node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules présent (backoffice)"
else
    echo -e "${YELLOW}⚠${NC} node_modules manquant (backoffice)"
    echo "   → Exécutez : cd frontend/backoffice && npm install"
    ((WARNINGS++))
fi

if [ -d "frontend/stemadeleine/node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules présent (stemadeleine)"
else
    echo -e "${YELLOW}⚠${NC} node_modules manquant (stemadeleine)"
    echo "   → Exécutez : cd frontend/stemadeleine && npm install"
    ((WARNINGS++))
fi

echo ""
echo "======================================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ TOUT EST PRÊT !${NC}"
    echo ""
    echo "🚀 Prochaines étapes :"
    echo ""
    echo "1. Démarrer le backoffice :"
    echo "   cd frontend/backoffice && npm run dev"
    echo ""
    echo "2. Ouvrir http://localhost:3001/settings"
    echo ""
    echo "3. Uploader un favicon dans la section 'Favicon du site'"
    echo ""
    echo "4. Observer le changement dans l'onglet du navigateur ✨"
    echo ""
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  CONFIGURATION INCOMPLÈTE${NC}"
    echo ""
    echo "Il y a $WARNINGS avertissement(s) à corriger."
    echo "Le système devrait fonctionner, mais certaines fonctionnalités peuvent être limitées."
    echo ""
else
    echo -e "${RED}❌ ERREURS DÉTECTÉES${NC}"
    echo ""
    echo "Il y a $ERRORS erreur(s) à corriger avant de pouvoir utiliser le favicon dynamique."
    echo ""
fi

if [ $WARNINGS -gt 0 ] || [ $ERRORS -gt 0 ]; then
    echo "📚 Consultez la documentation :"
    echo "   - FAVICON_SUMMARY.md pour un guide rapide"
    echo "   - FAVICON_GUIDE.md pour plus de détails"
    echo ""
fi

exit $ERRORS
