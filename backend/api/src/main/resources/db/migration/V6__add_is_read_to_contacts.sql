-- Add is_read column to contacts table
ALTER TABLE contacts
    ADD COLUMN is_read BOOLEAN DEFAULT FALSE;

-- Set all existing contacts to unread
UPDATE contacts
SET is_read = FALSE
WHERE is_read IS NULL;

