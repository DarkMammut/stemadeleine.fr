#!/bin/bash

echo "🧹 Nettoyage complet du cache Next.js..."

cd frontend/backoffice

# Arrêter le serveur si il tourne
echo "1. Assurez-vous que le serveur est arrêté (Ctrl+C)"

# Supprimer les dossiers de cache
echo "2. Suppression du cache .next..."
rm -rf .next

echo "3. Suppression du cache node_modules/.cache..."
rm -rf node_modules/.cache

echo "4. Suppression du cache Turbopack..."
rm -rf .turbo

echo ""
echo "✅ Cache supprimé !"
echo ""
echo "📝 Prochaines étapes :"
echo "  1. Supprimer TOUS les cookies de localhost:3001 dans le navigateur"
echo "  2. Redémarrer le serveur : npm run dev"
echo "  3. Tester en navigation privée"
echo ""
