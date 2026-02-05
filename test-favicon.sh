#!/bin/bash

echo "🔍 Test du favicon dynamique"
echo "=============================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier que le backend est accessible
echo "1️⃣  Vérification du backend..."
BACKEND_URL="http://localhost:8080"
if curl -s -f -o /dev/null "$BACKEND_URL/api/public/organization/settings"; then
    echo -e "${GREEN}✓ Backend accessible${NC}"
else
    echo -e "${RED}✗ Backend non accessible à $BACKEND_URL${NC}"
    echo "   Assurez-vous que le backend est démarré : cd backend/api && ./mvnw spring-boot:run"
    exit 1
fi

# Récupérer les settings
echo ""
echo "2️⃣  Récupération des paramètres de l'organisation..."
SETTINGS=$(curl -s "$BACKEND_URL/api/public/organization/settings")
echo "$SETTINGS" | jq '.' 2>/dev/null || echo "$SETTINGS"

# Vérifier si un favicon est défini
echo ""
echo "3️⃣  Vérification du favicon..."
FAVICON_ID=$(echo "$SETTINGS" | jq -r '.faviconMedia // empty' 2>/dev/null)

if [ -z "$FAVICON_ID" ] || [ "$FAVICON_ID" = "null" ]; then
    echo -e "${YELLOW}⚠ Aucun favicon n'est défini dans les paramètres${NC}"
    echo "   Pour tester :"
    echo "   1. Démarrez le backoffice : cd frontend/backoffice && npm run dev"
    echo "   2. Allez sur http://localhost:3001/settings"
    echo "   3. Uploadez une image dans la section 'Favicon du site'"
else
    echo -e "${GREEN}✓ Favicon défini : $FAVICON_ID${NC}"

    # Tester l'accès au média
    echo ""
    echo "4️⃣  Test d'accès au média du favicon..."
    if curl -s -f -o /dev/null "$BACKEND_URL/api/public/media/$FAVICON_ID"; then
        echo -e "${GREEN}✓ Média accessible à $BACKEND_URL/api/public/media/$FAVICON_ID${NC}"
    else
        echo -e "${RED}✗ Média non accessible${NC}"
    fi
fi

echo ""
echo "=============================="
echo "📝 Instructions de test :"
echo ""
echo "Backoffice :"
echo "  cd frontend/backoffice && npm run dev"
echo "  Ouvrir http://localhost:3001"
echo ""
echo "Site public :"
echo "  cd frontend/stemadeleine && npm run dev"
echo "  Ouvrir http://localhost:3000"
echo ""
echo "Pour forcer le rafraîchissement du favicon :"
echo "  - Chrome/Edge : Ctrl+Shift+R (Cmd+Shift+R sur Mac)"
echo "  - Firefox : Ctrl+Shift+R (Cmd+Shift+R sur Mac)"
echo "  - Safari : Cmd+Option+R"
echo ""
