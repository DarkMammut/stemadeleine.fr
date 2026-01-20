#!/bin/bash

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Test des routes API en local"
echo "================================"
echo ""

# Vérifier si le backend est démarré
echo "1️⃣ Vérification du backend (port 8080)..."
if lsof -i:8080 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend démarré${NC}"
else
    echo -e "${RED}✗ Backend non démarré !${NC}"
    echo "   Démarrez-le avec : cd backend/api && docker-compose up -d"
    exit 1
fi

# Vérifier si le backoffice est démarré
echo "2️⃣ Vérification du backoffice (port 3001)..."
if lsof -i:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backoffice démarré${NC}"
else
    echo -e "${RED}✗ Backoffice non démarré !${NC}"
    echo "   Démarrez-le avec : cd frontend/backoffice && npm run dev"
    exit 1
fi

echo ""
echo "3️⃣ Test des endpoints..."
echo ""

# Test login pour obtenir un cookie
echo "   📝 POST /api/auth/login"
COOKIE_FILE=$(mktemp)
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"admin"}' \
    -c "$COOKIE_FILE")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "      ${GREEN}✓ 200 OK${NC}"
else
    echo -e "      ${RED}✗ $HTTP_CODE${NC}"
    rm -f "$COOKIE_FILE"
    exit 1
fi

# Test stats/dashboard
echo "   📊 GET /api/stats/dashboard"
STATS_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3001/api/stats/dashboard \
    -b "$COOKIE_FILE")

HTTP_CODE=$(echo "$STATS_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "      ${GREEN}✓ 200 OK${NC}"
else
    echo -e "      ${RED}✗ $HTTP_CODE${NC}"
fi

# Test contacts
echo "   📧 GET /api/contacts"
CONTACTS_RESPONSE=$(curl -s -w "\n%{http_code}" "http://localhost:3001/api/contacts?page=0&size=10" \
    -b "$COOKIE_FILE")

HTTP_CODE=$(echo "$CONTACTS_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "      ${GREEN}✓ 200 OK${NC}"
else
    echo -e "      ${RED}✗ $HTTP_CODE${NC}"
fi

# Test users
echo "   👥 GET /api/users"
USERS_RESPONSE=$(curl -s -w "\n%{http_code}" "http://localhost:3001/api/users?page=0&size=10" \
    -b "$COOKIE_FILE")

HTTP_CODE=$(echo "$USERS_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "      ${GREEN}✓ 200 OK${NC}"
else
    echo -e "      ${RED}✗ $HTTP_CODE${NC}"
fi

# Test campaigns
echo "   🎯 GET /api/campaigns"
CAMPAIGNS_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3001/api/campaigns \
    -b "$COOKIE_FILE")

HTTP_CODE=$(echo "$CAMPAIGNS_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "      ${GREEN}✓ 200 OK${NC}"
else
    echo -e "      ${RED}✗ $HTTP_CODE${NC}"
fi

# Test logout
echo "   🚪 POST /api/auth/logout"
LOGOUT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3001/api/auth/logout \
    -b "$COOKIE_FILE")

HTTP_CODE=$(echo "$LOGOUT_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "      ${GREEN}✓ 200 OK${NC}"
else
    echo -e "      ${RED}✗ $HTTP_CODE${NC}"
fi

# Nettoyage
rm -f "$COOKIE_FILE"

echo ""
echo -e "${GREEN}✅ Tests terminés !${NC}"
echo ""
echo "📌 Ouvrez maintenant http://localhost:3001 dans votre navigateur"
echo "   pour tester l'interface complète."
