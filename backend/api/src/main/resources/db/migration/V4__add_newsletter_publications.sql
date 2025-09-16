-- V4__add_newsletter_publications.sql
-- Add newsletter publications tables for actual newsletter content

-- =====================
-- NEWSLETTER PUBLICATIONS
-- =====================
CREATE TABLE newsletter_publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    newsletter_id UUID NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_visible BOOLEAN DEFAULT true NOT NULL,
    status publishing_status DEFAULT 'DRAFT' NOT NULL,
    published_date TIMESTAMPTZ,
    media_id UUID,
    author_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT newsletter_publications_media_id_fkey FOREIGN KEY (media_id) REFERENCES media(id),
    CONSTRAINT newsletter_publications_author_id_fkey FOREIGN KEY (author_id) REFERENCES users(id)
);

-- =====================
-- NEWSLETTER CONTENT RELATIONSHIP
-- =====================
CREATE TABLE newsletter_content (
    newsletter_publication_id UUID NOT NULL,
    content_id UUID NOT NULL,
    PRIMARY KEY (newsletter_publication_id, content_id),
    FOREIGN KEY (newsletter_publication_id) REFERENCES newsletter_publications(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX idx_newsletter_publications_newsletter_id ON newsletter_publications(newsletter_id);
CREATE INDEX idx_newsletter_publications_author_id ON newsletter_publications(author_id);
CREATE INDEX idx_newsletter_publications_status ON newsletter_publications(status);
CREATE INDEX idx_newsletter_publications_published_date ON newsletter_publications(published_date);
CREATE INDEX idx_newsletter_content_newsletter_id ON newsletter_content(newsletter_publication_id);
CREATE INDEX idx_newsletter_content_content_id ON newsletter_content(content_id);
