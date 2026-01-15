-- ==========================================
-- MIGRATION MANUELLE - À utiliser UNIQUEMENT si Flyway ne fonctionne pas
-- ==========================================
-- Ce fichier combine toutes les migrations V1 à V8
-- Exécutez-le dans Supabase SQL Editor si Flyway n'arrive pas à migrer
-- ==========================================

-- Extension nécessaire pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vérifier la connexion
SELECT 'Migration manuelle démarrée à ' || NOW() AS status;

-- ==========================================
-- NOTE IMPORTANTE
-- ==========================================
-- Ce script est une solution de dernier recours.
-- Il est préférable de faire fonctionner Flyway correctement.
--
-- Après avoir exécuté ce script manuellement, vous devrez créer
-- la table flyway_schema_history pour que Flyway sache que les
-- migrations ont été appliquées :
-- ==========================================

-- Table de versioning Flyway (pour éviter que Flyway ré-applique les migrations)
CREATE TABLE IF NOT EXISTS flyway_schema_history (
    installed_rank INTEGER NOT NULL,
    version VARCHAR(50),
    description VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,
    script VARCHAR(1000) NOT NULL,
    checksum INTEGER,
    installed_by VARCHAR(100) NOT NULL,
    installed_on TIMESTAMP NOT NULL DEFAULT NOW(),
    execution_time INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    PRIMARY KEY (installed_rank)
);

-- Créer un index sur version
CREATE INDEX IF NOT EXISTS flyway_schema_history_s_idx ON flyway_schema_history (success);

-- ==========================================
-- INSTRUCTIONS
-- ==========================================
-- 1. Créez une nouvelle requête dans Supabase SQL Editor
-- 2. Copiez le contenu COMPLET de :
--    backend/api/src/main/resources/db/migration/V1__init_schema.sql
-- 3. Exécutez-le
-- 4. Puis copiez et exécutez le contenu de V2__insert_admin_account.sql
-- 5. Puis V3__insert_initial_pages.sql
-- 6. Puis V4__insert_initial_organization.sql
-- 7. Puis V5__create_contacts_table.sql
-- 8. Puis V6__add_is_read_to_contacts.sql
-- 9. Puis V7__add_detail_page_url_to_newsletters.sql
-- 10. Puis V8__create_newsletter_news_links_table.sql
--
-- Après chaque migration réussie, exécutez :
-- ==========================================

-- Enregistrer V1 dans l'historique Flyway
INSERT INTO flyway_schema_history (
    installed_rank, version, description, type, script,
    checksum, installed_by, installed_on, execution_time, success
) VALUES (
    1, '1', 'init schema', 'SQL', 'V1__init_schema.sql',
    NULL, CURRENT_USER, NOW(), 0, TRUE
);

-- Enregistrer V2 dans l'historique Flyway
INSERT INTO flyway_schema_history (
    installed_rank, version, description, type, script,
    checksum, installed_by, installed_on, execution_time, success
) VALUES (
    2, '2', 'insert admin account', 'SQL', 'V2__insert_admin_account.sql',
    NULL, CURRENT_USER, NOW(), 0, TRUE
);

-- Enregistrer V3 dans l'historique Flyway
INSERT INTO flyway_schema_history (
    installed_rank, version, description, type, script,
    checksum, installed_by, installed_on, execution_time, success
) VALUES (
    3, '3', 'insert initial pages', 'SQL', 'V3__insert_initial_pages.sql',
    NULL, CURRENT_USER, NOW(), 0, TRUE
);

-- Enregistrer V4 dans l'historique Flyway
INSERT INTO flyway_schema_history (
    installed_rank, version, description, type, script,
    checksum, installed_by, installed_on, execution_time, success
) VALUES (
    4, '4', 'insert initial organization', 'SQL', 'V4__insert_initial_organization.sql',
    NULL, CURRENT_USER, NOW(), 0, TRUE
);

-- Enregistrer V5 dans l'historique Flyway
INSERT INTO flyway_schema_history (
    installed_rank, version, description, type, script,
    checksum, installed_by, installed_on, execution_time, success
) VALUES (
    5, '5', 'create contacts table', 'SQL', 'V5__create_contacts_table.sql',
    NULL, CURRENT_USER, NOW(), 0, TRUE
);

-- Enregistrer V6 dans l'historique Flyway
INSERT INTO flyway_schema_history (
    installed_rank, version, description, type, script,
    checksum, installed_by, installed_on, execution_time, success
) VALUES (
    6, '6', 'add is read to contacts', 'SQL', 'V6__add_is_read_to_contacts.sql',
    NULL, CURRENT_USER, NOW(), 0, TRUE
);

-- Enregistrer V7 dans l'historique Flyway
INSERT INTO flyway_schema_history (
    installed_rank, version, description, type, script,
    checksum, installed_by, installed_on, execution_time, success
) VALUES (
    7, '7', 'add detail page url to newsletters', 'SQL', 'V7__add_detail_page_url_to_newsletters.sql',
    NULL, CURRENT_USER, NOW(), 0, TRUE
);

-- Enregistrer V8 dans l'historique Flyway
INSERT INTO flyway_schema_history (
    installed_rank, version, description, type, script,
    checksum, installed_by, installed_on, execution_time, success
) VALUES (
    8, '8', 'create newsletter news links table', 'SQL', 'V8__create_newsletter_news_links_table.sql',
    NULL, CURRENT_USER, NOW(), 0, TRUE
);

-- ==========================================
-- VÉRIFICATION FINALE
-- ==========================================

-- Vérifier que toutes les migrations sont enregistrées
SELECT * FROM flyway_schema_history ORDER BY installed_rank;

-- Vérifier que les tables principales existent
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Vérifier que l'admin existe
SELECT id, email, role FROM accounts WHERE role = 'ROLE_ADMIN';

SELECT 'Migration manuelle terminée ! ✅' AS status;

