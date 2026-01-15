-- Insert Home page
WITH home_page AS (
    SELECT uuid_generate_v4() as new_id
)
INSERT INTO public.pages (id, page_id, name, slug, title, sub_title, description,
                   status, version, author_id, is_visible, sort_order, created_at, updated_at)
SELECT new_id,                                          -- id
       new_id,                                          -- page_id (même que id pour la première version)
       'Accueil',                                       -- name
       '/',                                             -- slug
       'Accueil - Sainte Madeleine',                    -- title
       NULL,                                            -- sub_title
       'Page d''accueil de l''église Sainte Madeleine', -- description
       'PUBLISHED',                                     -- status
       1,                                               -- version
       (SELECT id FROM public.users LIMIT 1),                  -- author_id
       true,                                            -- is_visible
       0,                                               -- sort_order
       NOW(),                                           -- created_at
       NOW()                                            -- updated_at
FROM home_page
WHERE NOT EXISTS (SELECT 1 FROM public.pages WHERE slug = '/');

-- Insert Contact page
WITH contact_page AS (
    SELECT uuid_generate_v4() as new_id
)
INSERT INTO public.pages (id, page_id, name, slug, title, sub_title, description,
                   status, version, author_id, is_visible, sort_order, created_at, updated_at)
SELECT new_id,                                          -- id
       new_id,                                          -- page_id (même que id pour la première version)
       'Contact',                                       -- name
       '/contact',                                      -- slug
       'Contact - Sainte Madeleine',                    -- title
       'Nous contacter',                                -- sub_title
       'Page de contact pour joindre l''église Sainte Madeleine', -- description
       'PUBLISHED',                                     -- status
       1,                                               -- version
       (SELECT id FROM public.users LIMIT 1),                  -- author_id
       true,                                            -- is_visible
       1,                                               -- sort_order
       NOW(),                                           -- created_at
       NOW()                                            -- updated_at
FROM contact_page
WHERE NOT EXISTS (SELECT 1 FROM public.pages WHERE slug = '/contact');
