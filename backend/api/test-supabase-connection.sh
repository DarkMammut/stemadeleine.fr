#!/bin/bash

# Script pour tester la connexion à la base de données Supabase
# Usage: ./test-supabase-connection.sh

set -e

echo "🔍 Test de connexion à la base de données Supabase..."
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Charger les variables d'environnement
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | grep -v '^$' | xargs)
else
    echo -e "${RED}❌ Fichier .env.local non trouvé${NC}"
    exit 1
fi

# Vérifier que les variables sont définies
if [ -z "$SUPABASE_DB_PASSWORD" ] || [ "$SUPABASE_DB_PASSWORD" = "CHANGEZ_MOI_AVEC_VOTRE_MOT_DE_PASSE_SUPABASE" ]; then
    echo -e "${RED}❌ SUPABASE_DB_PASSWORD n'est pas configuré${NC}"
    echo ""
    echo "📖 Pour récupérer votre mot de passe Supabase :"
    echo "1. Allez sur https://supabase.com/dashboard/project/eahwfewbtyndxbqfifuh/settings/database"
    echo "2. Cliquez sur 'Reset database password'"
    echo "3. Copiez le mot de passe généré"
    echo "4. Mettez-le à jour dans backend/api/.env.local"
    echo ""
    echo "Consultez SUPABASE_PASSWORD_RECOVERY.md pour plus de détails"
    exit 1
fi

# Extraire l'URL sans le préfixe jdbc:
DB_URL=$(echo "$SUPABASE_DB_URL" | sed 's/jdbc://')
DB_HOST=$(echo "$DB_URL" | sed 's|postgresql://||' | cut -d'/' -f1)
DB_NAME=$(echo "$DB_URL" | sed 's|.*/||')

echo "📊 Configuration détectée :"
echo "   Host: $DB_HOST"
echo "   Database: $DB_NAME"
echo "   User: $SUPABASE_DB_USER"
echo "   Password: ${SUPABASE_DB_PASSWORD:0:4}****${SUPABASE_DB_PASSWORD: -4}"
echo ""

# Vérifier si psql est installé
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  psql n'est pas installé, test via Java Spring Boot...${NC}"
    echo ""
    echo "🚀 Démarrage de l'application Spring Boot..."
    ./mvnw spring-boot:run -Dspring-boot.run.arguments=--spring.jpa.show-sql=false 2>&1 | grep -A 5 "HikariPool" || {
        echo -e "${RED}❌ Échec de la connexion à la base de données${NC}"
        echo ""
        echo "💡 Vérifiez que :"
        echo "   1. Le mot de passe est correct"
        echo "   2. Votre IP est autorisée dans Supabase (Settings > Database > Connection pooling)"
        echo "   3. La base de données existe et est accessible"
        exit 1
    }
    echo -e "${GREEN}✅ Connexion réussie !${NC}"
    exit 0
fi

# Test avec psql si disponible
echo "🔌 Test de connexion avec psql..."
PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$(echo $DB_HOST | cut -d':' -f1)" \
    -p "$(echo $DB_HOST | cut -d':' -f2)" \
    -U "$SUPABASE_DB_USER" \
    -d "$DB_NAME" \
    -c "SELECT version();" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Connexion à la base de données réussie !${NC}"
    echo ""

    # Tester quelques requêtes
    echo "📋 Informations sur la base de données :"
    PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$(echo $DB_HOST | cut -d':' -f1)" \
        -p "$(echo $DB_HOST | cut -d':' -f2)" \
        -U "$SUPABASE_DB_USER" \
        -d "$DB_NAME" \
        -t -c "SELECT version();" | head -n 1

    echo ""
    echo "📊 Tables existantes :"
    PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$(echo $DB_HOST | cut -d':' -f1)" \
        -p "$(echo $DB_HOST | cut -d':' -f2)" \
        -U "$SUPABASE_DB_USER" \
        -d "$DB_NAME" \
        -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "   Aucune table trouvée (normal si c'est la première connexion)"

    echo ""
    echo -e "${GREEN}🎉 Tout est prêt pour le déploiement !${NC}"
else
    echo -e "${RED}❌ Échec de la connexion à la base de données${NC}"
    echo ""
    echo "💡 Causes possibles :"
    echo "   1. Mot de passe incorrect → Réinitialisez-le sur Supabase"
    echo "   2. IP non autorisée → Vérifiez les paramètres réseau dans Supabase"
    echo "   3. Base de données en maintenance → Vérifiez le statut sur Supabase"
    echo ""
    echo "📖 Consultez SUPABASE_PASSWORD_RECOVERY.md pour plus d'aide"
    exit 1
fi

