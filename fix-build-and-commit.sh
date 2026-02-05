#!/bin/bash

# Script pour tester le build après la correction du DynamicFavicon
set -e

echo "🔨 Test du build de stemadeleine frontend..."
cd /Users/seb/Documents/Ste\ Madeleine/stemadeleine.fr/frontend/stemadeleine

echo ""
echo "🧹 Nettoyage des anciens builds..."
rm -rf .next

echo ""
echo "📦 Installation des dépendances (si nécessaire)..."
npm install

echo ""
echo "🏗️  Lancement du build..."
npm run build

echo ""
echo "✅ Build réussi !"
echo ""
echo "📝 Maintenant, commitons le correctif..."

cd /Users/seb/Documents/Ste\ Madeleine/stemadeleine.fr

# Vérifier s'il y a des changements à commiter
if [[ -n $(git status -s) ]]; then
    echo "💾 Ajout des fichiers modifiés..."
    git add frontend/stemadeleine/src/app/layout.tsx

    echo "💾 Commit du correctif d'import..."
    git commit -m "fix: add missing DynamicFavicon import in layout.tsx"

    echo ""
    echo "✅ Correctif commité avec succès !"
    echo ""
    echo "📊 État du dépôt:"
    git status
else
    echo "ℹ️  Aucun changement à commiter"
fi

echo ""
echo "🎉 Tout est prêt ! Vous pouvez maintenant pousser vos changements avec:"
echo "   git push origin main"
