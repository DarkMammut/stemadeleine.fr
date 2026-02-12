#!/bin/bash

echo "🔧 Test de validation - Fix Navigation Backoffice Favicon"
echo "========================================================="
echo

# Vérification des fichiers favicon backoffice
echo "📁 Vérification des fichiers favicon backoffice..."
if [ -f "frontend/backoffice/public/favicon.svg" ]; then
    echo "✅ favicon.svg trouvé"
else
    echo "❌ favicon.svg manquant"
fi

if [ -f "frontend/backoffice/public/favicon.ico" ]; then
    echo "✅ favicon.ico trouvé"
else
    echo "❌ favicon.ico manquant"
fi

# Vérification que DynamicFavicon n'est plus dans le layout backoffice
echo
echo "🔍 Vérification suppression DynamicFavicon backoffice..."
if grep -q "DynamicFavicon" "frontend/backoffice/src/app/layout.js"; then
    echo "❌ DynamicFavicon encore présent dans le layout backoffice"
else
    echo "✅ DynamicFavicon supprimé du layout backoffice"
fi

# Vérification que DynamicFavicon est toujours dans le layout site principal
echo
echo "🔍 Vérification conservation DynamicFavicon site principal..."
if grep -q "DynamicFavicon" "frontend/stemadeleine/src/app/layout.tsx"; then
    echo "✅ DynamicFavicon conservé dans le layout site principal"
else
    echo "❌ DynamicFavicon supprimé du layout site principal (problème !)"
fi

# Vérification des métadonnées favicon backoffice
echo
echo "🔍 Vérification configuration favicon statique backoffice..."
if grep -q "favicon.svg" "frontend/backoffice/src/app/layout.js"; then
    echo "✅ Configuration favicon SVG présente"
else
    echo "❌ Configuration favicon SVG manquante"
fi

echo
echo "🎉 Test de validation terminé !"
echo
echo "💡 Pour tester en conditions réelles :"
echo "   1. Démarrer le backoffice : cd frontend/backoffice && npm run dev"
echo "   2. Naviguer entre les pages sans refresh"
echo "   3. Vérifier que la favicon 'B' s'affiche"
echo "   4. Tester que le site principal garde sa favicon dynamique"
