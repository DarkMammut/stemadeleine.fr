#!/bin/bash

echo "🚀 Test Production - Navigation Backoffice Fixed"
echo "==============================================="
echo

# Fonction de test des URLs du backoffice
test_backoffice_navigation() {
    echo "🔍 Test navigation backoffice..."

    # URLs principales à tester
    urls=(
        "http://localhost:3001/dashboard"
        "http://localhost:3001/pages"
        "http://localhost:3001/news"
        "http://localhost:3001/newsletters"
        "http://localhost:3001/contacts"
        "http://localhost:3001/settings"
    )

    for url in "${urls[@]}"; do
        echo "   Testing: $url"
        # En production, vous pourriez ajouter des tests curl ici
    done

    echo "✅ URLs de navigation identifiées"
}

# Fonction de test des favicons
test_favicons() {
    echo
    echo "🎨 Test favicons..."

    if [ -f "frontend/backoffice/public/favicon.svg" ]; then
        echo "✅ Favicon SVG backoffice: OK"
    else
        echo "❌ Favicon SVG backoffice: MANQUANT"
    fi

    if [ -f "frontend/backoffice/public/favicon.ico" ]; then
        echo "✅ Favicon ICO backoffice: OK"
    else
        echo "❌ Favicon ICO backoffice: MANQUANT"
    fi

    if [ -f "frontend/stemadeleine/src/components/DynamicFavicon.tsx" ]; then
        echo "✅ DynamicFavicon site principal: CONSERVÉ"
    else
        echo "❌ DynamicFavicon site principal: SUPPRIMÉ PAR ERREUR"
    fi
}

# Fonction de vérification de build
test_build() {
    echo
    echo "🏗️  Test de build backoffice..."

    cd frontend/backoffice

    if [ -f "package.json" ]; then
        echo "✅ package.json trouvé"

        # Test théorique de build (à adapter selon votre setup)
        echo "💡 Pour tester le build:"
        echo "   npm run build"
        echo "   npm start"
        echo
    else
        echo "❌ package.json non trouvé"
    fi

    cd ../..
}

# Exécution des tests
test_favicons
test_backoffice_navigation
test_build

echo
echo "📋 Instructions de test manuel:"
echo "=============================="
echo
echo "1. 🎯 Test backoffice:"
echo "   cd frontend/backoffice"
echo "   npm run dev"
echo "   → Ouvrir http://localhost:3001"
echo "   → Naviguer entre pages SANS refresh"
echo "   → Vérifier favicon 'B' violet"
echo
echo "2. 🎯 Test site principal:"
echo "   cd frontend/stemadeleine"
echo "   npm run dev"
echo "   → Ouvrir http://localhost:3000"
echo "   → Vérifier favicon dynamique"
echo "   → Tester changement via backoffice"
echo
echo "3. 🎯 Test navigation SPA:"
echo "   → Utiliser les liens de navigation"
echo "   → Observer que l'URL change immédiatement"
echo "   → Vérifier que le contenu se charge sans refresh"
echo "   → Aucune intervention manuelle requise"
echo
echo "✅ Si tous ces tests passent, le fix est réussi !"
echo
echo "📚 Documentation:"
echo "   - Voir FIX_NAVIGATION_BACKOFFICE_FAVICON.md"
echo "   - Backup: DynamicFavicon.jsx.disabled"
