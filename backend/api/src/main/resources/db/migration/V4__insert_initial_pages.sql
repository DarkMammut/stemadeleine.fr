INSERT INTO pages (id, page_id, version, name, title, sub_title, description, slug,
                   nav_position, sort_order, author_id, is_visible, created_at, updated_at)
SELECT gen_random_uuid(),             -- id unique
       gen_random_uuid(),             -- page_id unique
       1,                             -- version initiale
       'Accueil',                     -- name
       'Page d’accueil par défaut',   -- title
       'Home',                        -- sub_title
       'Bienvenue',                   -- description
       'home',                        -- slug
       'TOP',                         -- nav_position
       1,                             -- sort_order
       (SELECT id FROM users LIMIT 1),-- author_id : prendre le premier user existant
       true,                          -- is_visible : publié
       NOW(),                         -- created_at
       NOW()                          -- updated_at
WHERE NOT EXISTS (SELECT 1 FROM pages);
