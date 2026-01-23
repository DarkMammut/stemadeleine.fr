#!/bin/bash

# Script de test pour vérifier l'upload d'images après le fix

echo "🧪 Test de l'upload d'images dans le backoffice"
echo "================================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:8080}"
BACKOFFICE_URL="${BACKOFFICE_URL:-http://localhost:3001}"

echo -e "${BLUE}Configuration:${NC}"
echo "  API URL: $API_URL"
echo "  Backoffice URL: $BACKOFFICE_URL"
echo ""

# Vérifier que les fichiers ont été modifiés
echo "1️⃣ Vérification des modifications du code..."
echo ""

# Backend
if grep -q "consumes = MediaType.MULTIPART_FORM_DATA_VALUE" backend/api/src/main/java/com/stemadeleine/api/controller/MediaController.java; then
    echo -e "${GREEN}✓ Backend: consumes défini sur l'endpoint /upload${NC}"
else
    echo -e "${RED}✗ Backend: consumes manquant sur l'endpoint /upload${NC}"
    exit 1
fi

# Frontend - MediaManager
if grep -q '"Content-Type": "multipart/form-data"' frontend/backoffice/src/components/MediaManager.jsx; then
    echo -e "${RED}✗ Frontend MediaManager: Header Content-Type encore présent (BUG)${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Frontend MediaManager: Header Content-Type supprimé${NC}"
fi

# Frontend - MediaEditor
if grep -q '"Content-Type": "multipart/form-data"' frontend/backoffice/src/components/MediaEditor.jsx; then
    echo -e "${RED}✗ Frontend MediaEditor: Header Content-Type encore présent (BUG)${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Frontend MediaEditor: Header Content-Type supprimé${NC}"
fi

# Frontend - MediaSelector
if grep -q '"Content-Type": "multipart/form-data"' frontend/backoffice/src/components/MediaSelector.jsx; then
    echo -e "${RED}✗ Frontend MediaSelector: Header Content-Type encore présent (BUG)${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Frontend MediaSelector: Header Content-Type supprimé${NC}"
fi

echo ""
echo "2️⃣ Vérification de la configuration Spring multipart..."
echo ""

if grep -q "spring.servlet.multipart.max-file-size=10MB" backend/api/src/main/resources/application.properties; then
    echo -e "${GREEN}✓ Limite de taille de fichier configurée (10MB)${NC}"
else
    echo -e "${YELLOW}⚠ Configuration multipart non trouvée${NC}"
fi

echo ""
echo "3️⃣ Test de l'endpoint API (nécessite le backend démarré)..."
echo ""

# Vérifier que le backend est accessible
if curl -s -o /dev/null -w "%{http_code}" "$API_URL/actuator/health" | grep -q "200"; then
    echo -e "${GREEN}✓ Backend accessible sur $API_URL${NC}"

    # Tester l'endpoint /api/media (nécessite authentification)
    echo ""
    echo -e "${BLUE}Note: Test d'upload nécessite une authentification${NC}"
    echo -e "${BLUE}Pour tester manuellement:${NC}"
    echo "  1. Ouvrir $BACKOFFICE_URL"
    echo "  2. Se connecter avec vos identifiants"
    echo "  3. Aller dans la gestion des médias"
    echo "  4. Essayer d'uploader une image"
    echo ""
else
    echo -e "${YELLOW}⚠ Backend non accessible. Démarrez le backend avec:${NC}"
    echo "  cd backend/api && ./mvnw spring-boot:run"
    echo ""
fi

echo ""
echo "======================================"
echo -e "${GREEN}✅ Vérifications du code terminées !${NC}"
echo "======================================"
echo ""
echo "📝 Prochaines étapes pour tester:"
echo ""
echo "1. Redémarrer le backend:"
echo "   ${BLUE}cd backend/api${NC}"
echo "   ${BLUE}./mvnw spring-boot:run${NC}"
echo ""
echo "2. Redémarrer le frontend:"
echo "   ${BLUE}cd frontend/backoffice${NC}"
echo "   ${BLUE}npm run dev${NC}"
echo ""
echo "3. Tester l'upload:"
echo "   • Ouvrir ${BLUE}$BACKOFFICE_URL${NC}"
echo "   • Se connecter"
echo "   • Aller dans Médias > Ajouter un média"
echo "   • Drag & drop ou sélectionner une image"
echo "   • Vérifier qu'il n'y a plus d'erreur 500"
echo ""
echo "4. Vérifier les logs backend:"
echo "   • Chercher: ${GREEN}POST /api/media/upload - Uploading file:${NC}"
echo "   • Pas d'erreur: ${RED}Current request is not a multipart request${NC}"
echo ""
