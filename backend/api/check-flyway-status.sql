-- Vérifier l'état actuel de Flyway dans Supabase
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Voir le contenu de flyway_schema_history
SELECT *
FROM flyway_schema_history
ORDER BY installed_rank;

-- 2. Vérifier si l'extension uuid-ossp existe
SELECT *
FROM pg_extension
WHERE extname = 'uuid-ossp';

-- 3. Lister toutes les tables existantes
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 4. Vérifier les types ENUM (devraient être créés par V1)
SELECT typname
FROM pg_type
WHERE typtype = 'e'
  AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY typname;

