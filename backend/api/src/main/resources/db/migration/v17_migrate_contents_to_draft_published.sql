-- V17__migrate_contents_to_draft_published.sql
--
-- Migration du système de versioning des contents vers un modèle
-- comportant au maximum :
--   - 1 DRAFT
--   - 1 PUBLISHED
--
-- Principe :
--   - conservation de la dernière version PUBLISHED
--   - conservation de la dernière version DRAFT
--   - création d'un DRAFT depuis PUBLISHED lorsqu'aucun DRAFT n'existe
--   - suppression des anciennes versions
--
-- IMPORTANT :
--   - Les anciennes relations ne sont JAMAIS transférées vers les
--     versions conservées.
--   - Les relations des versions conservées restent inchangées.
--   - content_media des anciennes versions est supprimé.
--   - Si un nouveau DRAFT est créé, ses médias sont copiés depuis
--     le PUBLISHED conservé.
--   - Cette migration ne crée PAS encore de contrainte UNIQUE
--     (content_id, status).

BEGIN;

-- ============================================================
-- 1. Index utiles
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_contents_content_id_status
    ON public.contents (content_id, status);

CREATE INDEX IF NOT EXISTS idx_contents_owner_id_status
    ON public.contents (owner_id, status);


-- ============================================================
-- 2. Détermination des versions à conserver
-- ============================================================
--
-- Pour chaque content_id :
--   - published_id = dernier PUBLISHED
--   - draft_id     = dernier DRAFT
--
-- Le classement est :
--   1. version DESC
--   2. updated_at DESC
--   3. id DESC
--
-- afin d'avoir un choix déterministe en cas d'égalité.
--
-- draft_created indique si V17 crée elle-même le DRAFT.
--

CREATE TEMP TABLE content_version_map
(
    content_id        UUID PRIMARY KEY,

    published_id      UUID,
    published_version INTEGER,

    draft_id          UUID,
    draft_version     INTEGER,

    draft_created     BOOLEAN NOT NULL DEFAULT FALSE
) ON COMMIT DROP;


INSERT INTO content_version_map (content_id,
                                 published_id,
                                 published_version,
                                 draft_id,
                                 draft_version)
SELECT c.content_id,

       (SELECT p.id
        FROM public.contents p
        WHERE p.content_id = c.content_id
          AND p.status = 'PUBLISHED'
        ORDER BY p.version DESC,
                 p.updated_at DESC,
                 p.id DESC
        LIMIT 1),

       (SELECT p.version
        FROM public.contents p
        WHERE p.content_id = c.content_id
          AND p.status = 'PUBLISHED'
        ORDER BY p.version DESC,
                 p.updated_at DESC,
                 p.id DESC
        LIMIT 1),

       (SELECT d.id
        FROM public.contents d
        WHERE d.content_id = c.content_id
          AND d.status = 'DRAFT'
        ORDER BY d.version DESC,
                 d.updated_at DESC,
                 d.id DESC
        LIMIT 1),

       (SELECT d.version
        FROM public.contents d
        WHERE d.content_id = c.content_id
          AND d.status = 'DRAFT'
        ORDER BY d.version DESC,
                 d.updated_at DESC,
                 d.id DESC
        LIMIT 1)

FROM public.contents c
GROUP BY c.content_id;


-- ============================================================
-- 3. Création des DRAFT manquants
-- ============================================================
--
-- S'il existe un PUBLISHED mais aucun DRAFT :
--
--   PUBLISHED V6
--        ↓
--   nouveau DRAFT V7
--
-- Le nouveau DRAFT reprend les données métier du PUBLISHED.
--

INSERT INTO public.contents (content_id,
                             title,
                             description,
                             body,
                             sort_order,
                             is_visible,
                             owner_id,
                             status,
                             version,
                             author_id,
                             created_at,
                             updated_at)
SELECT p.content_id,
       p.title,
       p.description,
       p.body,
       p.sort_order,
       p.is_visible,
       p.owner_id,
       'DRAFT',
       p.version + 1,
       p.author_id,
       p.created_at,
       p.updated_at

FROM public.contents p

         JOIN content_version_map m
              ON m.content_id = p.content_id
                  AND m.published_id = p.id

WHERE m.draft_id IS NULL;


-- ============================================================
-- 4. Mise à jour de la map après création des DRAFT
-- ============================================================
--
-- On récupère les nouveaux DRAFT créés.
--
-- draft_created = TRUE permet ensuite de savoir que ce DRAFT
-- n'existait pas avant la migration et qu'il faut donc lui
-- copier les médias du PUBLISHED.
--

UPDATE content_version_map m
SET draft_id      = d.id,
    draft_version = d.version,
    draft_created = TRUE

FROM public.contents d

WHERE d.content_id = m.content_id
  AND d.status = 'DRAFT'
  AND m.draft_id IS NULL

  AND d.id = (SELECT d2.id
              FROM public.contents d2
              WHERE d2.content_id = m.content_id
                AND d2.status = 'DRAFT'
              ORDER BY d2.version DESC,
                       d2.updated_at DESC,
                       d2.id DESC
              LIMIT 1);


-- ============================================================
-- 5. Vérification préliminaire
-- ============================================================
--
-- Chaque content_id doit maintenant avoir :
--   - au maximum 1 PUBLISHED
--   - au maximum 1 DRAFT
--
-- On vérifie aussi qu'un content_id possède au moins une
-- version conservable.
--

DO
$$
    DECLARE
        invalid_map_count INTEGER;
    BEGIN

        SELECT COUNT(*)
        INTO invalid_map_count
        FROM content_version_map
        WHERE published_id IS NULL
          AND draft_id IS NULL;

        IF invalid_map_count > 0 THEN
            RAISE EXCEPTION
                'V17 failed: content_id without PUBLISHED or DRAFT after migration preparation';
        END IF;

    END
$$;


-- ============================================================
-- 6. Nettoyage article_content
-- ============================================================
--
-- IMPORTANT :
-- Les relations des anciennes versions ne sont PAS transférées.
--
-- Si une relation pointe vers une ancienne version, elle est
-- supprimée.
--
-- Les relations existantes du PUBLISHED/DRAFT conservé restent
-- inchangées.
--
-- Exemple :
--
--   Article → V1
--   Article → V4
--
-- Si V4 est conservé :
--
--   Article → V1   supprimé
--   Article → V4   conservé
--

DELETE
FROM public.article_content ac
    USING public.contents old_content
        JOIN content_version_map m
        ON m.content_id = old_content.content_id

WHERE ac.content_id = old_content.id

  AND old_content.id <> COALESCE(
        m.published_id,
        m.draft_id
                        );


-- ============================================================
-- 7. Nettoyage news_content
-- ============================================================

DELETE
FROM public.news_content nc
    USING public.contents old_content
        JOIN content_version_map m
        ON m.content_id = old_content.content_id

WHERE nc.content_id = old_content.id

  AND old_content.id <> COALESCE(
        m.published_id,
        m.draft_id
                        );


-- ============================================================
-- 8. Nettoyage newsletter_content
-- ============================================================

DELETE
FROM public.newsletter_content nc
    USING public.contents old_content
        JOIN content_version_map m
        ON m.content_id = old_content.content_id

WHERE nc.content_id = old_content.id

  AND old_content.id <> COALESCE(
        m.published_id,
        m.draft_id
                        );


-- ============================================================
-- 9. Nettoyage section_content
-- ============================================================

DELETE
FROM public.section_content sc
    USING public.contents old_content
        JOIN content_version_map m
        ON m.content_id = old_content.content_id

WHERE sc.content_id = old_content.id

  AND old_content.id <> COALESCE(
        m.published_id,
        m.draft_id
                        );


-- ============================================================
-- 10. Nettoyage content_media
-- ============================================================
--
-- C'est volontairement différent d'un remapping.
--
-- Nous NE faisons PAS :
--
--   UPDATE content_media
--   SET content_id = nouveau_content_id
--
-- Les médias des anciennes versions doivent disparaître avec
-- leurs anciennes versions.
--
-- Les relations des versions conservées restent exactement
-- comme elles sont.
--
-- Exemple :
--
--   V1 → A B
--   V2 → B C
--   V3 → C D
--   V4 → D E   ← conservé
--   V5 → E F   ← conservé
--
-- Après :
--
--   V4 → D E
--   V5 → E F
--
-- A, B et C ne sont pas ajoutés à V4/V5.
--

DELETE
FROM public.content_media cm
    USING public.contents old_content
        JOIN content_version_map m
        ON m.content_id = old_content.content_id

WHERE cm.content_id = old_content.id

  AND old_content.id <> COALESCE(
        m.published_id,
        m.draft_id
                        );


-- ============================================================
-- 11. Copie des médias pour les nouveaux DRAFT
-- ============================================================
--
-- Ce bloc ne s'exécute QUE pour les DRAFT créés par V17.
--
-- Exemple :
--
--   V6 PUBLISHED → A B
--   aucun DRAFT
--
-- V17 crée :
--
--   V7 DRAFT → A B
--
-- Les médias sont donc copiés.
--
-- En revanche :
--
--   V4 PUBLISHED → D E
--   V5 DRAFT     → E F
--
-- V5 existe déjà :
--   aucune copie
--   V5 conserve exactement E F.
--

INSERT INTO public.content_media (content_id,
                                  media_id,
                                  sort_order,
                                  created_at,
                                  updated_at)
SELECT m.draft_id,
       cm.media_id,
       cm.sort_order,
       cm.created_at,
       cm.updated_at

FROM content_version_map m

         JOIN public.content_media cm
              ON cm.content_id = m.published_id

WHERE m.draft_created = TRUE
  AND m.draft_id IS NOT NULL
  AND m.published_id IS NOT NULL

  AND NOT EXISTS (SELECT 1
                  FROM public.content_media existing
                  WHERE existing.content_id = m.draft_id
                    AND existing.media_id = cm.media_id);


-- ============================================================
-- 12. Suppression des anciennes versions de contents
-- ============================================================
--
-- On conserve :
--   - le dernier PUBLISHED
--   - le dernier DRAFT
--
-- Tout le reste est supprimé.
--
-- Les relations des anciennes versions ont déjà été supprimées
-- aux étapes précédentes afin de respecter les FK.
--

DELETE
FROM public.contents c
    USING content_version_map m

WHERE c.content_id = m.content_id

  AND c.id <> COALESCE(
        m.published_id,
        m.draft_id
              )

  AND c.id <> m.draft_id;


-- ============================================================
-- 13. Vérifications finales
-- ============================================================

DO
$$
    DECLARE
        invalid_content_count   INTEGER;
        duplicate_status_count  INTEGER;
        orphan_media_count      INTEGER;
        orphan_article_count    INTEGER;
        orphan_news_count       INTEGER;
        orphan_newsletter_count INTEGER;
        orphan_section_count    INTEGER;
    BEGIN

        -- --------------------------------------------------------
        -- Statuts invalides
        -- --------------------------------------------------------

        SELECT COUNT(*)
        INTO invalid_content_count

        FROM public.contents c

        WHERE c.status NOT IN (
                               'DRAFT',
                               'PUBLISHED',
                               'DELETED',
                               'ARCHIVED'
            );

        IF invalid_content_count > 0 THEN
            RAISE EXCEPTION
                'V17 failed: invalid publishing status found in contents';
        END IF;


        -- --------------------------------------------------------
        -- Plusieurs DRAFT/PUBLISHED pour un même content_id
        -- --------------------------------------------------------

        SELECT COUNT(*)
        INTO duplicate_status_count

        FROM (SELECT content_id,
                     status

              FROM public.contents

              WHERE status IN (
                               'DRAFT',
                               'PUBLISHED'
                  )

              GROUP BY content_id,
                       status

              HAVING COUNT(*) > 1) duplicates;


        IF duplicate_status_count > 0 THEN
            RAISE EXCEPTION
                'V17 failed: duplicate DRAFT/PUBLISHED rows remain';
        END IF;


        -- --------------------------------------------------------
        -- content_media orphelins
        -- --------------------------------------------------------

        SELECT COUNT(*)
        INTO orphan_media_count

        FROM public.content_media cm

                 LEFT JOIN public.contents c
                           ON c.id = cm.content_id

        WHERE c.id IS NULL;


        IF orphan_media_count > 0 THEN
            RAISE EXCEPTION
                'V17 failed: orphan content_media relations remain';
        END IF;


        -- --------------------------------------------------------
        -- article_content orphelins
        -- --------------------------------------------------------

        SELECT COUNT(*)
        INTO orphan_article_count

        FROM public.article_content ac

                 LEFT JOIN public.contents c
                           ON c.id = ac.content_id

        WHERE c.id IS NULL;


        IF orphan_article_count > 0 THEN
            RAISE EXCEPTION
                'V17 failed: orphan article_content relations remain';
        END IF;


        -- --------------------------------------------------------
        -- news_content orphelins
        -- --------------------------------------------------------

        SELECT COUNT(*)
        INTO orphan_news_count

        FROM public.news_content nc

                 LEFT JOIN public.contents c
                           ON c.id = nc.content_id

        WHERE c.id IS NULL;


        IF orphan_news_count > 0 THEN
            RAISE EXCEPTION
                'V17 failed: orphan news_content relations remain';
        END IF;


        -- --------------------------------------------------------
        -- newsletter_content orphelins
        -- --------------------------------------------------------

        SELECT COUNT(*)
        INTO orphan_newsletter_count

        FROM public.newsletter_content nc

                 LEFT JOIN public.contents c
                           ON c.id = nc.content_id

        WHERE c.id IS NULL;


        IF orphan_newsletter_count > 0 THEN
            RAISE EXCEPTION
                'V17 failed: orphan newsletter_content relations remain';
        END IF;


        -- --------------------------------------------------------
        -- section_content orphelins
        -- --------------------------------------------------------

        SELECT COUNT(*)
        INTO orphan_section_count

        FROM public.section_content sc

                 LEFT JOIN public.contents c
                           ON c.id = sc.content_id

        WHERE c.id IS NULL;


        IF orphan_section_count > 0 THEN
            RAISE EXCEPTION
                'V17 failed: orphan section_content relations remain';
        END IF;

    END
$$;


-- ============================================================
-- 14. Fin de migration
-- ============================================================

COMMIT;