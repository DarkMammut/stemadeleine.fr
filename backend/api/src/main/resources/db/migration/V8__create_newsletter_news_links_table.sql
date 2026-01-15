-- Create newsletter_news_links junction table for many-to-many relationship
-- between newsletter_publications and news_publications

CREATE TABLE IF NOT EXISTS newsletter_news_links (
    newsletter_publication_id UUID NOT NULL,
    news_publication_id UUID NOT NULL,
    PRIMARY KEY (newsletter_publication_id, news_publication_id),
    CONSTRAINT fk_newsletter_publication
        FOREIGN KEY (newsletter_publication_id)
        REFERENCES public.newsletter_publications(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_news_publication
        FOREIGN KEY (news_publication_id)
        REFERENCES public.news_publications(id)
        ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_newsletter_news_links_newsletter
    ON newsletter_news_links(newsletter_publication_id);

CREATE INDEX IF NOT EXISTS idx_newsletter_news_links_news
    ON newsletter_news_links(news_publication_id);

