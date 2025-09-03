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

-- =====================
-- USERS
-- =====================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =====================
-- PAGES
-- =====================
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    sub_title VARCHAR(255),
    description TEXT,
    is_visible BOOLEAN DEFAULT false NOT NULL,
    status publishing_status DEFAULT 'DRAFT' NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    author_id UUID,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- =====================
-- SECTIONS
-- =====================
CREATE TABLE sections (
                          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                          page_id UUID NOT NULL,
                          parent_id UUID,
                          name VARCHAR(255) NOT NULL,
                          sort_order INTEGER,
                          is_visible BOOLEAN DEFAULT true NOT NULL,
                          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                          FOREIGN KEY (parent_id) REFERENCES sections(id) ON DELETE CASCADE
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
                         created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                         updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                         author_id UUID,
                         FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
                         FOREIGN KEY (author_id) REFERENCES users(id)
);

-- =====================
-- MEDIA
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
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =====================
-- CONTENT
-- =====================
CREATE TABLE contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    description TEXT,
    media_id UUID,
    sort_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (media_id) REFERENCES media(id)
);

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
    provider VARCHAR(50) NOT NULL,
    provider_account_id VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    billing_address_id UUID,
    shipping_address_id UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (billing_address_id) REFERENCES address(id),
    FOREIGN KEY (shipping_address_id) REFERENCES address(id)
);

-- =====================
-- NEWS (extends Module)
-- =====================
CREATE TABLE news (
    id UUID PRIMARY KEY,
    variant news_variants DEFAULT 'LAST3' NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    media_id UUID,
    FOREIGN KEY (id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media(id)
);

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
    variant VARCHAR(50) DEFAULT 'TABS' NOT NULL,
    FOREIGN KEY (id) REFERENCES modules(id) ON DELETE CASCADE
);

-- =====================
-- DONATION CAMPAIGNS
-- =====================
CREATE TABLE donation_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    goal_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
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
CREATE TABLE lists (
    id UUID PRIMARY KEY,
    variant VARCHAR(50),
    FOREIGN KEY (id) REFERENCES modules(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX idx_modules_section_id ON modules(section_id);
CREATE INDEX idx_content_media_id ON contents(media_id);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_news_status ON news(id);
CREATE INDEX idx_gallery_media_sort ON gallery_media(sort_order);
