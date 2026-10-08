#!/bin/bash

# Script pour tester la configuration email
# Usage: ./test-email-config.sh

echo "🧪 Test de configuration Email"
echo "=============================="
echo ""

# Vérifier que les variables d'environnement sont définies
check_env_var() {
    local var_name=$1
    if [ -z "${!var_name}" ]; then
        echo "❌ $var_name n'est pas définie"
        return 1
    else
        echo "✅ $var_name est définie"
        return 0
    fi
}

echo "📋 Vérification des variables d'environnement:"
echo ""

all_ok=true

check_env_var "MAIL_HOST" || all_ok=false
check_env_var "MAIL_PORT" || all_ok=false
check_env_var "MAIL_USERNAME" || all_ok=false
check_env_var "MAIL_PASSWORD" || all_ok=false
check_env_var "MAIL_FROM" || all_ok=false
check_env_var "MAIL_FROM_NAME" || all_ok=false
check_env_var "FRONTEND_URL" || all_ok=false

echo ""

if [ "$all_ok" = false ]; then
    echo "❌ Certaines variables d'environnement manquent"
    echo ""
    echo "Veuillez ajouter ces variables dans votre .env ou les exporter:"
    echo ""
    echo "export MAIL_HOST=smtp.gmail.com"
    echo "export MAIL_PORT=587"
    echo "export MAIL_USERNAME=your-email@gmail.com"
    echo "export MAIL_PASSWORD=your-app-password"
    echo "export MAIL_FROM=noreply@stemadeleine.fr"
    echo "export MAIL_FROM_NAME='Sainte Madeleine'"
    echo "export FRONTEND_URL=http://localhost:3000"
    exit 1
fi

echo "✅ Toutes les variables d'environnement sont définies"
echo ""
echo "📧 Configuration actuelle:"
echo "   Host: $MAIL_HOST"
echo "   Port: $MAIL_PORT"
echo "   From: $MAIL_FROM_NAME <$MAIL_FROM>"
echo "   Username: $MAIL_USERNAME"
echo "   Frontend URL: $FRONTEND_URL"
echo ""
echo "💡 Pour tester l'envoi d'email:"
echo "   1. Démarrez l'application backend"
echo "   2. Utilisez l'interface /auth/forgot-password"
echo "   3. Ou utilisez curl:"
echo ""
echo "   curl -X POST http://localhost:8080/api/auth/forgot-password \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"test@example.com\"}'"
echo ""
