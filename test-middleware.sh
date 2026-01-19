#!/bin/bash

# Script de test rapide du middleware de protection des routes
# À exécuter en local avant de déployer

echo "🧪 Test du middleware de protection des routes"
echo "=============================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier que le middleware existe
echo "1️⃣ Vérification du middleware..."
if [ -f "frontend/backoffice/src/middleware.js" ]; then
    echo -e "${GREEN}✓ Middleware trouvé${NC}"
else
    echo -e "${RED}✗ Middleware non trouvé !${NC}"
    exit 1
fi

# Vérifier les routes dans le code
echo ""
echo "2️⃣ Vérification des routes /auth/login..."
LOGIN_ROUTES=$(grep -r "'/login'" frontend/backoffice/src --exclude-dir=node_modules 2>/dev/null | wc -l)
if [ "$LOGIN_ROUTES" -eq 0 ]; then
    echo -e "${GREEN}✓ Aucune référence incorrecte à '/login' trouvée${NC}"
else
    echo -e "${RED}✗ Trouvé $LOGIN_ROUTES référence(s) à '/login' (devrait être '/auth/login')${NC}"
    grep -rn "'/login'" frontend/backoffice/src --exclude-dir=node_modules
fi

# Vérifier la config du backend
echo ""
echo "3️⃣ Vérification de la config JWT cookie..."
if grep -q "jwt.cookie.secure" backend/api/src/main/resources/application.properties; then
    echo -e "${GREEN}✓ Configuration jwt.cookie.secure trouvée${NC}"
else
    echo -e "${RED}✗ Configuration jwt.cookie.secure manquante !${NC}"
    exit 1
fi

# Vérifier render.yaml
echo ""
echo "4️⃣ Vérification de render.yaml..."
if grep -q "BACKEND_URL" render.yaml && grep -q "JWT_COOKIE_SECURE" render.yaml; then
    echo -e "${GREEN}✓ Variables d'environnement configurées${NC}"
else
    echo -e "${YELLOW}⚠ Variables d'environnement manquantes dans render.yaml${NC}"
fi

# Instructions pour tester
echo ""
echo "=============================================="
echo "📋 Tests manuels à effectuer :"
echo "=============================================="
echo ""
echo "1. Démarrer le backend :"
echo "   cd backend/api"
echo "   ./mvnw spring-boot:run"
echo ""
echo "2. Démarrer le frontend (dans un autre terminal) :"
echo "   cd frontend/backoffice"
echo "   npm run dev"
echo ""
echo "3. Tests à effectuer :"
echo "   a) Ouvrir http://localhost:3001/"
echo "      → Devrait rediriger vers /auth/login"
echo ""
echo "   b) Aller sur http://localhost:3001/dashboard (sans être connecté)"
echo "      → Devrait rediriger vers /auth/login"
echo ""
echo "   c) Se connecter sur http://localhost:3001/auth/login"
echo "      → Devrait rediriger vers /dashboard après login"
echo ""
echo "   d) Aller sur http://localhost:3001/auth/login (connecté)"
echo "      → Devrait rediriger vers /dashboard"
echo ""
echo "   e) Vérifier le cookie dans DevTools > Application > Cookies"
echo "      → authToken devrait exister avec HttpOnly=true, Secure=false (en local)"
echo ""
echo "=============================================="
echo -e "${GREEN}✅ Vérifications préliminaires terminées !${NC}"
echo "=============================================="
