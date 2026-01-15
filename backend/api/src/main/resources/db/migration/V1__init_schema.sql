-- V1__init_schema.sql

-- Extension nécessaire pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE public.publishing_status AS ENUM ('DRAFT', 'PUBLISHED', 'DELETED', 'ARCHIVED');
CREATE TYPE public.article_variants AS ENUM ('STAGGERED', 'LEFT', 'RIGHT');
CREATE TYPE public.field_input_type AS ENUM ('TEXT', 'EMAIL', 'PASSWORD', 'NUMBER', 'DATE', 'DATETIME', 'SELECT', 'CHECKBOX', 'RADIO', 'TEXTAREA', 'FILE', 'TEL', 'URL');
CREATE TYPE public.gallery_variants AS ENUM ('GRID', 'SLIDER', 'CAROUSEL');
CREATE TYPE public.cta_variants AS ENUM ('BUTTON', 'LINK');
CREATE TYPE public.news_variants AS ENUM ('LAST', 'LAST3', 'LAST5', 'ALL');
CREATE TYPE public.timeline_variants AS ENUM ('TABS', 'TEXT');
CREATE TYPE public.list_variants AS ENUM ('BULLET', 'CARD');
CREATE TYPE public.payment_status AS ENUM ('PENDING','AUTHORIZED', 'PAID', 'REFUNDED', 'CANCELED', 'FAILED', 'DELETED', 'ARCHIVED');
CREATE TYPE public.payment_type AS ENUM ('DONATION', 'MEMBERSHIP', 'EVENT', 'OTHER');
CREATE TYPE public.roles AS ENUM ('ROLE_ADMIN', 'ROLE_MODERATOR', 'ROLE_USER');

-- =====================
-- USERS
-- =====================
CREATE TABLE public.users (
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
CREATE TABLE public.media (
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
CREATE TABLE public.pages (
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
    FOREIGN KEY (author_id) REFERENCES public.users(id),
    FOREIGN KEY (parent_page_id) REFERENCES public.pages(id),
    FOREIGN KEY (hero_media_id) REFERENCES public.media(id)
);

-- =====================
-- SECTIONS
-- =====================
CREATE TABLE public.sections (
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
    FOREIGN KEY (page_id) REFERENCES public.pages(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES public.users(id),
    FOREIGN KEY (media_id) REFERENCES public.media(id)
);

-- =====================
-- BASE MODULE TABLE
-- =====================
CREATE TABLE public.modules (
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
    FOREIGN KEY (section_id) REFERENCES public.sections(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES public.users(id)
);

-- =====================
-- CONTENT
-- =====================
CREATE TABLE public.contents (
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
    FOREIGN KEY (author_id) REFERENCES public.users(id)
);

-- Index for content versioning
CREATE INDEX idx_contents_content_id_version ON public.contents(content_id, version DESC);

-- =====================
-- ARTICLES (extends Module)
-- =====================
CREATE TABLE public.articles (
                          id UUID PRIMARY KEY,
                          variant article_variants DEFAULT 'STAGGERED' NOT NULL,
                          writer VARCHAR(255),
                          writing_date DATE,
                          FOREIGN KEY (id) REFERENCES public.modules(id) ON DELETE CASCADE
);

-- =====================
-- ARTICLE CONTENT RELATIONSHIP
-- =====================
CREATE TABLE public.article_content (
    article_id UUID NOT NULL,
    content_id UUID NOT NULL,
    PRIMARY KEY (article_id, content_id),
    FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES public.contents(id) ON DELETE CASCADE
);

-- =====================
-- FIELDS
-- =====================
CREATE TABLE public.field (
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
CREATE TABLE public.form (
    id UUID PRIMARY KEY,
    description VARCHAR(1000),
    media_id UUID,
    FOREIGN KEY (id) REFERENCES public.modules(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES public.media(id)
);

-- =====================
-- FORM FIELDS RELATIONSHIP
-- =====================
CREATE TABLE public.form_fields (
    form_id UUID NOT NULL,
    field_id UUID NOT NULL,
    PRIMARY KEY (form_id, field_id),
    FOREIGN KEY (form_id) REFERENCES public.form(id) ON DELETE CASCADE,
    FOREIGN KEY (field_id) REFERENCES public.field(id) ON DELETE CASCADE
);

-- =====================
-- ACCOUNTS AND ADDRESSES
-- =====================
CREATE TABLE public.address (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID,
    owner_type VARCHAR(50),
    name VARCHAR(255),
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(100),
    post_code VARCHAR(20),
    country VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    provider VARCHAR(50) NOT NULL DEFAULT 'local',
    provider_account_id VARCHAR(255),
    role roles DEFAULT 'ROLE_USER' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    email_verified BOOLEAN DEFAULT false NOT NULL,
    billing_address_id UUID,
    shipping_address_id UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.users(id),
    FOREIGN KEY (billing_address_id) REFERENCES public.address(id),
    FOREIGN KEY (shipping_address_id) REFERENCES public.address(id),
    -- Contrainte unique pour éviter les doublons provider/provider_account_id
    UNIQUE(provider, provider_account_id)
);

-- =====================
-- NEWS (extends Module)
-- =====================
CREATE TABLE public.news (
    id UUID PRIMARY KEY,
    variant news_variants DEFAULT 'LAST3' NOT NULL,
    description TEXT,
    media_id UUID,
    FOREIGN KEY (id) REFERENCES public.modules(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES public.media(id)
);

-- =====================
-- NEWS PUBLICATIONS
-- =====================
CREATE TABLE public.news_publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    news_id UUID NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_visible BOOLEAN DEFAULT true NOT NULL,
    status publishing_status DEFAULT 'DRAFT' NOT NULL,
    /* published_date keeps time with timezone; start_date/end_date are date-only */
    published_date TIMESTAMPTZ,
    start_date DATE,
    end_date DATE,
    media_id UUID,
    author_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT news_publications_media_id_fkey FOREIGN KEY (media_id) REFERENCES public.media(id),
    CONSTRAINT news_publications_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id)
);

-- =====================
-- NEWS CONTENT RELATIONSHIP
-- =====================
CREATE TABLE public.news_content (
    news_publication_id UUID NOT NULL,
    content_id UUID NOT NULL,
    PRIMARY KEY (news_publication_id, content_id),
    FOREIGN KEY (news_publication_id) REFERENCES public.news_publications(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES public.contents(id) ON DELETE CASCADE
);

-- Indexes for news_publications and news_content
CREATE INDEX idx_news_publications_news_id ON public.news_publications(news_id);
CREATE INDEX idx_news_publications_author_id ON public.news_publications(author_id);
CREATE INDEX idx_news_publications_status ON public.news_publications(status);
CREATE INDEX idx_news_publications_published_date ON public.news_publications(published_date);
CREATE INDEX idx_news_content_news_id ON public.news_content(news_publication_id);
CREATE INDEX idx_news_content_content_id ON public.news_content(content_id);

-- =====================
-- NEWSLETTER (extends Module)
-- =====================
CREATE TABLE public.newsletters (
    id UUID PRIMARY KEY,
    variant news_variants DEFAULT 'LAST3' NOT NULL,
    description VARCHAR(1000),
    media_id UUID,
    detail_page_url VARCHAR(500),
    FOREIGN KEY (id) REFERENCES public.modules(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES public.media(id)
);

-- =====================
-- NEWSLETTER PUBLICATIONS
-- =====================
CREATE TABLE public.newsletter_publications (
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
    CONSTRAINT newsletter_publications_media_id_fkey FOREIGN KEY (media_id) REFERENCES public.media(id),
    CONSTRAINT newsletter_publications_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id)
);

-- =====================
-- NEWSLETTER CONTENT RELATIONSHIP
-- =====================
CREATE TABLE public.newsletter_content (
    newsletter_publication_id UUID NOT NULL,
    content_id UUID NOT NULL,
    PRIMARY KEY (newsletter_publication_id, content_id),
    FOREIGN KEY (newsletter_publication_id) REFERENCES public.newsletter_publications(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES public.contents(id) ON DELETE CASCADE
);

-- Indexes for newsletter_publications and newsletter_content
CREATE INDEX idx_newsletter_publications_newsletter_id ON public.newsletter_publications(newsletter_id);
CREATE INDEX idx_newsletter_publications_author_id ON public.newsletter_publications(author_id);
CREATE INDEX idx_newsletter_publications_status ON public.newsletter_publications(status);
CREATE INDEX idx_newsletter_publications_published_date ON public.newsletter_publications(published_date);
CREATE INDEX idx_newsletter_content_newsletter_id ON public.newsletter_content(newsletter_publication_id);
CREATE INDEX idx_newsletter_content_content_id ON public.newsletter_content(content_id);

-- =====================
-- GALLERY (extends Module)
-- =====================
CREATE TABLE public.galleries (
    id UUID PRIMARY KEY,
    variant gallery_variants DEFAULT 'GRID' NOT NULL,
    description VARCHAR(1000),
    FOREIGN KEY (id) REFERENCES public.modules(id) ON DELETE CASCADE
);

-- =====================
-- GALLERY MEDIA RELATIONSHIP
-- =====================
CREATE TABLE public.gallery_media (
    gallery_id UUID NOT NULL,
    media_id UUID NOT NULL,
    sort_order INTEGER,
    PRIMARY KEY (gallery_id, media_id),
    FOREIGN KEY (gallery_id) REFERENCES public.galleries(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES public.media(id) ON DELETE CASCADE
);

-- =====================
-- TIMELINE (extends Module)
-- =====================
CREATE TABLE public.timelines (
    id UUID PRIMARY KEY,
    variant timeline_variants DEFAULT 'TABS' NOT NULL,
    FOREIGN KEY (id) REFERENCES public.modules(id) ON DELETE CASCADE
);

-- =====================
-- CAMPAIGNS
-- =====================
CREATE TABLE public.campaigns (
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
CREATE TABLE public.cta (
    id UUID PRIMARY KEY,
    variant cta_variants DEFAULT 'BUTTON' NOT NULL,
    label VARCHAR(255) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    FOREIGN KEY (id) REFERENCES public.modules(id) ON DELETE CASCADE
);

-- =====================
-- CONTENT MEDIA
-- =====================
CREATE TABLE public.content_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL,
    media_id UUID NOT NULL,
    sort_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (content_id) REFERENCES public.contents(id),
    FOREIGN KEY (media_id) REFERENCES public.media(id)
);

-- =====================
-- LISTS (extends Module)
-- =====================
-- SECTION CONTENT RELATIONSHIP
-- =====================
CREATE TABLE public.section_content (
    section_id UUID NOT NULL,
    content_id UUID NOT NULL,
    PRIMARY KEY (section_id, content_id),
    FOREIGN KEY (section_id) REFERENCES public.sections(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES public.contents(id) ON DELETE CASCADE
);

-- =====================
CREATE TABLE public.lists (
    id UUID PRIMARY KEY,
    variant list_variants DEFAULT 'CARD' NOT NULL,
    FOREIGN KEY (id) REFERENCES public.modules(id) ON DELETE CASCADE
);

-- =====================
-- MEMBERSHIPS
-- =====================
CREATE TABLE public.memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date_adhesion DATE NOT NULL,
    date_fin DATE,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =====================
-- PAYMENTS
-- =====================
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    hello_asso_payment_id VARCHAR(255),
    amount DOUBLE PRECISION,
    currency VARCHAR(10) DEFAULT 'EUR',
    payment_date DATE,
    status payment_status NOT NULL DEFAULT 'PENDING',
    form_slug VARCHAR(255),
    type payment_type NOT NULL DEFAULT 'MEMBERSHIP',
    receipt_url VARCHAR(1000)
);

-- Index pour accélérer les recherches par hello_asso_payment_id
CREATE INDEX idx_payments_hello_asso_payment_id ON public.payments(hello_asso_payment_id);

-- Add indexes for performance
CREATE INDEX idx_modules_section_id ON public.modules(section_id);
CREATE INDEX idx_pages_page_id ON public.pages(page_id);
CREATE INDEX idx_sections_section_id ON public.sections(section_id);
CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX idx_content_media_content_id ON public.content_media(content_id);
CREATE INDEX idx_content_media_media_id ON public.content_media(media_id);
CREATE INDEX idx_gallery_media_sort ON public.gallery_media(sort_order);

-- =====================
-- ORGANIZATION SETTINGS
-- =====================
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    legal_form VARCHAR(100),
    siret VARCHAR(20),
    siren VARCHAR(20),
    vat_number VARCHAR(50),
    ape_code VARCHAR(20),
    creation_date DATE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    logo_media_id UUID REFERENCES public.media(id),
    primary_color VARCHAR(20),
    secondary_color VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- In case the schema is applied incrementally or an older DB exists, ensure accounts.is_active exists
ALTER TABLE public.accounts
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- End of migration
