#!/usr/bin/env bash
# Script pour nettoyer les fichiers .env du repository Git

echo "🧹 Nettoyage des fichiers .env du repository GitHub..."

# Vérifier si nous sommes dans un repository Git
if [ ! -d .git ]; then
    echo "❌ Erreur : Ce script doit être exécuté à la racine du projet Git"
    exit 1
fi

# Supprimer les .env du cache Git (mais les garder localement)
echo "📝 Suppression des .env du cache Git..."
git rm --cached .env 2>/dev/null || echo "  ℹ️  .env à la racine n'est pas tracké"
git rm --cached frontend/stemadeleine/.env 2>/dev/null || echo "  ℹ️  frontend/stemadeleine/.env n'est pas tracké"
git rm --cached backend/api/.env 2>/dev/null || echo "  ℹ️  backend/api/.env n'est pas tracké"
git rm --cached frontend/backoffice/.env 2>/dev/null || echo "  ℹ️  frontend/backoffice/.env n'est pas tracké"

echo ""
echo "✅ Nettoyage terminé !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Vérifiez les fichiers supprimés avec : git status"
echo "2. Committez les changements : git commit -m 'chore: remove .env files from git'"
echo "3. Poussez sur GitHub : git push origin main"
echo ""
echo "⚠️  Vos fichiers .env locaux sont toujours présents et ne seront pas supprimés"

