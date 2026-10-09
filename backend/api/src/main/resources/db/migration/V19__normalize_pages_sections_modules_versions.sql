-- V19__normalize_pages_sections_modules_versions.sql
--
-- Nettoyage des données existantes : on ne garde que 2 lignes par identifiant logique
-- (page_id, section_id, module_id) :
--   - 1 ligne "brouillon"  : DRAFT ou DELETED
--   - 1 ligne "publication": PUBLISHED ou ARCHIVED
--
-- Règles, selon le statut de la DERNIÈRE version (version DESC, updated_at DESC, id DESC) :
--   - DELETED   : on supprime toutes les versions précédentes, on garde la ligne (DELETED)
--                 et on la duplique en ARCHIVED.
--   - ARCHIVED  : on supprime toutes les versions précédentes, on garde la ligne (ARCHIVED)
--                 et on la duplique en DELETED.
--   - PUBLISHED : on garde la ligne et on la duplique en DRAFT.
--   - DRAFT     : on garde la ligne, et on garde aussi la dernière version précédente dont le
--                 statut est DELETED / ARCHIVED / PUBLISHED (DELETED devient ARCHIVED).
--                 S'il n'y en a pas (jamais publié), le DRAFT reste seul.
--   - Un identifiant qui est déjà dans un état valide (exactement 2 lignes : une DRAFT/DELETED
--     et une PUBLISHED/ARCHIVED, hors couple DELETED + PUBLISHED) n'est pas modifié.
--
-- Relations :
--   - pages.parent_page_id, sections.page_id, modules.section_id sont re-pointés vers la ligne
--     du même côté (brouillon -> brouillon, publication -> publication). Si le parent n'a pas
--     de ligne côté publication, la ligne publiée est rattachée au parent brouillon et passe
--     ARCHIVED.
--   - Un enfant DRAFT d'un parent DELETED passe DELETED, un enfant PUBLISHED d'un parent
--     ARCHIVED passe ARCHIVED.
--   - Les lignes dupliquées reçoivent leur propre copie des données spécifiques au type de module
--     (articles, news, newsletters, gallery, timelines, lists, form, cta), de la liste
--     d'items (list_contents + list_content_media), des champs de formulaire (field,
--     form_fields), des médias de galerie, de article_content et de section_content.
--   - Les médias (media) et les contents (rattachés par owner_id = id logique) sont partagés
--     et ne sont ni copiés ni supprimés ; seules les références vers les lignes supprimées
--     (contents.article_id, news_id, newsletter_id, timeline_id) sont mises à NULL.

CREATE FUNCTION pg_temp.mig_cols(p_table text, p_alias text, p_excluded text[]) RETURNS text AS
$f$
SELECT string_agg(CASE WHEN p_alias = '' THEN quote_ident(column_name)
                       ELSE p_alias || '.' || quote_ident(column_name) END,
                  ', ' ORDER BY ordinal_position)
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = p_table
  AND is_generated = 'NEVER'
  AND NOT (column_name = ANY (p_excluded));
$f$ LANGUAGE sql;

CREATE FUNCTION pg_temp.mig_has_column(p_table text, p_column text) RETURNS boolean AS
$f$
SELECT EXISTS (SELECT 1
               FROM information_schema.columns
               WHERE table_schema = 'public'
                 AND table_name = p_table
                 AND column_name = p_column);
$f$ LANGUAGE sql;

-- Copie les lignes de p_table liées (via p_key) aux lignes sources des éléments dupliqués de
-- p_final, vers les nouvelles lignes. L'éventuel "id" technique est régénéré par sa valeur par défaut.
CREATE FUNCTION pg_temp.mig_copy_children(p_table text, p_key text, p_final text) RETURNS void AS
$f$
DECLARE
    v_cols text;
BEGIN
    IF to_regclass('public.' || quote_ident(p_table)) IS NULL OR NOT pg_temp.mig_has_column(p_table, p_key) THEN
        RETURN;
    END IF;
    v_cols := pg_temp.mig_cols(p_table, '', ARRAY ['id', p_key]);
    EXECUTE format(
            'INSERT INTO public.%1$I (%2$I%3$s) SELECT f.id%4$s FROM %5$I f JOIN public.%1$I s ON s.%2$I = f.src_id WHERE f.is_new',
            p_table, p_key,
            CASE WHEN v_cols IS NULL THEN '' ELSE ', ' || v_cols END,
            CASE WHEN v_cols IS NULL THEN '' ELSE ', ' || pg_temp.mig_cols(p_table, 's', ARRAY ['id', p_key]) END,
            p_final);
END
$f$ LANGUAGE plpgsql;

DO
$mig$
    DECLARE
        t         record;
        s         text;
        v_cols    text;
        v_rows    integer;
        v_rows2   integer;
        v_loops   integer := 0;
        v_invalid integer;
    BEGIN
        -- ====================================================================
        -- 1. Plan : lignes à conserver pour chaque identifiant logique
        --    final_<table> (lid, side, src_id, id, status, is_new)
        --      side   : 'D' brouillon / 'P' publication
        --      src_id : ligne existante dont on part (ligne conservée ou source de la copie)
        --      id     : id de la ligne finale (= src_id si elle existe déjà)
        -- ====================================================================
        FOR t IN SELECT * FROM (VALUES ('pages', 'page_id'), ('sections', 'section_id'), ('modules', 'module_id')) v(tbl, lcol)
            LOOP
                EXECUTE format($q$
            CREATE TEMP TABLE ranked_%1$s ON COMMIT DROP AS
            SELECT id, %2$I AS lid, status::text AS st,
                   row_number() OVER (PARTITION BY %2$I ORDER BY version DESC, updated_at DESC, id DESC) AS rn
            FROM public.%1$I
        $q$, t.tbl, t.lcol);

                EXECUTE format($q$
            CREATE TEMP TABLE final_%1$s ON COMMIT DROP AS
            WITH skip AS (
                SELECT lid
                FROM ranked_%1$s
                GROUP BY lid
                HAVING count(*) = 2
                   AND count(*) FILTER (WHERE st IN ('DRAFT', 'DELETED')) = 1
                   AND count(*) FILTER (WHERE st IN ('PUBLISHED', 'ARCHIVED')) = 1
                   AND NOT (bool_or(st = 'DELETED') AND bool_or(st = 'PUBLISHED'))
            ),
            latest AS (
                SELECT lid, id, st FROM ranked_%1$s WHERE rn = 1 AND lid NOT IN (SELECT lid FROM skip)
            ),
            prev AS (
                SELECT DISTINCT ON (lid) lid, id, st
                FROM ranked_%1$s
                WHERE rn > 1 AND st IN ('DELETED', 'ARCHIVED', 'PUBLISHED')
                ORDER BY lid, rn
            )
            SELECT lid, CASE WHEN st IN ('DRAFT', 'DELETED') THEN 'D' ELSE 'P' END AS side,
                   id AS src_id, id, st AS status, false AS is_new
            FROM ranked_%1$s WHERE lid IN (SELECT lid FROM skip)
            UNION ALL
            SELECT lid, 'D', id, id, 'DELETED', false FROM latest WHERE st = 'DELETED'
            UNION ALL
            SELECT lid, 'P', id, gen_random_uuid(), 'ARCHIVED', true FROM latest WHERE st = 'DELETED'
            UNION ALL
            SELECT lid, 'P', id, id, 'ARCHIVED', false FROM latest WHERE st = 'ARCHIVED'
            UNION ALL
            SELECT lid, 'D', id, gen_random_uuid(), 'DELETED', true FROM latest WHERE st = 'ARCHIVED'
            UNION ALL
            SELECT lid, 'P', id, id, 'PUBLISHED', false FROM latest WHERE st = 'PUBLISHED'
            UNION ALL
            SELECT lid, 'D', id, gen_random_uuid(), 'DRAFT', true FROM latest WHERE st = 'PUBLISHED'
            UNION ALL
            SELECT lid, 'D', id, id, 'DRAFT', false FROM latest WHERE st = 'DRAFT'
            UNION ALL
            SELECT p.lid, 'P', p.id, p.id, CASE WHEN p.st = 'DELETED' THEN 'ARCHIVED' ELSE p.st END, false
            FROM prev p JOIN latest l ON l.lid = p.lid WHERE l.st = 'DRAFT'
        $q$, t.tbl);
            END LOOP;

        -- ====================================================================
        -- 2. Création des lignes dupliquées (pages, sections, modules)
        --    Elles gardent d'abord le parent de leur source, re-pointé à l'étape 5.
        -- ====================================================================
        FOR t IN SELECT * FROM (VALUES ('pages'), ('sections'), ('modules')) v(tbl)
            LOOP
                v_cols := pg_temp.mig_cols(t.tbl, '', ARRAY ['id']);
                EXECUTE format(
                        'INSERT INTO public.%1$I (id, %2$s) SELECT f.id, %3$s FROM final_%1$s f JOIN public.%1$I s ON s.id = f.src_id WHERE f.is_new',
                        t.tbl, v_cols, pg_temp.mig_cols(t.tbl, 's', ARRAY ['id']));
            END LOOP;

        -- Statut des lignes finales (les copies ont celui de leur source, les conservées peuvent changer)
        FOR t IN SELECT * FROM (VALUES ('pages'), ('sections'), ('modules')) v(tbl)
            LOOP
                FOREACH s IN ARRAY ARRAY ['DRAFT', 'DELETED', 'PUBLISHED', 'ARCHIVED']
                    LOOP
                        EXECUTE format(
                                'UPDATE public.%1$I x SET status = %2$L FROM final_%1$s f WHERE x.id = f.id AND f.status = %2$L AND x.status::text <> %2$L',
                                t.tbl, s);
                    END LOOP;
            END LOOP;

        -- ====================================================================
        -- 3. Données propres aux modules dupliqués
        -- ====================================================================
        FOREACH s IN ARRAY ARRAY ['articles', 'news', 'newsletters', 'gallery', 'timelines', 'lists', 'form', 'cta']
            LOOP
                IF to_regclass('public.' || quote_ident(s)) IS NOT NULL THEN
                    EXECUTE format(
                            'INSERT INTO public.%1$I (id, %2$s) SELECT f.id, %3$s FROM final_modules f JOIN public.%1$I s ON s.id = f.src_id WHERE f.is_new',
                            s, coalesce(pg_temp.mig_cols(s, '', ARRAY ['id']), 'id'),
                            coalesce(pg_temp.mig_cols(s, 's', ARRAY ['id']), 's.id'));
                END IF;
            END LOOP;

        PERFORM pg_temp.mig_copy_children('article_content', 'article_id', 'final_modules');
        PERFORM pg_temp.mig_copy_children('gallery_media', 'gallery_id', 'final_modules');
        PERFORM pg_temp.mig_copy_children('gallery_medias', 'gallery_id', 'final_modules');
        PERFORM pg_temp.mig_copy_children('form_fields', 'form_id', 'final_modules');
        PERFORM pg_temp.mig_copy_children('field', 'form_id', 'final_modules');

        -- Items de liste et leurs médias (nouveaux ids pour pouvoir copier list_content_media)
        CREATE TEMP TABLE mig_list_content_map ON COMMIT DROP AS
        SELECT lc.id AS old_id, gen_random_uuid() AS new_id, f.id AS new_list_id
        FROM final_modules f
                 JOIN public.list_contents lc ON lc.list_id = f.src_id
        WHERE f.is_new;

        v_cols := pg_temp.mig_cols('list_contents', '', ARRAY ['id', 'list_id']);
        EXECUTE format(
                'INSERT INTO public.list_contents (id, list_id%1$s) SELECT m.new_id, m.new_list_id%2$s FROM mig_list_content_map m JOIN public.list_contents s ON s.id = m.old_id',
                CASE WHEN v_cols IS NULL THEN '' ELSE ', ' || v_cols END,
                CASE WHEN v_cols IS NULL THEN '' ELSE ', ' || pg_temp.mig_cols('list_contents', 's', ARRAY ['id', 'list_id']) END);

        v_cols := pg_temp.mig_cols('list_content_media', '', ARRAY ['id', 'list_content_id']);
        EXECUTE format(
                'INSERT INTO public.list_content_media (list_content_id%1$s) SELECT m.new_id%2$s FROM mig_list_content_map m JOIN public.list_content_media s ON s.list_content_id = m.old_id',
                CASE WHEN v_cols IS NULL THEN '' ELSE ', ' || v_cols END,
                CASE WHEN v_cols IS NULL THEN '' ELSE ', ' || pg_temp.mig_cols('list_content_media', 's', ARRAY ['id', 'list_content_id']) END);

        PERFORM pg_temp.mig_copy_children('section_content', 'section_id', 'final_sections');

        -- ====================================================================
        -- 4. Re-pointage des parents (même côté : brouillon -> brouillon, publication -> publication)
        -- ====================================================================
        FOR t IN SELECT * FROM (VALUES ('pages', 'parent_page_id', 'pages', 'page_id'),
                                       ('sections', 'page_id', 'pages', 'page_id'),
                                       ('modules', 'section_id', 'sections', 'section_id')) v(child, fk, parent, plid)
            LOOP
                EXECUTE format($q$
            CREATE TEMP TABLE repoint_%1$s ON COMMIT DROP AS
            SELECT f.id AS cid, f.side, same.id AS same_id, other.id AS other_id
            FROM final_%1$s f
                     JOIN public.%1$I c ON c.id = f.id
                     JOIN public.%3$I op ON op.id = c.%2$I
                     LEFT JOIN final_%3$s same ON same.lid = op.%4$I AND same.side = f.side
                     LEFT JOIN final_%3$s other ON other.lid = op.%4$I AND other.side <> f.side
        $q$, t.child, t.fk, t.parent, t.plid);

                EXECUTE format($q$
            UPDATE public.%1$I c
            SET %2$I = COALESCE(r.same_id, r.other_id)
            FROM repoint_%1$s r
            WHERE c.id = r.cid
              AND COALESCE(r.same_id, r.other_id) IS NOT NULL
              AND c.%2$I <> COALESCE(r.same_id, r.other_id)
        $q$, t.child, t.fk);

                -- Ligne publiée dont le parent n'a pas de ligne côté publication : elle ne peut pas être publique
                EXECUTE format($q$
            UPDATE public.%1$I c
            SET status = 'ARCHIVED'
            FROM repoint_%1$s r
            WHERE c.id = r.cid
              AND r.side = 'P' AND r.same_id IS NULL
              AND c.status::text = 'PUBLISHED'
        $q$, t.child);
            END LOOP;

        -- Propagation des statuts parent -> enfant (pages récursivement, puis sections, puis modules)
        LOOP
            UPDATE public.pages c SET status = 'DELETED'
            FROM public.pages p
            WHERE c.parent_page_id = p.id AND c.status::text = 'DRAFT' AND p.status::text = 'DELETED';
            GET DIAGNOSTICS v_rows = ROW_COUNT;
            UPDATE public.pages c SET status = 'ARCHIVED'
            FROM public.pages p
            WHERE c.parent_page_id = p.id AND c.status::text = 'PUBLISHED' AND p.status::text = 'ARCHIVED';
            GET DIAGNOSTICS v_rows2 = ROW_COUNT;
            v_loops := v_loops + 1;
            EXIT WHEN (v_rows = 0 AND v_rows2 = 0) OR v_loops > 50;
        END LOOP;

        UPDATE public.sections c SET status = 'DELETED'
        FROM public.pages p
        WHERE c.page_id = p.id AND c.status::text = 'DRAFT' AND p.status::text = 'DELETED';
        UPDATE public.sections c SET status = 'ARCHIVED'
        FROM public.pages p
        WHERE c.page_id = p.id AND c.status::text = 'PUBLISHED' AND p.status::text = 'ARCHIVED';

        UPDATE public.modules c SET status = 'DELETED'
        FROM public.sections p
        WHERE c.section_id = p.id AND c.status::text = 'DRAFT' AND p.status::text = 'DELETED';
        UPDATE public.modules c SET status = 'ARCHIVED'
        FROM public.sections p
        WHERE c.section_id = p.id AND c.status::text = 'PUBLISHED' AND p.status::text = 'ARCHIVED';

        -- ====================================================================
        -- 5. Suppression des anciennes versions (modules -> sections -> pages)
        -- ====================================================================
        CREATE TEMP TABLE mig_old_modules ON COMMIT DROP AS
        SELECT id FROM public.modules WHERE id NOT IN (SELECT id FROM final_modules);

        -- Références vers les anciens modules qui ne sont pas en ON DELETE CASCADE
        FOREACH s IN ARRAY ARRAY ['article_id', 'news_id', 'newsletter_id', 'timeline_id']
            LOOP
                IF pg_temp.mig_has_column('contents', s) THEN
                    EXECUTE format('UPDATE public.contents SET %1$I = NULL WHERE %1$I IN (SELECT id FROM mig_old_modules)', s);
                END IF;
            END LOOP;

        IF pg_temp.mig_has_column('field', 'form_id') THEN
            DELETE FROM public.field WHERE form_id IN (SELECT id FROM mig_old_modules);
        END IF;
        IF to_regclass('public.gallery_medias') IS NOT NULL THEN
            DELETE FROM public.gallery_medias WHERE gallery_id IN (SELECT id FROM mig_old_modules);
        END IF;
        IF to_regclass('public.gallery') IS NOT NULL AND pg_temp.mig_has_column('gallery', 'id') THEN
            DELETE FROM public.gallery WHERE id IN (SELECT id FROM mig_old_modules);
        END IF;

        DELETE FROM public.modules WHERE id IN (SELECT id FROM mig_old_modules);
        DELETE FROM public.sections WHERE id NOT IN (SELECT id FROM final_sections);
        DELETE FROM public.pages WHERE id NOT IN (SELECT id FROM final_pages);

        -- ====================================================================
        -- 6. Vérification : au plus 1 ligne brouillon et 1 ligne publication par identifiant logique
        -- ====================================================================
        FOR t IN SELECT * FROM (VALUES ('pages', 'page_id'), ('sections', 'section_id'), ('modules', 'module_id')) v(tbl, lcol)
            LOOP
                EXECUTE format($q$
            SELECT count(*) FROM (
                SELECT %2$I FROM public.%1$I
                GROUP BY %2$I,
                         CASE WHEN status::text IN ('DRAFT', 'DELETED') THEN 'D' ELSE 'P' END
                HAVING count(*) > 1
            ) x
        $q$, t.tbl, t.lcol) INTO v_invalid;
                IF v_invalid > 0 THEN
                    RAISE EXCEPTION 'V19 failed: % identifiant(s) logique(s) de % ont encore plusieurs lignes du même côté', v_invalid, t.tbl;
                END IF;
            END LOOP;
    END
$mig$;

DROP FUNCTION pg_temp.mig_copy_children(text, text, text);
DROP FUNCTION pg_temp.mig_has_column(text, text);
DROP FUNCTION pg_temp.mig_cols(text, text, text[]);
