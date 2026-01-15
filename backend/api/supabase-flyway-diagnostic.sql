-- Script de diagnostic et préparation Supabase pour Flyway
-- Exécutez ce script dans Supabase SQL Editor AVANT de déployer sur Render

-- =====================================================
-- 1. Vérifier la connexion et les permissions
-- =====================================================
SELECT current_user, current_database();

-- =====================================================
-- 2. Créer l'extension UUID (nécessaire pour Flyway)
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vérifier que l'extension est créée
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';

-- =====================================================
-- 3. Vérifier les permissions sur le schéma public
-- =====================================================
SELECT
    nspname AS schema_name,
    nspowner::regrole AS owner,
    has_schema_privilege(current_user, nspname, 'CREATE') AS can_create,
    has_schema_privilege(current_user, nspname, 'USAGE') AS can_use
FROM pg_namespace
WHERE nspname = 'public';

-- =====================================================
-- 4. Vérifier si Flyway a déjà créé sa table de versioning
-- =====================================================
SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'flyway_schema_history'
) AS flyway_table_exists;

-- Si true, voir l'historique des migrations
-- SELECT * FROM flyway_schema_history ORDER BY installed_rank;

-- =====================================================
-- 5. Lister toutes les tables existantes
-- =====================================================
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- 6. Vérifier les types ENUM nécessaires
-- =====================================================
SELECT
    t.typname AS enum_name,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) AS enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN (
    'publishing_status',
    'article_variants',
    'field_input_type',
    'gallery_variants',
    'cta_variants',
    'news_variants',
    'timeline_variants',
    'list_variants',
    'payment_status',
    'payment_type',
    'roles'
)
GROUP BY t.typname
ORDER BY t.typname;

-- =====================================================
-- RÉSULTATS ATTENDUS
-- =====================================================
-- 1. current_user devrait être : postgres.eahwfewbtyndxbqfifuh
-- 2. L'extension uuid-ossp devrait être listée
-- 3. can_create et can_use devraient être TRUE
-- 4. flyway_table_exists devrait être FALSE (première fois) ou TRUE (déjà migré)
-- 5. Si TRUE, vous devriez voir vos tables (users, accounts, pages, etc.)
-- 6. Devrait retourner 0 lignes (ENUMs pas encore créés) ou 11 lignes (déjà créés)

