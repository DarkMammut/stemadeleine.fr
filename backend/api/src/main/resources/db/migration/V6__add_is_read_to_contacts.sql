-- Add is_read column to contacts table
ALTER TABLE public.contacts
    ADD COLUMN is_read BOOLEAN DEFAULT FALSE;

-- Set all existing contacts to unread
UPDATE public.contacts
SET is_read = FALSE
WHERE is_read IS NULL;

