#!/bin/bash

# Script pour résoudre le conflit Git
# Ce script va commiter vos modifications locales puis faire un pull avec rebase

set -e  # Arrêter en cas d'erreur

echo "🔍 État actuel du dépôt Git..."
git status

echo ""
echo "📦 Ajout de tous les fichiers modifiés..."
git add .

echo ""
echo "💾 Commit des modifications locales..."
git commit -m "feat: add favicon support, fix text overflow, and update organization settings

- Add dynamic favicon support for organizations
- Add favicon field to Organization model and database
- Create DynamicFavicon components for backoffice and frontoffice
- Fix text overflow issues in Contents, Hero, and NewsletterMagazine components
- Add OrganizationSettingsDTO for better API structure
- Add migration V9 for favicon field
- Add test scripts for favicon functionality
- Update documentation with favicon guides"

echo ""
echo "🔄 Pull avec rebase pour intégrer les changements distants..."
git pull --rebase origin main

echo ""
echo "✅ Synchronisation terminée!"
echo ""
echo "📊 État final:"
git status

echo ""
echo "📝 Historique récent:"
git log --oneline -5
