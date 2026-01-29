-- V9__add_favicon_to_organizations.sql
-- Add favicon_media_id column to organizations table

ALTER TABLE public.organizations
    ADD COLUMN IF NOT EXISTS favicon_media_id UUID REFERENCES public.media(id);

COMMENT ON COLUMN public.organizations.favicon_media_id IS 'Reference to the media file used as favicon for the organization';
