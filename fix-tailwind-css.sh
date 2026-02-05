#!/bin/bash

# Script pour corriger le problème Tailwind CSS v4 -> v3
set -e

echo "🔧 Correction du problème Tailwind CSS..."
echo ""

cd /Users/seb/Documents/Ste\ Madeleine/stemadeleine.fr/frontend/stemadeleine

echo "🧹 Nettoyage des anciens fichiers..."
rm -rf node_modules package-lock.json .next

echo ""
echo "📦 Réinstallation des dépendances avec Tailwind v3..."
npm install

echo ""
echo "🏗️  Rebuild du projet..."
npm run build

echo ""
echo "✅ CSS corrigé ! Le site devrait maintenant s'afficher correctement."
echo ""
echo "Pour tester localement:"
echo "  cd /Users/seb/Documents/Ste\ Madeleine/stemadeleine.fr/frontend/stemadeleine"
echo "  npm run dev"
echo ""
echo "Le site sera disponible sur http://localhost:3000"
