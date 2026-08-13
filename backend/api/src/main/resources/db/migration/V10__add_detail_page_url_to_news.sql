-- Migration V10: Ajout de la colonne detail_page_url à la table news
-- Cette colonne stocke l'URL de base pour les liens vers les détails des actualités

ALTER TABLE public.news
ADD COLUMN IF NOT EXISTS detail_page_url VARCHAR(500);

COMMENT ON COLUMN public.news.detail_page_url IS 'URL de base pour les liens vers les détails des actualités (ex: /actualites)';

