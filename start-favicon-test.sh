#!/bin/bash

echo "🚀 Démarrage rapide - Favicon Dynamique"
echo "========================================"
echo ""

# Fonction pour afficher les couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Prérequis${NC}"
echo "  1. Backend Spring Boot démarré sur le port 8080"
echo "  2. Base de données accessible"
echo ""

# Vérifier si le backend est accessible
echo -e "${BLUE}🔍 Vérification du backend...${NC}"
if curl -s -f -o /dev/null "http://localhost:8080/api/public/organization/settings"; then
    echo -e "${GREEN}✓ Backend accessible${NC}"
else
    echo -e "${YELLOW}⚠ Backend non accessible. Assurez-vous qu'il est démarré :${NC}"
    echo "   cd backend/api && ./mvnw spring-boot:run"
    echo ""
fi

echo ""
echo -e "${BLUE}🌐 Services disponibles :${NC}"
echo ""
echo "  Backoffice  : http://localhost:3001"
echo "  Site public : http://localhost:3000"
echo "  API Backend : http://localhost:8080"
echo ""
echo -e "${BLUE}📝 Pour démarrer les frontends :${NC}"
echo ""
echo "  Terminal 1 - Backoffice :"
echo "    cd frontend/backoffice"
echo "    npm install  # Si première fois"
echo "    npm run dev"
echo ""
echo "  Terminal 2 - Site public :"
echo "    cd frontend/stemadeleine"
echo "    npm install  # Si première fois"
echo "    npm run dev"
echo ""
echo -e "${BLUE}🎨 Test du favicon :${NC}"
echo ""
echo "  1. Ouvrir http://localhost:3001/settings"
echo "  2. Scroller jusqu'à 'Favicon du site'"
echo "  3. Cliquer sur 'Ajouter un média'"
echo "  4. Uploader une image (ICO, PNG, SVG)"
echo "  5. Observer le changement dans l'onglet du navigateur"
echo "  6. Ouvrir http://localhost:3000 dans un autre onglet"
echo "  7. Le même favicon devrait s'afficher"
echo ""
echo -e "${BLUE}🔄 Si le favicon ne change pas :${NC}"
echo ""
echo "  • Forcer le rafraîchissement : Ctrl+Shift+R (Cmd+Shift+R sur Mac)"
echo "  • Vider le cache du navigateur"
echo "  • Relancer : ./test-favicon.sh pour diagnostiquer"
echo ""
echo -e "${GREEN}✨ Tout est prêt !${NC}"
echo ""
