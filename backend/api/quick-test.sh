#!/bin/bash

# Test rapide pour vérifier si les tests de contrôleurs fonctionnent
cd "$(dirname "$0")"

echo "🧪 Test des contrôleurs PageController (corrigés)..."
echo "=================================================="

# Test avec compilation forcée pour nettoyer le cache
./mvnw clean test -Dtest="PageController*" -q

echo ""
echo "✅ Test terminé !"
echo ""
echo "Si les tests passent, tous les problèmes suivants ont été résolus :"
echo "- ✅ Erreurs 401 → 200 (authentification ajoutée)"
echo "- ✅ Beans JwtUtil et JwtAuthenticationFilter mockés"
echo "- ✅ Tests alignés avec la configuration de sécurité actuelle"
echo "- ✅ Configuration TestConfig nettoyée"
