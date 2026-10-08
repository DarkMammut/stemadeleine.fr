-- V18__draft_published_pages_sections_modules.sql
--
-- Passage des pages, sections et modules au modèle DRAFT / PUBLISHED
-- (1 ligne DRAFT + 1 ligne PUBLISHED par identifiant logique).
--
-- La normalisation des données existantes (archivage des anciennes versions,
-- création des DRAFT manquants, rattachement des relations) est faite au
-- démarrage par DraftPublishedMigrationRunner, de façon idempotente.
--
-- Cette migration ne prépare que le schéma :
--   - index (id logique, statut)
--   - le média d'un module news / newsletter / form est désormais partagé entre
--     la ligne DRAFT et la ligne PUBLISHED (OneToOne -> ManyToOne) : on retire
--     les éventuelles contraintes d'unicité sur media_id.

CREATE INDEX IF NOT EXISTS idx_pages_page_id_status ON public.pages (page_id, status);
CREATE INDEX IF NOT EXISTS idx_pages_slug_status ON public.pages (slug, status);
CREATE INDEX IF NOT EXISTS idx_sections_section_id_status ON public.sections (section_id, status);
CREATE INDEX IF NOT EXISTS idx_modules_module_id_status ON public.modules (module_id, status);

DO
$$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN
            SELECT con.conname, rel.relname
            FROM pg_constraint con
                     JOIN pg_class rel ON rel.oid = con.conrelid
                     JOIN pg_namespace ns ON ns.oid = rel.relnamespace
            WHERE ns.nspname = 'public'
              AND rel.relname IN ('news', 'newsletters', 'form')
              AND con.contype = 'u'
              AND (SELECT array_agg(att.attname::text)
                   FROM unnest(con.conkey) k
                            JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = k) = ARRAY ['media_id']
            LOOP
                EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', r.relname, r.conname);
            END LOOP;
    END
$$;
