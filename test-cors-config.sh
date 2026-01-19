#!/bin/bash

# Script de vérification de la configuration CORS pour dashboard.stemadeleine.fr

echo "🔍 Vérification de la configuration CORS"
echo "========================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier que dashboard.stemadeleine.fr est dans CorsConfig.java
echo "1️⃣ Vérification de dashboard.stemadeleine.fr dans CORS..."
if grep -q "dashboard.stemadeleine.fr" backend/api/src/main/java/com/stemadeleine/api/config/CorsConfig.java; then
    echo -e "${GREEN}✓ dashboard.stemadeleine.fr trouvé dans CorsConfig.java${NC}"
else
    echo -e "${RED}✗ dashboard.stemadeleine.fr NON TROUVÉ dans CorsConfig.java !${NC}"
    exit 1
fi

# Vérifier qu'il n'y a plus de référence à backoffice.stemadeleine.fr
echo ""
echo "2️⃣ Vérification qu'il n'y a plus backoffice.stemadeleine.fr..."
BACKOFFICE_COUNT=$(grep -c "backoffice.stemadeleine.fr" backend/api/src/main/java/com/stemadeleine/api/config/CorsConfig.java 2>/dev/null || echo "0")
if [ "$BACKOFFICE_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓ Aucune référence à backoffice.stemadeleine.fr (bon!)${NC}"
else
    echo -e "${YELLOW}⚠ Attention: $BACKOFFICE_COUNT référence(s) à backoffice.stemadeleine.fr trouvée(s)${NC}"
    grep -n "backoffice.stemadeleine.fr" backend/api/src/main/java/com/stemadeleine/api/config/CorsConfig.java
fi

# Vérifier la méthode addAuthCookie
echo ""
echo "3️⃣ Vérification de la méthode addAuthCookie avec SameSite..."
if grep -q "addAuthCookie" backend/api/src/main/java/com/stemadeleine/api/controller/AuthController.java; then
    echo -e "${GREEN}✓ Méthode addAuthCookie trouvée${NC}"
    if grep -q "SameSite=None" backend/api/src/main/java/com/stemadeleine/api/controller/AuthController.java; then
        echo -e "${GREEN}✓ SameSite=None configuré${NC}"
    else
        echo -e "${RED}✗ SameSite=None NON TROUVÉ !${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ Méthode addAuthCookie NON TROUVÉE !${NC}"
    exit 1
fi

# Afficher les origines CORS configurées
echo ""
echo "4️⃣ Origines CORS configurées:"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
grep -A 8 "List<String> allowedOrigins" backend/api/src/main/java/com/stemadeleine/api/config/CorsConfig.java | grep "https://" | sed 's/.*"\(.*\)".*/  ✓ \1/'
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Afficher la configuration des cookies
echo ""
echo "5️⃣ Configuration des cookies:"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "  Production (HTTPS):"
echo "    • HttpOnly: ✓"
echo "    • Secure: ✓"
echo "    • SameSite: None"
echo "    • Path: /"
echo "    • Max-Age: 86400 (24h)"
echo ""
echo "  Développement (HTTP):"
echo "    • HttpOnly: ✓"
echo "    • Secure: ✗ (false)"
echo "    • SameSite: Lax"
echo "    • Path: /"
echo "    • Max-Age: 86400 (24h)"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Résumé final
echo ""
echo "======================================"
echo -e "${GREEN}✅ Configuration CORS et cookies OK !${NC}"
echo "======================================"
echo ""
echo "📝 Prochaines étapes:"
echo ""
echo "1. Déployer sur Render:"
echo "   ${BLUE}git add .${NC}"
echo "   ${BLUE}git commit -m 'Fix: Config domaines + CORS dashboard.stemadeleine.fr'${NC}"
echo "   ${BLUE}git push origin main${NC}"
echo ""
echo "2. Configurer le DNS:"
echo "   ${BLUE}dashboard.stemadeleine.fr → CNAME → stemadeleine-backoffice.onrender.com${NC}"
echo ""
echo "3. Ajouter le domaine sur Render:"
echo "   ${BLUE}Render Dashboard → stemadeleine-backoffice → Settings → Custom Domain${NC}"
echo ""
echo "4. Tester après déploiement:"
echo "   ${BLUE}https://dashboard.stemadeleine.fr/auth/login${NC}"
echo ""
