-- Add pdf_file_id column to newsletter_publications to support PDF attachments
ALTER TABLE newsletter_publications
    ADD COLUMN pdf_file_id UUID,
    ADD CONSTRAINT newsletter_publications_pdf_file_id_fkey
        FOREIGN KEY (pdf_file_id) REFERENCES media(id);
