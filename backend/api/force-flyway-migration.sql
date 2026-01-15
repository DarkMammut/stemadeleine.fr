-- ==========================================
-- SCRIPT RAPIDE : Forcer Flyway à migrer
-- ==========================================
-- Exécutez ce script dans Supabase SQL Editor
-- Puis redéployez sur Render
-- ==========================================

-- 1. Créer l'extension UUID nécessaire
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Créer l'extension pgcrypto (nécessaire pour V2)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. Supprimer la table Flyway pour forcer une nouvelle migration
DROP TABLE IF EXISTS flyway_schema_history CASCADE;

-- 4. Vérifier que tout est prêt
SELECT
    'Extension uuid-ossp créée ✅' AS status,
    COUNT(*) AS nb_extensions
FROM pg_extension
WHERE extname = 'uuid-ossp';

SELECT
    'Extension pgcrypto créée ✅' AS status,
    COUNT(*) AS nb_extensions
FROM pg_extension
WHERE extname = 'pgcrypto';

SELECT
    'Table flyway_schema_history supprimée ✅' AS status,
    NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'flyway_schema_history'
    ) AS is_deleted;

-- ==========================================
-- PROCHAINES ÉTAPES
-- ==========================================
-- 1. Ce script est terminé ✅
-- 2. Les migrations ont été corrigées avec le schéma public. ✅
-- 3. Allez sur Render Dashboard
-- 4. Cliquez sur "Manual Deploy" → "Clear build cache & deploy"
-- 5. Attendez 10 minutes
-- 6. Revenez dans Supabase → Database → Tables
-- 7. Vous devriez voir toutes vos tables créées ! 🎉
-- ==========================================

SELECT '🚀 Prêt pour le redéploiement Render !' AS message;

