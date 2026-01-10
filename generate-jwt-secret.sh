#!/usr/bin/env bash
# Script pour générer une clé JWT sécurisée

echo "🔐 Génération d'une clé JWT sécurisée..."
echo ""

JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')

echo "Votre nouvelle clé JWT :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$JWT_SECRET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Copiez cette clé et utilisez-la comme valeur pour JWT_SECRET_KEY"
echo "   dans vos variables d'environnement sur Render"
echo ""
echo "⚠️  IMPORTANT : Gardez cette clé secrète et ne la partagez jamais !"

