#!/bin/bash

# 🔒 Script de déploiement des correctifs de sécurité CVE
# Ce script vérifie et guide le déploiement des correctifs

echo "🔒 Correctifs de Sécurité CVE - Stemadeleine"
echo "=============================================="
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "frontend/stemadeleine/package.json" ]; then
    echo "❌ Erreur : Veuillez exécuter ce script depuis la racine du projet"
    exit 1
fi

echo "✅ Répertoire correct détecté"
echo ""

# Vérifier les versions installées
echo "📋 Vérification des versions installées..."
cd frontend/stemadeleine

NEXT_VERSION=$(node -p "require('./package.json').dependencies.next")
JSPDF_VERSION=$(node -p "require('./package.json').dependencies.jspdf")
REACT_ROUTER_VERSION=$(node -p "require('./package.json').dependencies['react-router-dom']")

echo "   - Next.js: $NEXT_VERSION"
echo "   - jsPDF: $JSPDF_VERSION"
echo "   - React Router: $REACT_ROUTER_VERSION"
echo ""

# Vérifier si les bonnes versions sont dans package.json
if [ "$NEXT_VERSION" = "16.1.2" ]; then
    echo "✅ Next.js est à jour (16.1.2)"
else
    echo "⚠️  Next.js n'est pas à la bonne version (attendu: 16.1.2, actuel: $NEXT_VERSION)"
fi

if [[ "$JSPDF_VERSION" == ^4.0.0* ]] || [ "$JSPDF_VERSION" = "4.0.0" ]; then
    echo "✅ jsPDF est à jour (4.0.0+)"
else
    echo "⚠️  jsPDF n'est pas à la bonne version (attendu: ^4.0.0, actuel: $JSPDF_VERSION)"
fi

if [[ "$REACT_ROUTER_VERSION" == ^7.12.0* ]] || [ "$REACT_ROUTER_VERSION" = "7.12.0" ]; then
    echo "✅ React Router est à jour (7.12.0+)"
else
    echo "⚠️  React Router n'est pas à la bonne version (attendu: ^7.12.0, actuel: $REACT_ROUTER_VERSION)"
fi

echo ""

# Vérifier npm audit
echo "🔍 Vérification des vulnérabilités npm..."
AUDIT_RESULT=$(npm audit --json 2>/dev/null | node -p "JSON.parse(require('fs').readFileSync(0)).metadata.vulnerabilities.total")

if [ "$AUDIT_RESULT" = "0" ]; then
    echo "✅ Aucune vulnérabilité détectée"
else
    echo "⚠️  $AUDIT_RESULT vulnérabilité(s) détectée(s)"
    echo "   Exécutez 'npm audit' pour plus de détails"
fi

cd ../..

echo ""
echo "=============================================="
echo "📝 Étapes de déploiement"
echo "=============================================="
echo ""
echo "1. Vérifiez que toutes les dépendances sont à jour ci-dessus"
echo ""
echo "2. Committez les changements :"
echo "   git add frontend/stemadeleine/package.json frontend/stemadeleine/package-lock.json"
echo "   git commit -m \"security: Fix critical CVE in Next.js, jsPDF and React Router\""
echo ""
echo "3. Poussez vers GitHub :"
echo "   git push origin main"
echo ""
echo "4. Vercel redéploiera automatiquement (environ 3-5 minutes)"
echo ""
echo "5. Vérifiez le déploiement :"
echo "   - Ouvrez https://stemadeleine-fr.vercel.app"
echo "   - Testez la navigation"
echo "   - Testez le formulaire de contact"
echo "   - Vérifiez la console (F12) pour des erreurs"
echo ""
echo "=============================================="
echo "📚 Documentation"
echo "=============================================="
echo ""
echo "Pour plus de détails, consultez :"
echo "   - SECURITY_CVE_FIX_2026-01-16.md (détails des CVE)"
echo "   - VERCEL_DEPLOYMENT_GUIDE.md (guide de déploiement)"
echo ""
echo "🎉 Prêt pour le déploiement !"
