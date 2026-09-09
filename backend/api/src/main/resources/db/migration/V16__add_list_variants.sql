-- Ajout des variantes COLUMN (affichage en colonnes) et NAV_CARD (cartes simples de navigation)
ALTER TYPE public.list_variants ADD VALUE IF NOT EXISTS 'COLUMN';
ALTER TYPE public.list_variants ADD VALUE IF NOT EXISTS 'NAV_CARD';
