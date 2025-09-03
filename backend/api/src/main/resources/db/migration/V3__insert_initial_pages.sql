WITH new_page AS (
    SELECT gen_random_uuid() as new_id
)
INSERT INTO pages (id, page_id, name, slug, title, sub_title, description,
                   status, version, author_id, is_visible, created_at, updated_at)
SELECT new_id,                                          -- id
       new_id,                                          -- page_id (même que id pour la première version)
       'Accueil',                                       -- name
       '/',                                             -- slug
       'Accueil - Sainte Madeleine',                    -- title
       NULL,                                            -- sub_title
       'Page d''accueil de l''église Sainte Madeleine', -- description
       'DRAFT',                                         -- status
       1,                                               -- version
       (SELECT id FROM users LIMIT 1),                  -- author_id
       true,                                            -- is_visible
       NOW(),                                           -- created_at
       NOW()                                            -- updated_at
FROM new_page
WHERE NOT EXISTS (SELECT 1 FROM pages);
