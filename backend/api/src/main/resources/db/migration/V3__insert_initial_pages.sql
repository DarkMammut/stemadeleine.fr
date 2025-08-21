INSERT INTO pages (id, title, sub_title, description, slug, nav_position, sort_order, is_visible, created_at,
                   updated_at)
SELECT gen_random_uuid(),
       'Home',
       'Bienvenue',
       'Page d’accueil par défaut',
       'home',
       'TOP',
       1,
       true,
       NOW(),
       NOW()
WHERE NOT EXISTS (SELECT 1 FROM pages);