ALTER TABLE public.organizations
    ADD COLUMN IF NOT EXISTS accent_color VARCHAR(20),
    ADD COLUMN IF NOT EXISTS text_color VARCHAR(20);

UPDATE public.organizations
SET accent_color = COALESCE(accent_color, secondary_color),
    text_color = COALESCE(text_color, '#1A1208');
