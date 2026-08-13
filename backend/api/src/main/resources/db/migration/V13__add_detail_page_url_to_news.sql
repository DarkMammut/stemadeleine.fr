-- Add detail_page_url to news for public detail links
ALTER TABLE public.news
ADD COLUMN IF NOT EXISTS detail_page_url VARCHAR(500);

COMMENT ON COLUMN public.news.detail_page_url IS 'URL de base pour les liens vers les détails des actualités (ex: /actualites)';
