#!/bin/bash

# Script pour lancer les tests de l'API Ste Madeleine
# Usage: ./run-tests.sh [option]

cd "$(dirname "$0")"

echo "🧪 Tests API Ste Madeleine"
echo "=========================="

case "$1" in
    "unit")
        echo "🏃 Lancement des tests unitaires..."
        ./mvnw test -Dtest="*Test" -q
        ;;
    "controllers")
        echo "🎮 Lancement des tests de contrôleurs..."
        ./mvnw test -Dtest="*Controller*" -q
        ;;
    "services")
        echo "⚙️ Lancement des tests de services..."
        ./mvnw test -Dtest="*Service*" -q
        ;;
    "fast")
        echo "⚡ Lancement des tests rapides (unitaires + contrôleurs)..."
        ./mvnw test -Dtest="*Test,*Controller*" -q
        ;;
    "watch")
        echo "👀 Mode surveillance (relance automatique)..."
        echo "Appuyez sur Ctrl+C pour arrêter"
        ./mvnw test -Dspring-boot.run.fork=false
        ;;
    "parallel")
        echo "🔄 Lancement des tests en parallèle..."
        ./mvnw test -T 1C -q
        ;;
    "")
        echo "🎯 Lancement de tous les tests..."
        ./mvnw test
        ;;
    *)
        echo "❓ Options disponibles:"
        echo "  unit       - Tests unitaires uniquement"
        echo "  controllers- Tests de contrôleurs uniquement"
        echo "  services   - Tests de services uniquement"
        echo "  fast       - Tests rapides (unit + controllers)"
        echo "  watch      - Mode surveillance continue"
        echo "  parallel   - Tests en parallèle"
        echo "  (aucun)    - Tous les tests"
        echo ""
        echo "Exemples:"
        echo "  ./run-tests.sh unit"
        echo "  ./run-tests.sh fast"
        echo "  ./run-tests.sh watch"
        ;;
esac
