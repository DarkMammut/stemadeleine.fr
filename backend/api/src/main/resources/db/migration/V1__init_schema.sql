-- V1__init_schema.sql

-- Extension nécessaire pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE publishing_status AS ENUM ('DRAFT', 'PUBLISHED', 'DELETED', 'ARCHIVED');
CREATE TYPE article_variants AS ENUM ('STAGGERED', 'LEFT', 'RIGHT');
CREATE TYPE field_input_type AS ENUM ('TEXT', 'EMAIL', 'PASSWORD', 'NUMBER', 'DATE', 'DATETIME', 'SELECT', 'CHECKBOX', 'RADIO', 'TEXTAREA', 'FILE', 'TEL', 'URL');
CREATE TYPE gallery_variants AS ENUM ('GRID', 'SLIDER', 'CAROUSEL');
CREATE TYPE cta_variants AS ENUM ('BUTTON', 'LINK');
CREATE TYPE news_variants AS ENUM ('LAST', 'LAST3', 'LAST5', 'ALL');
CREATE TYPE timeline_variants AS ENUM ('TABS', 'TEXT');
CREATE TYPE list_variants AS ENUM ('BULLET', 'CARD');

-- =====================
-- USERS
-- =====================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    email VARCHAR(255),
    phone_mobile VARCHAR(50),
    phone_landline VARCHAR(50),
    newsletter BOOLEAN,
    birth_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =====================
-- MEDIA (déplacé avant PAGES car PAGES y fait référence)
-- =====================
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_url VARCHAR(1000) NOT NULL,
    title VARCHAR(255),
    alt_text VARCHAR(255),
    file_type VARCHAR(100),
    file_size INTEGER,
    is_visible BOOLEAN DEFAULT true NOT NULL,
    sort_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    owner_id UUID
);

-- =====================
-- PAGES
-- =====================
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    sub_title VARCHAR(255),
    description TEXT,
    is_visible BOOLEAN DEFAULT false NOT NULL,
    status publishing_status DEFAULT 'DRAFT' NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER,
    parent_page_id UUID,
    hero_media_id UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    author_id UUID NOT NULL,
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (parent_page_id) REFERENCES pages(id),
    FOREIGN KEY (hero_media_id) REFERENCES media(id)
);

-- =====================
-- SECTIONS
-- =====================
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL,
    page_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    sort_order INTEGER,
    is_visible BOOLEAN DEFAULT true NOT NULL,
    status publishing_status DEFAULT 'DRAFT' NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    media_id UUID,
    author_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (media_id) REFERENCES media(id)
);

-- =====================
-- BASE MODULE TABLE
-- =====================
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    section_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    sort_order INTEGER,
    is_visible BOOLEAN DEFAULT true NOT NULL,
    status publishing_status DEFAULT 'DRAFT' NOT NULL,
    author_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- =====================
-- CONTENT
-- =====================
CREATE TABLE contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL,
    title VARCHAR(255),
    description TEXT,
    body JSONB,
    sort_order INTEGER,
    is_visible BOOLEAN DEFAULT true NOT NULL,
    owner_id UUID,
    status publishing_status DEFAULT 'DRAFT' NOT NULL,
    version INTEGER DEFAULT 1 NOT NULL,
    author_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Index for content versioning
CREATE INDEX idx_contents_content_id_version ON contents(content_id, version DESC);

-- =====================
-- ARTICLES (extends Module)
-- =====================
CREATE TABLE articles (
                          id UUID PRIMARY KEY,
                          variant article_variants DEFAULT 'STAGGERED' NOT NULL,
                          FOREIGN KEY (id) REFERENCES modules(id) ON DELETE CASCADE
);

-- =====================
-- ARTICLE CONTENT RELATIONSHIP
-- =====================
CREATE TABLE article_content (
    article_id UUID NOT NULL,
    content_id UUID NOT NULL,
    PRIMARY KEY (article_id, content_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
);

-- =====================
-- FIELDS
-- =====================
CREATE TABLE field (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(255) NOT NULL,
    input_type field_input_type NOT NULL,
    required BOOLEAN DEFAULT false NOT NULL,
    placeholder VARCHAR(255),
    default_value VARCHAR(255),
    options VARCHAR(1000),
    sort_order INTEGER,
    help_text VARCHAR(1000),
    is_visible BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =====================
-- FORMS (extends Module)
-- =====================
CREATE TABLE form (
    id UUID PRIMARY KEY,
    description VARCHAR(1000),
    media_id UUID,
    FOREIGN KEY (id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media(id)
);

-- =====================
-- FORM FIELDS RELATIONSHIP
-- =====================
CREATE TABLE form_fields (
    form_id UUID NOT NULL,
    field_id UUID NOT NULL,
    PRIMARY KEY (form_id, field_id),
    FOREIGN KEY (form_id) REFERENCES form(id) ON DELETE CASCADE,
    FOREIGN KEY (field_id) REFERENCES field(id) ON DELETE CASCADE
);

-- =====================
-- ACCOUNTS AND ADDRESSES
-- =====================
CREATE TABLE address (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    street_address VARCHAR(255) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    provider VARCHAR(50) NOT NULL DEFAULT 'local',
    provider_account_id VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',
    is_active BOOLEAN DEFAULT true NOT NULL,
    email_verified BOOLEAN DEFAULT false NOT NULL,
    billing_address_id UUID,
    shipping_address_id UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (billing_address_id) REFERENCES address(id),
    FOREIGN KEY (shipping_address_id) REFERENCES address(id),
    -- Contrainte unique pour éviter les doublons provider/provider_account_id
    UNIQUE(provider, provider_account_id)
);

-- =====================
-- NEWS (extends Module)
-- =====================
CREATE TABLE news (
    id UUID PRIMARY KEY,
    variant news_variants DEFAULT 'LAST3' NOT NULL,
    description TEXT,
    media_id UUID,
    FOREIGN KEY (id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media(id)
);

-- =====================
-- NEWS PUBLICATIONS
-- =====================
CREATE TABLE news_publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    news_id UUID NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_visible BOOLEAN DEFAULT true NOT NULL,
    status publishing_status DEFAULT 'DRAFT' NOT NULL,
    published_date TIMESTAMPTZ,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    media_id UUID,
    author_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT news_publications_media_id_fkey FOREIGN KEY (media_id) REFERENCES media(id),
    CONSTRAINT news_publications_author_id_fkey FOREIGN KEY (author_id) REFERENCES users(id)
);

-- =====================
-- NEWS CONTENT RELATIONSHIP
-- =====================
CREATE TABLE news_content (
    news_publication_id UUID NOT NULL,
    content_id UUID NOT NULL,
    PRIMARY KEY (news_publication_id, content_id),
    FOREIGN KEY (news_publication_id) REFERENCES news_publications(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
);

-- Indexes for news_publications and news_content
CREATE INDEX idx_news_publications_news_id ON news_publications(news_id);
CREATE INDEX idx_news_publications_author_id ON news_publications(author_id);
CREATE INDEX idx_news_publications_status ON news_publications(status);
CREATE INDEX idx_news_publications_published_date ON news_publications(published_date);
CREATE INDEX idx_news_content_news_id ON news_content(news_publication_id);
CREATE INDEX idx_news_content_content_id ON news_content(content_id);

-- =====================
-- NEWSLETTER (extends Module)
-- =====================
CREATE TABLE newsletters (
    id UUID PRIMARY KEY,
    variant news_variants DEFAULT 'LAST3' NOT NULL,
    description VARCHAR(1000),
    media_id UUID,
    FOREIGN KEY (id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media(id)
);

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

-- Indexes for newsletter_publications and newsletter_content
CREATE INDEX idx_newsletter_publications_newsletter_id ON newsletter_publications(newsletter_id);
CREATE INDEX idx_newsletter_publications_author_id ON newsletter_publications(author_id);
CREATE INDEX idx_newsletter_publications_status ON newsletter_publications(status);
CREATE INDEX idx_newsletter_publications_published_date ON newsletter_publications(published_date);
CREATE INDEX idx_newsletter_content_newsletter_id ON newsletter_content(newsletter_publication_id);
CREATE INDEX idx_newsletter_content_content_id ON newsletter_content(content_id);

-- =====================
-- GALLERY (extends Module)
-- =====================
CREATE TABLE galleries (
    id UUID PRIMARY KEY,
    variant gallery_variants DEFAULT 'GRID' NOT NULL,
    description VARCHAR(1000),
    FOREIGN KEY (id) REFERENCES modules(id) ON DELETE CASCADE
);

-- =====================
-- GALLERY MEDIA RELATIONSHIP
-- =====================
CREATE TABLE gallery_media (
    gallery_id UUID NOT NULL,
    media_id UUID NOT NULL,
    sort_order INTEGER,
    PRIMARY KEY (gallery_id, media_id),
    FOREIGN KEY (gallery_id) REFERENCES galleries(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
);

-- =====================
-- TIMELINE (extends Module)
-- =====================
CREATE TABLE timelines (
    id UUID PRIMARY KEY,
    variant timeline_variants DEFAULT 'TABS' NOT NULL,
    FOREIGN KEY (id) REFERENCES modules(id) ON DELETE CASCADE
);

-- =====================
-- CAMPAIGNS
-- =====================
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_slug VARCHAR(255),
    form_type VARCHAR(255),
    state VARCHAR(255),
    currency VARCHAR(10),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(1000) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =====================
-- CTA (extends Module)
-- =====================
CREATE TABLE cta (
    id UUID PRIMARY KEY,
    variant cta_variants DEFAULT 'BUTTON' NOT NULL,
    label VARCHAR(255) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    FOREIGN KEY (id) REFERENCES modules(id) ON DELETE CASCADE
);

-- =====================
-- USER ADDRESSES
-- =====================
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    address_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (address_id) REFERENCES address(id)
);

-- =====================
-- CONTENT MEDIA
-- =====================
CREATE TABLE content_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL,
    media_id UUID NOT NULL,
    sort_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (content_id) REFERENCES contents(id),
    FOREIGN KEY (media_id) REFERENCES media(id)
);

-- =====================
-- LISTS (extends Module)
-- =====================
-- SECTION CONTENT RELATIONSHIP
-- =====================
CREATE TABLE section_content (
    section_id UUID NOT NULL,
    content_id UUID NOT NULL,
    PRIMARY KEY (section_id, content_id),
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
);

-- =====================
CREATE TABLE lists (
    id UUID PRIMARY KEY,
    variant list_variants DEFAULT 'CARD' NOT NULL,
    FOREIGN KEY (id) REFERENCES modules(id) ON DELETE CASCADE
);

-- =====================
-- MEMBERSHIPS
-- =====================
CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_adhesion DATE NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    date_fin DATE
);

-- =====================
-- PAYMENTS
-- =====================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hello_asso_payment_id VARCHAR(255),
    user_id UUID,
    amount DOUBLE PRECISION,
    currency VARCHAR(10),
    payment_date DATE,
    status VARCHAR(50),
    form_slug VARCHAR(255),
    type VARCHAR(50),
    receipt_url VARCHAR(1000),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
-- Index pour accélérer les recherches par hello_asso_payment_id
CREATE INDEX idx_payments_hello_asso_payment_id ON payments(hello_asso_payment_id);

-- Add indexes for performance
CREATE INDEX idx_modules_section_id ON modules(section_id);
CREATE INDEX idx_pages_page_id ON pages(page_id);
CREATE INDEX idx_sections_section_id ON sections(section_id);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_content_media_content_id ON content_media(content_id);
CREATE INDEX idx_content_media_media_id ON content_media(media_id);
CREATE INDEX idx_gallery_media_sort ON gallery_media(sort_order);
