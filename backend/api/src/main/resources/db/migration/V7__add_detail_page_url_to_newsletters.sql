-- Migration V7: Ajout de la colonne detail_page_url à la table newsletters
-- Cette colonne stocke l'URL de base pour les liens vers les détails des newsletters

-- Ajouter la colonne detail_page_url si elle n'existe pas déjà
ALTER TABLE public.newsletters
ADD COLUMN IF NOT EXISTS detail_page_url VARCHAR(500);

-- Commenter la colonne pour documentation
COMMENT ON COLUMN public.newsletters.detail_page_url IS 'URL de base pour les liens vers les détails des newsletters (ex: /newsletters, /paroisse/newsletters)';

